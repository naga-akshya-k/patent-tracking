# 😀 Patent Tracking: Institutional Intellectual Property & Patent Management System

An enterprise-grade Institutional Intellectual Property (IP) and Patent Management System designed for academic institutions and research universities (specifically tailored for institutions like Easwari Engineering College / SRM Group). 

It automates the complete IP lifecycle—from student invention disclosures and faculty hearings, up to statutory InPASS prosecution deadline alerts, NIRF/NAAC/NBA accreditation report generation, and commercialization royalty audits.

---

## 🌐 Live Deployment

| Component | Live URL | Status |
| :--- | :--- | :--- |
| **Frontend Web App** | [https://patent-tracking-frontend.onrender.com]https://patent-tracking-frontend.onrender.com) | ✅ Live |
| **Backend API & Swagger Docs** | [https://patent-tracking-backend.onrender.com/docs](https://patent-tracking-backend.onrender.com/docs) | � Live |

---

## ⨙ Key Capabilities & Features

1. **Full 13-Department Institutional Coverage**: Natively tracks all 13 college engineering departments (`CSE`, `AIADS`, `AIML`, `ECE`, `MECH`, `CHEMICAL`, `BIOTECH`, `IT`, `CYBER`, `CSD`, `CSBS`, `CIVIL`, `EEE`) across a 26-year historical timeline (2000 → 2026).
2. **InPASS Statutory Legal Alert Center**: Automatically evaluates Indian Patent Office (InPASS) regulations (Indian Patents Act, 1970 & Patent Rules 2024) to trigger statutory warnings:
   * 🔴 **CRITICAL GER Response Deadline**: 6-Month Section 21 Limit.
   * 🚠 **WARNING Form 18 RFE (Request for Examination)**: 31-Month Window.
   * 🚠 **WARNING Stalled Faculty Reviews**: Invention Disclosures pending >14 days.
   * 👧 **INFO Annual Maintenance / Renewal Fees**: Annuity payments for Granted patents.
3. **Automated Accreditation Reporting (NIRF, NAAC, NBA)**:
   * **NIRF Section 3 Rolling Export**: Filings and grants across 3-year rolling windows.
   * **NAAC Criterion 3.4.3 Data Summary**: Faculty vs. student-led patent awards.
   * **Departmental IP Audit (13 Depts)**: Comprehensive IP breakdown with *Digital Verification API Badges*.
   * **Commercialization & Royalty Audit**: Technology transfer licensing valuations.
4. **Native MS Excel & Print PDF Generation**:
   * **Excel Export (.xls)**: Generates native Microsoft Excel XML SpreadsheetML format with burgundy-header styling and zero file corruption warnings.
   * **Print PDF**: Hides UI navbar/sidebars via `@media print` and paginates multi-page documents cleanly for physical signing.
   * **Audit Archive Log**: Maintains a tamper-proof compliance history for external NAAC/NIRF site inspectors.
5. **Invention Disclosure Form (IDF) & Bulk Importer**:
   * Students and Faculty submit new ideas via `post /api/patents`.
   * Administrators bulk-import legacy college spreadsheets (.csv / .xlsx) into SQLite.

---

## 🗛 Technology Stack

**Frontend**:
- Framework: React 19 with TypeScript
- Build Tool: Vite 6
- Styling: TailwindCSS 3 (Institutional Burgundy `#6B1D2F` & Navy `#1E293B`)
- Charts & Visuals: Recharts 3
- Icons: Lucide-React

"�*Backend**:
- Framework: FastAPI (Python 3.10+)
- ASGI Server: Uvicorn & Gunicorn
- Database ORM: SQLAlchemy 2.0
- Security & Auth: JWT (JSON Web Tokens) & Bcrypt Password Hashing
- Data Science & ML: Scikit-Learn, NumPy, Pandas
- Database: SQLite (`patentpulse.db`)

---

## 🧅 AI / Machine Learning Engine

1. **TF-IDF + Logistic Regression Domain Classifier** (`AICategorizer`):
   Analyzes the word frequency and token density in patent titles and abstracts to automatically classify new filings into technology domains (*Artificial Intelligence*, *Cybersecurity*, *Healthcare*, *Robotics*, *Electronics*, *Renewable Energy*):
   $\$\text{TF-IDF}(t, d, D) = \text{TF}(t, d) \times \log\left(\frac{|D}}{1 + |\{d \in D : t \in d}\|}Yright)$\$

   $\$P(y = c \mid \mathbf{x}) = \frac{e^c^T \mathbf{x}}{\sum_{j_e=j^t \mathbf{x}}$\$

2. **InPASS Statutory Legal Risk Assessor** (`AIRiskAssessor`):
   Evaluates Statutory Patent Office deadlines, FER 6-month section 21 response periods, Form 18 RFE 31-month windows, and draft document completeness.

---

## 🔑 Demm Login Credentials

The project is preloaded with an institutional database spanning all 13 departments:

| Role | Username | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **IP Cell Admin / Super Admin** | `admin` | `admin123` | College-wide IP oversight, bulk-import, accreditation exports |
| **CSE Department Coordinator** | `cse_coordinator` | `coord123` | Department-specific patent reviews, status transitions |
| **Management / IQAC Auditor** | `auditor` | `auditor123` | Read-only analytics, NIRF/NAAC/NBA accreditation exports |
| **Student Innovator** | `student` | `student123` | Invention disclosure submission, draft attachments |

*(You can also use the one-click demo login selector on the login page*)*

---

## 🚪 Local Development Setup

### Backend (FastAPI):
```bash
cd backend
python -m venv .venv
.source .venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```

### Frontend (React + Vite):
```bash
cd frontend
npm install
npm run dev
```