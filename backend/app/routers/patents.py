import os
import shutil
import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional

from app.database import get_db
from app import models, schemas, auth
from app.config import settings
from app.ai.ai_engine import categorizer_engine, risk_engine

router = APIRouter(prefix="/api/patents", tags=["patents"])

@router.get("", response_model=List[schemas.PatentResponse])
def get_patents(
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
    department_id: Optional[int] = None,
    domain_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.Patent)
    
    # RBAC: Faculty/Inventor can only view their own department's patents
    # (or they can view all, but as standard let's allow faculty to view all but only edit their own,
    # or restrict view as per specifications: "Faculty: View assigned patent records". Let's allow them to search
    # department-wide patents or patents where they are listed as an inventor).
    if current_user.role == "faculty_inventor":
        # Let's filter to their department for general listing
        if current_user.department_id:
            query = query.filter(models.Patent.department_id == current_user.department_id)
    elif current_user.role == "department_coordinator":
        # Coordinator restricted to their department
        if current_user.department_id:
            query = query.filter(models.Patent.department_id == current_user.department_id)
            
    # Filters
    if status_filter:
        query = query.filter(models.Patent.status == status_filter)
    if department_id:
        query = query.filter(models.Patent.department_id == department_id)
    if domain_filter:
        query = query.filter(models.Patent.domain == domain_filter)
    if search:
        query = query.filter(
            or_(
                models.Patent.title.ilike(f"%{search}%"),
                models.Patent.application_number.ilike(f"%{search}%"),
                models.Patent.publication_number.ilike(f"%{search}%"),
                models.Patent.grant_number.ilike(f"%{search}%"),
                models.Patent.description.ilike(f"%{search}%")
            )
        )
        
    return query.order_by(models.Patent.created_at.desc()).all()

@router.get("/{id}", response_model=schemas.PatentDetailResponse)
def get_patent_detail(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    patent = db.query(models.Patent).filter(models.Patent.id == id).first()
    if not patent:
        raise HTTPException(status_code=404, detail="Patent not found")
        
    # Access checks
    if current_user.role in ["department_coordinator", "faculty_inventor"]:
        if current_user.department_id and patent.department_id != current_user.department_id:
            raise HTTPException(status_code=403, detail="Access denied to this department's patents")
            
    return patent

@router.post("", response_model=schemas.PatentResponse)
def create_patent(
    patent_in: schemas.PatentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.RoleChecker(["super_admin", "department_coordinator", "faculty_inventor"]))
):
    # If Coordinator or Faculty, bind to their department automatically
    dept_id = patent_in.department_id
    if current_user.role in ["department_coordinator", "faculty_inventor"]:
        if current_user.department_id:
            dept_id = current_user.department_id
            
    # AI Automatic Domain Categorization if not specified
    domain = patent_in.domain
    if not domain or domain.strip() == "":
        predicted_domain, confidence = categorizer_engine.predict(patent_in.title, patent_in.description)
        if confidence > 0.4:
            domain = predicted_domain
        else:
            domain = "General Technology"

    patent = models.Patent(
        title=patent_in.title,
        application_number=patent_in.application_number,
        publication_number=patent_in.publication_number,
        grant_number=patent_in.grant_number,
        domain=domain,
        category=patent_in.category,
        description=patent_in.description,
        status=patent_in.status,
        filing_date=patent_in.filing_date,
        publication_date=patent_in.publication_date,
        grant_date=patent_in.grant_date,
        department_id=dept_id
    )
    db.add(patent)
    db.commit()
    db.refresh(patent)
    
    # Add Inventors
    for inv_in in patent_in.inventors:
        inv = models.PatentInventor(
            patent_id=patent.id,
            user_id=inv_in.user_id,
            inventor_name=inv_in.inventor_name,
            is_primary=inv_in.is_primary
        )
        db.add(inv)
        
    # Add Initial History
    history = models.PatentStatusHistory(
        patent_id=patent.id,
        status=patent.status,
        notes="Patent record created.",
        updated_by=current_user.id
    )
    db.add(history)
    db.commit()
    
    return patent

@router.put("/{id}", response_model=schemas.PatentResponse)
def update_patent(
    id: int,
    patent_in: schemas.PatentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.RoleChecker(["super_admin", "department_coordinator", "faculty_inventor"]))
):
    patent = db.query(models.Patent).filter(models.Patent.id == id).first()
    if not patent:
        raise HTTPException(status_code=404, detail="Patent not found")
        
    # Access checks
    if current_user.role in ["department_coordinator", "faculty_inventor"]:
        if current_user.department_id and patent.department_id != current_user.department_id:
            raise HTTPException(status_code=403, detail="Access denied")
            
    # Update fields
    update_dict = patent_in.model_dump(exclude_unset=True)
    
    # If status is updated, also write history
    status_changed = False
    old_status = patent.status
    if "status" in update_dict and update_dict["status"] != old_status:
        status_changed = True
        new_status = update_dict["status"]
        
    for field, val in update_dict.items():
        setattr(patent, field, val)
        
    patent.updated_at = datetime.datetime.utcnow()
    db.commit()
    
    if status_changed:
        history = models.PatentStatusHistory(
            patent_id=patent.id,
            status=new_status,
            notes=f"Status updated from '{old_status}' to '{new_status}'.",
            updated_by=current_user.id
        )
        db.add(history)
        
        # Trigger an in-app notification for coordinators and primary inventors
        coord_users = db.query(models.User).filter(
            models.User.department_id == patent.department_id,
            models.User.role == "department_coordinator"
        ).all()
        for c in coord_users:
            notif = models.Notification(
                user_id=c.id,
                title="Patent Status Updated",
                message=f"Patent '{patent.title}' transitioned to '{new_status}' status."
            )
            db.add(notif)
            
        db.commit()
        
    db.refresh(patent)
    return patent

