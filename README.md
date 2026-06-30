# PatentPulse: AI-Powered Institutional Patent Tracking & Decision Support System

PatentPulse is a comprehensive web application designed for academic institutions to centralize, audit, and forecast their research patent portfolio. It replaces manual spreadsheet tracking with a secure, multi-role platform that automates accreditation compliance (NAAC, NIRF, NBA) and leverages Machine Learning to predict filing growth and flag application processing risks.

---

## ⚙️ System Architecture

PatentPulse uses a decoupled **Client-Server Architecture** designed for high throughput, data integrity, and low maintenance:

```mermaid
graph TD
    %% Presentation Layer
    subgraph Presentation Layer (React SPA)
        UI[Tailwind UI / Recharts]
        AC[Auth Context / JWT Store]
        API[API client - Fetch / CORS]
    end

    %% Application Layer
    subgraph Application Layer (FastAPI REST Service)
        Endpoints[API Route Routers]
        Auth[JWT / Bcrypt Security]
        AI[AI Engine - Scikit-Learn]
    end

    %% Storage Layer
    subgraph Data & Storage Layer
        DB[(SQLite File DB)]
        ORM[SQLAlchemy ORM]
        FS[Local File Storage /uploads]
    end

    %% Data Flow Connections
    UI <--> |Interacts| AC
    UI --> |REST API Requests| API
    API <--> |HTTPS / JWT Token| Endpoints
    Endpoints <--> |User Authenticated| Auth
    Endpoints <--> |Queries / Commits| ORM
    ORM <--> |SQLite Query| DB
    Endpoints --> |Uploads PDF| FS
    Endpoints <--> |Extracts & Predicts| AI
```

### 1. Presentation Layer (Frontend)
*   **Single Page Application (SPA)**: Built using **React** and **TypeScript** (bundled via **Vite**).
*   **Design System**: Tailwind CSS v3 configured with a high-contrast collegiate color palette, dark/light layouts, interactive hover effects, and modern glassmorphism panels.
*   **Data Visualization**: Uses **Recharts** to display real-time analytics graphs, including domain distribution pie charts and trend continuation curves.

### 2. Application Layer (Backend)
*   **RESTful APIs**: Powered by **FastAPI** (Python), delivering automatic JSON validation, query sanitation, and asynchronous request handling.
*   **Security & RBAC**: Implements secure **JSON Web Tokens (JWT)** with passwords hashed using the **Bcrypt** algorithm to enforce granular Role-Based Access Control (RBAC).

### 3. Intelligence Layer (AI/ML Engine)
*   **NLP Domain Categorization**: Uses term frequency-inverse document frequency (`TfidfVectorizer`) paired with a multinomial `LogisticRegression` model from `scikit-learn` to automatically classify and suggest research domains.
*   **Growth Forecaster**: Uses time-series regression to project institutional patent volume (filings and grants) three years into the future.
*   **Timeline Risk Assessor**: Audits timeline checkpoints and alerts coordinators if responses to government notifications (like the First Examination Report) are overdue.

### 4. Storage & Persistence Layer
*   **Database**: Local **SQLite** engine, mapped via the **SQLAlchemy ORM** layer. Database schemas are designed for modularity, allowing easy migration to enterprise solutions like PostgreSQL or MySQL.
*   **Document Management**: Local system folder (`backend/uploads/`) mapped to database file records for draft and certificate tracking.

---

## 🛠️ Technology Stack

### Frontend
*   **Framework**: React 19
*   **Language**: TypeScript 5
*   **Build Tool**: Vite 6
*   **Styling**: Tailwind CSS 3
*   **Charts**: Recharts
*   **Icons**: Lucide React

### Backend
*   **Framework**: FastAPI (Python 3.10+)
*   **Database ORM**: SQLAlchemy 2.0
*   **Encryption**: Passlib (Bcrypt) & PyJWT
*   **Data Science**: Pandas, NumPy, Scikit-Learn

---

## 📂 Project Structure

```text
patent-tracking/
├── backend/
│   ├── app/
│   │   ├── ai/               # AI models & risk logic
│   │   ├── routers/          # FastAPI endpoint handlers
│   │   ├── config.py         # App configurations & keys
│   │   ├── database.py       # SQL database initialization
│   │   ├── main.py           # Core backend launcher
│   │   ├── models.py         # SQLAlchemy database schemas
│   │   ├── schemas.py        # Pydantic data schemas
│   │   └── seed.py           # Preloaded database records
│   ├── uploads/              # Local storage for patent PDFs
│   ├── requirements.txt      # Python dependencies
│   └── patentpulse.db        # SQLite database
├── frontend/
│   ├── public/               # Static assets & SVG icons
│   ├── src/
│   │   ├── assets/           # Media files & mockups
│   │   ├── components/       # Reusable UI modules & pages
│   │   ├── context/          # JWT authentication store
│   │   ├── services/         # API endpoints fetch client
│   │   ├── App.tsx           # Router & page layout router
│   │   └── index.css         # Theme stylesheet
│   ├── package.json          # Node dependencies
│   └── tailwind.config.js    # Tailwind configuration
└── README.md                 # Project documentation
```

---

## 🚀 Getting Started & Local Installation

### Prerequisites
*   **Python 3.10** or higher
*   **Node.js** (v18 or higher) and **npm**

---

### Step 1: Run the Backend (FastAPI)
Open a terminal in the root directory:

1. Navigate into the backend folder:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv .venv
   ```
3. Activate the virtual environment:
   *   **Windows (PowerShell)**:
       ```powershell
       .venv\Scripts\activate
       ```
   *   **macOS / Linux**:
       ```bash
       source .venv/bin/activate
       ```
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Run the server:
   ```bash
   uvicorn app.main:app --port 8000
   ```
   *The backend will be running at `http://127.0.0.1:8000`.*

---

### Step 2: Run the Frontend (React / Vite)
Open a new terminal tab:

1. Navigate into the frontend folder:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The application will launch on your browser at `http://localhost:5173/`.*

---

## 🔑 Demo Access Roles & Accounts
The system contains preloaded test data representing different administrative tiers:

| Role | Username | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@college.edu` | `admin123` | System management, department CRUD, user management. |
| **Department Coordinator** | `cse.coordinator@college.edu` | `coordinator123` | Patent status transitions, document validation. |
| **Faculty Inventor** | `prof.sharma@college.edu` | `faculty123` | Patent submission, draft uploads, timeline tracking. |
| **Auditor / Management** | `auditor@college.edu` | `auditor123` | Read-only analytics dashboard & NAAC/NIRF document exports. |

---

## 🧠 AI / Machine Learning Engine Detail

### A. NLP Category Classifier
The model analyzes the token density in a patent's title and description to predict its domain.
*   **Feature Vectorizer**: Maps terms to numeric values using a TF-IDF metric:
    $$\text{TF-IDF}(t, d, D) = \text{TF}(t, d) \times \log\left(\frac{|D|}{1 + |\{d \in D : t \in d\}|}\right)$$
*   **Classification Algorithm**: Softmax Logistic Regression assigns probability boundaries over the classes:
    $$P(y = c \mid \mathbf{x}) = \frac{e^{\mathbf{w}_c^T \mathbf{x}}}{\sum_{j=1}^{C} e^{\mathbf{w}_j^T \mathbf{x}}}$$

### B. Predictive Trend Line
Fits historical patent counts per year using ordinary least squares to predict future research trajectories.
*   **Model**: Simple Linear Regression:
    $$y_i = \beta_0 + \beta_1 x_i + \epsilon_i$$
    *Where $x_i$ represents the target year, and $y_i$ represents the forecasted count.*
