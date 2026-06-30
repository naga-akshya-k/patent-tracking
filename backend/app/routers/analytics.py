from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import pandas as pd
import datetime

from app.database import get_db
from app import models, schemas, auth
from app.ai.ai_engine import forecaster_engine, risk_engine

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/kpis", response_model=schemas.KPIStats)
def get_kpi_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.Patent)
    
    # Filter by department if Coordinator or Faculty
    if current_user.role in ["department_coordinator", "faculty_inventor"]:
        if current_user.department_id:
            query = query.filter(models.Patent.department_id == current_user.department_id)
            
    patents = query.all()
    
    total = len(patents)
    active = sum(1 for p in patents if p.status not in ["Rejected", "Abandoned", "Granted"])
    published = sum(1 for p in patents if p.status == "Published")
    granted = sum(1 for p in patents if p.status == "Granted")
    rejected = sum(1 for p in patents if p.status == "Rejected")
    pending = sum(1 for p in patents if p.status in ["Under Examination", "FER Issued", "FER Responded", "Patent Filed"])
    
    return {
        "total_patents": total,
        "active_patents": active,
        "published_patents": published,
        "granted_patents": granted,
        "pending_patents": pending,
        "rejected_patents": rejected
    }

@router.get("/yearly-trends")
def get_yearly_trends(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.Patent)
    if current_user.role in ["department_coordinator", "faculty_inventor"] and current_user.department_id:
        query = query.filter(models.Patent.department_id == current_user.department_id)
        
    patents = query.all()
    if not patents:
        return []

    # Map database records to a DataFrame for Pandas aggregation
    data = []
    for p in patents:
        if p.filing_date:
            data.append({
                "year": p.filing_date.year,
                "status": p.status
            })
            
    if not data:
        return []
        
    df = pd.DataFrame(data)
    
    # Group by year
    years = sorted(df["year"].unique())
    trends = []
    for yr in years:
        df_yr = df[df["year"] == yr]
        filings = len(df_yr)
        grants = len(df_yr[df_yr["status"] == "Granted"])
        trends.append({
            "year": int(yr),
            "filings": filings,
            "grants": grants
        })
        
    return trends

@router.get("/domain-distribution")
def get_domain_distribution(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.Patent)
    if current_user.role in ["department_coordinator", "faculty_inventor"] and current_user.department_id:
        query = query.filter(models.Patent.department_id == current_user.department_id)
        
    patents = query.all()
    if not patents:
        return []
        
    df = pd.DataFrame([{ "domain": p.domain or "Unknown" } for p in patents])
    
    if df.empty:
        return []
        
    counts = df["domain"].value_counts()
    return [{ "domain": name, "count": int(count) } for name, count in counts.items()]

@router.get("/department-comparison", response_model=List[schemas.DepartmentPerformance])
def get_department_comparison(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.RoleChecker(["super_admin", "management_viewer"]))
):
    depts = db.query(models.Department).all()
    comparison = []
    
    from app.routers.departments import get_department_performance
    for d in depts:
        perf = get_department_performance(d.id, db, current_user)
        comparison.append(perf)
        
    # Sort by innovation score descending
    comparison.sort(key=lambda x: x["innovation_score"], reverse=True)
    return comparison

@router.get("/faculty-rankings", response_model=List[schemas.InventorPerformance])
def get_faculty_rankings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Query all patent-inventor relations
    inventor_relations = db.query(models.PatentInventor).all()
    if not inventor_relations:
        return []
        
    inventor_stats = {}
    
    for rel in inventor_relations:
        patent = db.query(models.Patent).filter(models.Patent.id == rel.patent_id).first()
        if not patent:
            continue
            
        name = rel.inventor_name
        user_id = rel.user_id
        
        # Filter if coordinator wants only their department
        if current_user.role == "department_coordinator" and current_user.department_id:
            if patent.department_id != current_user.department_id:
                continue
                
        key = (user_id, name)
        if key not in inventor_stats:
            inventor_stats[key] = {
                "total": 0,
                "granted": 0,
                "primary": 0,
                "points": 0
            }
            
        stats = inventor_stats[key]
        stats["total"] += 1
        if patent.status == "Granted":
            stats["granted"] += 1
        if rel.is_primary:
            stats["primary"] += 1
            
        # Weighted points for Index computation
        if patent.status == "Granted":
            stats["points"] += 10
        elif patent.status in ["Published", "Under Examination", "FER Issued", "FER Responded"]:
            stats["points"] += 5
        elif patent.status == "Patent Filed":
            stats["points"] += 3
        else:
            stats["points"] += 1
            
    rankings = []
    for (user_id, name), stats in inventor_stats.items():
        # Innovation index = points / 10 + (2 * primary patents) + (5 * granted patents)
        innovation_index = (stats["points"] / 2.0) + (2 * stats["primary"]) + (5 * stats["granted"])
        
        rankings.append({
            "user_id": user_id,
            "inventor_name": name,
            "total_patents": stats["total"],
            "granted_patents": stats["granted"],
            "primary_patents": stats["primary"],
            "innovation_index": float(round(innovation_index, 1))
        })
        
    # Sort by innovation index descending
    rankings.sort(key=lambda x: x["innovation_index"], reverse=True)
    return rankings

@router.get("/ai-forecast", response_model=List[schemas.ForecastItem])
def get_growth_forecast(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    trends = get_yearly_trends(db, current_user)
    
    # Run the forecaster
    forecast = forecaster_engine.forecast_growth(trends, years_ahead=3)
    return forecast

@router.get("/ai-risks", response_model=List[schemas.RiskDetail])
def get_ai_risk_dashboard(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.Patent).filter(
        models.Patent.status.notin_(["Granted", "Rejected", "Abandoned"])
    )
    
    if current_user.role in ["department_coordinator", "faculty_inventor"] and current_user.department_id:
        query = query.filter(models.Patent.department_id == current_user.department_id)
        
    active_patents = query.all()
    risky_patents = []
    
    for pat in active_patents:
        docs = db.query(models.PatentDocument).filter(models.PatentDocument.patent_id == pat.id).all()
        history = db.query(models.PatentStatusHistory).filter(models.PatentStatusHistory.patent_id == pat.id).all()
        
        assessment = risk_engine.assess_risk(pat, docs, history)
        if assessment["risk_level"] in ["Medium", "High"]:
            risky_patents.append(assessment)
            
    # Sort so High risk displays first
    risky_patents.sort(key=lambda x: 1 if x["risk_level"] == "High" else 2)
    return risky_patents