@router.post("/{id}/status", response_model=schemas.PatentResponse)
def transition_patent_status(
    id: int,
    status_val: str = Form(...),
    notes: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.RoleChecker(["super_admin", "department_coordinator", "faculty_inventor"]))
):
    patent = db.query(models.Patent).filter(models.Patent.id == id).first()
    if not patent:
        raise HTTPException(status_code=404, detail="Patent not found")
        
    if current_user.role in ["department_coordinator", "faculty_inventor"]:
        if current_user.department_id and patent.department_id != current_user.department_id:
            raise HTTPException(status_code=403, detail="Access denied")
            
    old_status = patent.status
    patent.status = status_val
    patent.updated_at = datetime.datetime.utcnow()
    
    # Auto-adjust dates based on status transitions
    today = datetime.date.today()
    if status_val == "Patent Filed" and not patent.filing_date:
        patent.filing_date = today
    elif status_val == "Published" and not patent.publication_date:
        patent.publication_date = today
    elif status_val == "Granted" and not patent.grant_date:
        patent.grant_date = today

    history = models.PatentStatusHistory(
        patent_id=patent.id,
        status=status_val,
        notes=notes or f"Status transitioned from '{old_status}' to '{status_val}'.",
        updated_by=current_user.id
    )
    db.add(history)
    
    # Notify department coordinators & inventors
    invs = db.query(models.PatentInventor).filter(models.PatentInventor.patent_id == patent.id).all()
    notified_users = set()
    for inv in invs:
        if inv.user_id:
            notified_users.add(inv.user_id)
            
    coords = db.query(models.User).filter(
        models.User.department_id == patent.department_id,
        models.User.role == "department_coordinator"
    ).all()
    for c in coords:
        notified_users.add(c.id)
        
    for user_id in notified_users:
        if user_id != current_user.id:
            notif = models.Notification(
                user_id=user_id,
                title="Patent Status Transitioned",
                message=f"'{patent.title}' status changed to '{status_val}' by {current_user.full_name}."
            )
            db.add(notif)
            
    db.commit()
    db.refresh(patent)
    return patent

# Document Upload and Download
@router.post("/{id}/documents", response_model=schemas.DocumentResponse)
def upload_patent_document(
    id: int,
    document_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.RoleChecker(["super_admin", "department_coordinator", "faculty_inventor"]))
):
    patent = db.query(models.Patent).filter(models.Patent.id == id).first()
    if not patent:
        raise HTTPException(status_code=404, detail="Patent not found")
        
    if current_user.role in ["department_coordinator", "faculty_inventor"]:
        if current_user.department_id and patent.department_id != current_user.department_id:
            raise HTTPException(status_code=403, detail="Access denied")
            
    # Create target path
    filename = f"patent_{patent.id}_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Check if there is an existing document of this type to increment version
    existing = db.query(models.PatentDocument).filter(
        models.PatentDocument.patent_id == patent.id,
        models.PatentDocument.document_type == document_type
    ).order_by(models.PatentDocument.version.desc()).first()
    
    version = (existing.version + 1) if existing else 1
    
    doc = models.PatentDocument(
        patent_id=patent.id,
        document_type=document_type,
        filename=file.filename,
        filepath=filepath,
        uploaded_by=current_user.id,
        version=version
    )
    db.add(doc)
    
    # Audit log of file upload
    history = models.PatentStatusHistory(
        patent_id=patent.id,
        status=patent.status,
        notes=f"Document '{file.filename}' of type '{document_type}' (v{version}) uploaded.",
        updated_by=current_user.id
    )
    db.add(history)
    db.commit()
    db.refresh(doc)
    
    return doc

@router.get("/{id}/documents/{doc_id}/download")
def download_patent_document(
    id: int,
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    patent = db.query(models.Patent).filter(models.Patent.id == id).first()
    if not patent:
        raise HTTPException(status_code=404, detail="Patent not found")
        
    if current_user.role in ["department_coordinator", "faculty_inventor"]:
        if current_user.department_id and patent.department_id != current_user.department_id:
            raise HTTPException(status_code=403, detail="Access denied")
            
    doc = db.query(models.PatentDocument).filter(
        models.PatentDocument.id == doc_id,
        models.PatentDocument.patent_id == patent.id
    ).first()
    
    if not doc or not os.path.exists(doc.filepath):
        raise HTTPException(status_code=404, detail="Document file not found on disk")
        
    return FileResponse(
        path=doc.filepath,
        filename=doc.filename,
        media_type="application/octet-stream"
    )

# AI Categorize helpers
@router.post("/ai-categorize", response_model=schemas.AIDomainSuggestion)
def suggest_domain(
    title: str = Form(...),
    description: Optional[str] = Form(None)
):
    domain, confidence = categorizer_engine.predict(title, description or "")
    return {"predicted_domain": domain, "confidence": confidence}

# AI Risk Assessment endpoint
@router.get("/{id}/ai-risk", response_model=schemas.RiskDetail)
def get_ai_risk_assessment(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    patent = db.query(models.Patent).filter(models.Patent.id == id).first()
    if not patent:
        raise HTTPException(status_code=404, detail="Patent not found")
        
    if current_user.role in ["department_coordinator", "faculty_inventor"]:
        if current_user.department_id and patent.department_id != current_user.department_id:
            raise HTTPException(status_code=403, detail="Access denied")
            
    docs = db.query(models.PatentDocument).filter(models.PatentDocument.patent_id == patent.id).all()
    history = db.query(models.PatentStatusHistory).filter(models.PatentStatusHistory.patent_id == patent.id).all()
    
    risk_info = risk_engine.assess_risk(patent, docs, history)
    return risk_info
