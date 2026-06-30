import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="faculty_inventor")  # super_admin, department_coordinator, faculty_inventor, management_viewer
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    department = relationship("Department", back_populates="users")
    uploaded_documents = relationship("PatentDocument", back_populates="uploader")
    notifications = relationship("Notification", back_populates="user")

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    code = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    users = relationship("User", back_populates="department")
    patents = relationship("Patent", back_populates="department")

class Patent(Base):
    __tablename__ = "patents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    application_number = Column(String, unique=True, index=True, nullable=True)
    publication_number = Column(String, unique=True, index=True, nullable=True)
    grant_number = Column(String, unique=True, index=True, nullable=True)
    domain = Column(String, nullable=True)  # AI, Data Science, etc.
    category = Column(String, nullable=True)  # Software, Hardware, etc.
    description = Column(Text, nullable=True)
    status = Column(String, default="Idea Identified")  # Idea Identified, Draft Preparation, Patent Filed, Under Examination, Published, FER Issued, FER Responded, Granted, Rejected, Abandoned
    filing_date = Column(Date, nullable=True)
    publication_date = Column(Date, nullable=True)
    grant_date = Column(Date, nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    department = relationship("Department", back_populates="patents")
    inventors = relationship("PatentInventor", back_populates="patent", cascade="all, delete-orphan")
    documents = relationship("PatentDocument", back_populates="patent", cascade="all, delete-orphan")
    status_history = relationship("PatentStatusHistory", back_populates="patent", cascade="all, delete-orphan")

class PatentInventor(Base):
    __tablename__ = "patent_inventors"

    id = Column(Integer, primary_key=True, index=True)
    patent_id = Column(Integer, ForeignKey("patents.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Nullable if external inventor
    inventor_name = Column(String, nullable=False)
    is_primary = Column(Boolean, default=False)

    patent = relationship("Patent", back_populates="inventors")

class PatentDocument(Base):
    __tablename__ = "patent_documents"

    id = Column(Integer, primary_key=True, index=True)
    patent_id = Column(Integer, ForeignKey("patents.id"), nullable=False)
    document_type = Column(String, nullable=False)  # Patent Draft, Filing Certificate, etc.
    filename = Column(String, nullable=False)
    filepath = Column(String, nullable=False)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)
    version = Column(Integer, default=1)

    patent = relationship("Patent", back_populates="documents")
    uploader = relationship("User", back_populates="uploaded_documents")

class PatentStatusHistory(Base):
    __tablename__ = "patent_status_histories"

    id = Column(Integer, primary_key=True, index=True)
    patent_id = Column(Integer, ForeignKey("patents.id"), nullable=False)
    status = Column(String, nullable=False)
    notes = Column(Text, nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    changed_at = Column(DateTime, default=datetime.datetime.utcnow)

    patent = relationship("Patent", back_populates="status_history")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")
