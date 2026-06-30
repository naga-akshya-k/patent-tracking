from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/api/departments", tags=["departments"])

@router.get("", response_model=List[schemas.DepartmentResponse])
def get_departments(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.Department).order_by(models.Department.name).all()

@router.post("", response_model=schemas.DepartmentResponse)
def create_department(
    dept_in: schemas.DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.RoleChecker(["super_admin"]))
):
    existing = db.query(models.Department).filter(
        (models.Department.name == dept_in.name) | (models.Department.code == dept_in.code)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Department with this name or code already exists")
        
    dept = models.Department(name=dept_in.name, code=dept_in.code)
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept

@router.get("/{id}/performance", response_model=schemas.DepartmentPerformance)
def get_department_performance(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    dept = db.query(models.Department).filter(models.Department.id == id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
        
    patents = db.query(models.Patent).filter(models.Patent.department_id == id).all()
    
    total = len(patents)
    filed = sum(1 for p in patents if p.status == "Patent Filed")
    published = sum(1 for p in patents if p.status == "Published")
    granted = sum(1 for p in patents if p.status == "Granted")
    pending = sum(1 for p in patents if p.status in ["Under Examination", "FER Issued", "FER Responded", "Patent Filed", "Published"])
    rejected = sum(1 for p in patents if p.status == "Rejected")
    abandoned = sum(1 for p in patents if p.status == "Abandoned")
    
    # Success rate formula: Granted / (Granted + Rejected + Abandoned)
    resolved = granted + rejected + abandoned
    success_rate = (granted / resolved * 100) if resolved > 0 else 0.0
    
    # Innovation score weighting formula:
    # Idea: 1pt, Draft: 2pts, Filed: 5pts, Under Exam / Published / FER: 8pts, Granted: 15pts
    points = 0
    for p in patents:
        if p.status == "Idea Identified":
            points += 1
        elif p.status == "Draft Preparation":
            points += 2
        elif p.status == "Patent Filed":
            points += 5
        elif p.status in ["Under Examination", "Published", "FER Issued", "FER Responded"]:
            points += 8
        elif p.status == "Granted":
            points += 15
            
    # Normalize score out of 100 assuming 50 points is a perfect institutional target
    innovation_score = min(100.0, (points / 50.0) * 100.0) if points > 0 else 0.0
    
    return {
        "department_id": dept.id,
        "department_name": dept.name,
        "department_code": dept.code,
        "total_patents": total,
        "filed_patents": filed,
        "published_patents": published,
        "granted_patents": granted,
        "pending_patents": pending,
        "success_rate": success_rate,
        "innovation_score": innovation_score
    }
