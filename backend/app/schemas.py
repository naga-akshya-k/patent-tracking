from pydantic import BaseModel, EmailStr
from typing import List, Optional
import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None
    user_id: Optional[int] = None

# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    role: str
    department_id: Optional[int] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Department Schemas
class DepartmentBase(BaseModel):
    name: str
    code: str

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentResponse(DepartmentBase):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Inventor Schemas
class InventorBase(BaseModel):
    inventor_name: str
    user_id: Optional[int] = None
    is_primary: bool = False

class InventorCreate(InventorBase):
    pass

class InventorResponse(InventorBase):
    id: int
    patent_id: int

    class Config:
        from_attributes = True

# Document Schemas
class DocumentBase(BaseModel):
    document_type: str
    filename: str
    filepath: str
    uploaded_by: int
    uploaded_at: datetime.datetime
    version: int

class DocumentResponse(DocumentBase):
    id: int
    patent_id: int

    class Config:
        from_attributes = True

# Status History Schemas
class StatusHistoryResponse(BaseModel):
    id: int
    patent_id: int
    status: str
    notes: Optional[str] = None
    updated_by: int
    changed_at: datetime.datetime

    class Config:
        from_attributes = True

# Patent Schemas
class PatentBase(BaseModel):
    title: str
    application_number: Optional[str] = None
    publication_number: Optional[str] = None
    grant_number: Optional[str] = None
    domain: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    status: str = "Idea Identified"
    filing_date: Optional[datetime.date] = None
    publication_date: Optional[datetime.date] = None
    grant_date: Optional[datetime.date] = None
    department_id: int

class PatentCreate(PatentBase):
    inventors: List[InventorBase] = []

class PatentUpdate(BaseModel):
    title: Optional[str] = None
    application_number: Optional[str] = None
    publication_number: Optional[str] = None
    grant_number: Optional[str] = None
    domain: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    filing_date: Optional[datetime.date] = None
    publication_date: Optional[datetime.date] = None
    grant_date: Optional[datetime.date] = None
    department_id: Optional[int] = None

class PatentResponse(PatentBase):
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class PatentDetailResponse(PatentResponse):
    inventors: List[InventorResponse] = []
    documents: List[DocumentResponse] = []
    status_history: List[StatusHistoryResponse] = []

    class Config:
        from_attributes = True

# Notification Schemas
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    read: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Analytics & AI schemas
class KPIStats(BaseModel):
    total_patents: int
    active_patents: int
    published_patents: int
    granted_patents: int
    pending_patents: int
    rejected_patents: int

class DepartmentPerformance(BaseModel):
    department_id: int
    department_name: str
    department_code: str
    total_patents: int
    filed_patents: int
    published_patents: int
    granted_patents: int
    pending_patents: int
    success_rate: float
    innovation_score: float

class InventorPerformance(BaseModel):
    user_id: Optional[int] = None
    inventor_name: str
    total_patents: int
    granted_patents: int
    primary_patents: int
    innovation_index: float

class RiskDetail(BaseModel):
    patent_id: int
    title: str
    status: str
    days_in_status: int
    risk_level: str  # Low, Medium, High
    reasons: List[str]
    action_items: List[str]

class ForecastItem(BaseModel):
    year: int
    predicted_filings: int
    predicted_grants: int

class AIDomainSuggestion(BaseModel):
    predicted_domain: str
    confidence: float
