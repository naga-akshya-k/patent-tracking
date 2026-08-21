from sqlalchemy.orm import Session
import datetime
from app.database import SessionLocal, Base, engine
from app import models, auth

def seed_database():
    # Drop and recreate all tables for a clean slate
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # 1. Seed All 13 Institutional Departments
        depts_data = [
            ("Computer Science & Engineering", "CSE"),
            ("Artificial Intelligence & Data Science", "AIADS"),
            ("Artificial Intelligence & Machine Learning", "AIML"),
            ("Electronics & Communication Engineering", "ECE"),
            ("Mechanical Engineering", "MECH"),
            ("Chemical Engineering", "CHEMICAL"),
            ("Biotechnology & Healthcare", "BIOTECH"),
            ("Information Technology", "IT"),
            ("CSE (Cyber Security)", "CYBER"),
            ("Computer Science & Design", "CSD"),
            ("Computer Science & Business Systems", "CSBS"),
            ("Civil Engineering", "CIVIL"),
            ("Electrical & Electronics Engineering", "EEE")
        ]

        dept_models = {}
        for name, code in depts_data:
            dept = models.Department(name=name, code=code)
            db.add(dept)
            dept_models[code] = dept
        
        db.commit()
        for code, dept in dept_models.items():
            db.refresh(dept)

        # 2. Seed Users
        admin_pwd = auth.get_password_hash("Admin123!")
        coord_pwd = auth.get_password_hash("Coord123!")
        iqac_pwd = auth.get_password_hash("Iqac123!")
        attorney_pwd = auth.get_password_hash("Attorney123!")
        student_pwd = auth.get_password_hash("Student123!")

        admin_user = models.User(username="admin", email="admin@patentpulse.edu", hashed_password=admin_pwd, full_name="Dr. R. K. Vance", role="super_admin")
        cse_coord = models.User(username="cse_coordinator", email="cse.coordinator@patentpulse.edu", hashed_password=coord_pwd, full_name="Prof. David Miller", role="department_coordinator", department_id=dept_models["CSE"].id)
        ece_coord = models.User(username="ece_coordinator", email="ece.coordinator@patentpulse.edu", hashed_password=coord_pwd, full_name="Prof. Susan Clarke", role="department_coordinator", department_id=dept_models["ECE"].id)
        mech_coord = models.User(username="mech_coordinator", email="mech.coordinator@patentpulse.edu", hashed_password=coord_pwd, full_name="Prof. H. S. Murthy", role="department_coordinator", department_id=dept_models["MECH"].id)
        ai_coord = models.User(username="ai_coordinator", email="ai.coordinator@patentpulse.edu", hashed_password=coord_pwd, full_name="Dr. Anita Roy", role="department_coordinator", department_id=dept_models["AIADS"].id)
        iqac_user = models.User(username="auditor", email="auditor@patentpulse.edu", hashed_password=iqac_pwd, full_name="Dr. IQAC Lead", role="management_viewer")
        attorney_user = models.User(username="attorney", email="attorney@iplaw.com", hashed_password=attorney_pwd, full_name="Adv. Rajesh Kumar", role="attorney")
        student_user = models.User(username="student", email="student@patentpulse.edu", hashed_password=student_pwd, full_name="Aarav Sharma (Student)", role="student", department_id=dept_models["CSE"].id)

        db.add_all([admin_user, cse_coord, ece_coord, mech_coord, ai_coord, iqac_user, attorney_user, student_user])
        db.commit()

        # 3. Seed Patents for ALL 13 DEPARTMENTS (Comprehensive 2000-2026 dataset)
        patents_data = [
            # EEE
            {
                "title": "Microcontroller based smart fault locator for high voltage distribution lines",
                "application_number": "IN200511001234",
                "publication_number": "IN200511001234A",
                "grant_number": "IN194820B",
                "domain": "Electrical Systems",
                "category": "Hardware",
                "description": "An early impedance reflection technique to localize electrical transmission short circuits.",
                "status": "Granted",
                "filing_date": datetime.date(2005, 4, 10),
                "publication_date": datetime.date(2005, 10, 15),
                "grant_date": datetime.date(2008, 6, 20),
                "department_id": dept_models["EEE"].id,
                "inventors": [("P. Ramesh (Student - EEE)", None, True)]
            },
            {
                "title": "Solid-state battery management system with multi-cell active cell balancing",
                "application_number": "IN202211048291",
                "publication_number": "IN202211048291A",
                "grant_number": "IN419201B",
                "domain": "Electrical Systems",
                "category": "Hardware",
                "description": "A high-efficiency active charge balancing circuit for EV lithium battery packs.",
                "status": "Granted",
                "filing_date": datetime.date(2022, 9, 14),
                "publication_date": datetime.date(2023, 3, 20),
                "grant_date": datetime.date(2025, 1, 10),
                "department_id": dept_models["EEE"].id,
                "inventors": [("S. Arvind (Student - EEE)", None, True)]
            },

            # CIVIL
            {
                "title": "Low carbon geopolymetric concrete formulation using fly ash and slag aggregate",
                "application_number": "IN201211048291",
                "publication_number": "IN201211048291A",
                "grant_number": "IN284910B",
                "domain": "Civil Engineering",
                "category": "Process",
                "description": "Eco-friendly cement replacement composition utilizing industrial byproduct slag.",
                "status": "Granted",
                "filing_date": datetime.date(2012, 8, 19),
                "publication_date": datetime.date(2013, 2, 11),
                "grant_date": datetime.date(2016, 5, 30),
                "department_id": dept_models["CIVIL"].id,
                "inventors": [("S. Karthik (Student - CIVIL)", None, True)]
            },
            {
                "title": "Seismic vibration damping foundation pad using vulcanized rubber composites",
                "application_number": "IN202311094819",
                "publication_number": "IN202311094819A",
                "grant_number": None,
                "domain": "Civil Engineering",
                "category": "Hardware",
                "description": "A shock-absorbing structural isolation bearing designed for high-rise earthquake safety.",
                "status": "Published",
                "filing_date": datetime.date(2023, 3, 22),
                "publication_date": datetime.date(2023, 9, 15),
                "grant_date": None,
                "department_id": dept_models["CIVIL"].id,
                "inventors": [("M. Priya (Student - CIVIL)", None, True)]
            },

            # CHEMICAL
            {
                "title": "Continuous nanostructured membrane module for industrial wastewater heavy metal extraction",
                "application_number": "IN201811092810",
                "publication_number": "IN201811092810A",
                "grant_number": "IN349281B",
                "domain": "Chemical Engineering",
                "category": "Hardware",
                "description": "Polymeric nanofiltration setup designed for high flux recovery of copper and chromium from tannery effluents.",
                "status": "Granted",
                "filing_date": datetime.date(2018, 1, 25),
                "publication_date": datetime.date(2018, 7, 12),
                "grant_date": datetime.date(2021, 9, 14),
                "department_id": dept_models["CHEMICAL"].id,
                "inventors": [("Meera Nair (Student - CHEMICAL)", None, True)]
            },
            {
                "title": "Catalytic pyrolysis reactor for waste plastic conversion to ultra-low sulfur diesel",
                "application_number": "IN202411083920",
                "publication_number": "IN202411083920A",
                "grant_number": None,
                "domain": "Chemical Engineering",
                "category": "Process",
                "description": "A continuous thermal cracking reactor utilizing zeolitic catalyst beds.",
                "status": "Published",
                "filing_date": datetime.date(2024, 2, 10),
                "publication_date": datetime.date(2024, 8, 18),
                "grant_date": None,
                "department_id": dept_models["CHEMICAL"].id,
                "inventors": [("V. Suresh (Student - CHEMICAL)", None, True)]
            },

            # CSE
            {
                "title": "Machine learning based dynamic load balancer for campus cloud servers",
                "application_number": "IN202111045621",
                "publication_number": "IN202111045621A",
                "grant_number": "IN384920B",
                "domain": "Machine Learning",
                "category": "Software",
                "description": "An intelligent load balancing model developed by CSE students employing reinforcement learning.",
                "status": "Granted",
                "filing_date": datetime.date(2021, 3, 14),
                "publication_date": datetime.date(2021, 9, 24),
                "grant_date": datetime.date(2023, 11, 5),
                "department_id": dept_models["CSE"].id,
                "inventors": [("Aarav Sharma (Student - CSE)", student_user.id, True), ("Prof. David Miller (Advisor)", cse_coord.id, False)]
            },
            {
                "title": "Secure decentralized student credential verification system using zero-knowledge proofs",
                "application_number": "IN202611091823",
                "publication_number": None,
                "grant_number": None,
                "domain": "Cybersecurity",
                "category": "Software",
                "description": "A cryptographic backend allowing student identity verifications for exams without exposing private register metrics.",
                "status": "Idea Identified",
                "filing_date": datetime.date(2026, 1, 15),
                "publication_date": None,
                "grant_date": None,
                "department_id": dept_models["CSE"].id,
                "inventors": [("Siddharth Sen (Student - CSE)", None, True)]
            },

            # ECE
            {
                "title": "High efficiency thermoelectric solar panel cooling device with bismuth alloys",
                "application_number": "IN202111059281",
                "publication_number": "IN202111059281A",
                "grant_number": "IN392019B",
                "domain": "Electronics",
                "category": "Hardware",
                "description": "A student hardware prototype utilizing thermoelectric bismuth layering to cool solar PV modules.",
                "status": "Granted",
                "filing_date": datetime.date(2021, 7, 20),
                "publication_date": datetime.date(2021, 12, 10),
                "grant_date": datetime.date(2024, 1, 12),
                "department_id": dept_models["ECE"].id,
                "inventors": [("Rohan Malhotra (Student - ECE)", None, True), ("Prof. Susan Clarke (Advisor)", ece_coord.id, False)]
            },
            {
                "title": "Smart automated greenhouse monitoring node using LoRaWAN transmission",
                "application_number": "IN202611048291",
                "publication_number": None,
                "grant_number": None,
                "domain": "Internet of Things",
                "category": "Hardware",
                "description": "A battery-powered hardware prototype transmitting temperature and soil pH over 5km mesh signals.",
                "status": "Draft Preparation",
                "filing_date": datetime.date(2026, 2, 1),
                "publication_date": None,
                "grant_date": None,
                "department_id": dept_models["ECE"].id,
                "inventors": [("Arjun Das (Student - ECE)", None, True)]
            },

            # AIADS
            {
                "title": "Autonomous crop yield prediction framework integrating satellite radar imagery",
                "application_number": "IN202211038192",
                "publication_number": "IN202211038192A",
                "grant_number": None,
                "domain": "Artificial Intelligence",
                "category": "Software",
                "description": "A data analytics system developed by AIADS students using convolutional neural networks.",
                "status": "Published",
                "filing_date": datetime.date(2022, 5, 14),
                "publication_date": datetime.date(2022, 11, 20),
                "grant_date": None,
                "department_id": dept_models["AIADS"].id,
                "inventors": [("Priya Patel (Student - AIADS)", None, True), ("Dr. Anita Roy (Advisor)", ai_coord.id, False)]
            },
            {
                "title": "Real-time multimodal traffic congestion forecasting engine",
                "application_number": "IN202511082910",
                "publication_number": None,
                "grant_number": None,
                "domain": "Data Science",
                "category": "Software",
                "description": "A predictive smart city traffic routing system processing optical camera feeds.",
                "status": "Patent Filed",
                "filing_date": datetime.date(2025, 4, 18),
                "publication_date": None,
                "grant_date": None,
                "department_id": dept_models["AIADS"].id,
                "inventors": [("R. Swathi (Student - AIADS)", None, True)]
            },

            # AIML
            {
                "title": "Automated medical image segmentation for early diabetic retinopathy detection",
                "application_number": "IN202311094820",
                "publication_number": "IN202311094820A",
                "grant_number": None,
                "domain": "Machine Learning",
                "category": "Software",
                "description": "An AIML student deep learning architecture identifying micro-aneurysms in fundus camera photos.",
                "status": "Under Examination",
                "filing_date": datetime.date(2023, 2, 18),
                "publication_date": datetime.date(2023, 8, 25),
                "grant_date": None,
                "department_id": dept_models["AIML"].id,
                "inventors": [("Rahul Verma (Student - AIML)", None, True)]
            },
            {
                "title": "Generative adversarial network for synthetic brain MRI artifact reduction",
                "application_number": "IN202611029182",
                "publication_number": None,
                "grant_number": None,
                "domain": "Machine Learning",
                "category": "Software",
                "description": "A generative model reducing noise artifacts in low-field magnetic resonance scans.",
                "status": "Draft Preparation",
                "filing_date": datetime.date(2026, 3, 5),
                "publication_date": None,
                "grant_date": None,
                "department_id": dept_models["AIML"].id,
                "inventors": [("K. Divya (Student - AIML)", None, True)]
            },

            # MECH
            {
                "title": "Pneumatically assisted double-acting shock absorber for warehouse machinery",
                "application_number": "IN202211099231",
                "publication_number": "IN202211099231A",
                "grant_number": "IN402912B",
                "domain": "Mechanical Engineering",
                "category": "Hardware",
                "description": "A pneumatic damping assembly designed by Mechanical students to protect factory machines.",
                "status": "Granted",
                "filing_date": datetime.date(2022, 6, 5),
                "publication_date": datetime.date(2022, 12, 15),
                "grant_date": datetime.date(2024, 8, 22),
                "department_id": dept_models["MECH"].id,
                "inventors": [("Vikram Sen (Student - MECH)", None, True), ("Prof. H. S. Murthy (Advisor)", mech_coord.id, False)]
            },
            {
                "title": "Bipedal robotic gait adaptation system using terrain mapping depth cameras",
                "application_number": "IN202511051928",
                "publication_number": None,
                "grant_number": None,
                "domain": "Robotics",
                "category": "Hardware",
                "description": "A mechanical legged robot controller that processes real-time depth mapping.",
                "status": "Patent Filed",
                "filing_date": datetime.date(2025, 5, 12),
                "publication_date": None,
                "grant_date": None,
                "department_id": dept_models["MECH"].id,
                "inventors": [("Arjun Reddy (Student - MECH)", None, True)]
            },

            # BIOTECH
            {
                "title": "Continuous enzymatic bioreactor design for rapid agricultural cellulose degradation",
                "application_number": "IN202311039822",
                "publication_number": "IN202311039822A",
                "grant_number": None,
                "domain": "Healthcare",
                "category": "Process",
                "description": "A biological reactor incorporating immobilized enzymes to speed up decomposition of plant residues.",
                "status": "Under Examination",
                "filing_date": datetime.date(2023, 8, 12),
                "publication_date": datetime.date(2024, 2, 23),
                "grant_date": None,
                "department_id": dept_models["BIOTECH"].id,
                "inventors": [("Nisha Rao (Student - BIOTECH)", None, True)]
            },
            {
                "title": "Nanoparticle formulation for targeted ocular drug delivery in glaucoma treatment",
                "application_number": "IN202511091823",
                "publication_number": None,
                "grant_number": None,
                "domain": "Healthcare",
                "category": "Process",
                "description": "A biodegradable lipid nano-carrier improving intraocular pressure management.",
                "status": "Patent Filed",
                "filing_date": datetime.date(2025, 7, 19),
                "publication_date": None,
                "grant_date": None,
                "department_id": dept_models["BIOTECH"].id,
                "inventors": [("T. Ananya (Student - BIOTECH)", None, True)]
            },

            # IT
            {
                "title": "High throughput distributed graph database engine for social network analysis",
                "application_number": "IN202411074910",
                "publication_number": "IN202411074910A",
                "grant_number": None,
                "domain": "Information Technology",
                "category": "Software",
                "description": "An IT student project introducing low-latency index sharding across cluster nodes.",
                "status": "FER Issued",
                "filing_date": datetime.date(2024, 1, 10),
                "publication_date": datetime.date(2024, 7, 18),
                "grant_date": None,
                "department_id": dept_models["IT"].id,
                "inventors": [("K. Sanjay (Student - IT)", None, True)]
            },
            {
                "title": "Quantum-resistant cryptographic key distribution protocol for IoT devices",
                "application_number": "IN202611074912",
                "publication_number": None,
                "grant_number": None,
                "domain": "Information Technology",
                "category": "Software",
                "description": "A lattice-based security handshake ensuring post-quantum device integrity.",
                "status": "Idea Identified",
                "filing_date": datetime.date(2026, 4, 1),
                "publication_date": None,
                "grant_date": None,
                "department_id": dept_models["IT"].id,
                "inventors": [("G. Deepak (Student - IT)", None, True)]
            },

            # CYBER
            {
                "title": "Zero-trust network intrusion detection system based on lateral anomaly checking",
                "application_number": "IN202411019281",
                "publication_number": "IN202411019281A",
                "grant_number": None,
                "domain": "Cybersecurity",
                "category": "Software",
                "description": "A security framework verifying intranet traffic using machine learning classifiers.",
                "status": "FER Responded",
                "filing_date": datetime.date(2024, 4, 12),
                "publication_date": datetime.date(2024, 10, 20),
                "grant_date": None,
                "department_id": dept_models["CYBER"].id,
                "inventors": [("Sanya Gupta (Student - CYBER)", None, True), ("Prof. David Miller (Advisor)", cse_coord.id, False)]
            },
            {
                "title": "Automated malware behavior sandbox analyzer using kernel hook tracing",
                "application_number": "IN202511029102",
                "publication_number": None,
                "grant_number": None,
                "domain": "Cybersecurity",
                "category": "Software",
                "description": "A virtual isolation chamber capturing system call anomalies from zero-day exploits.",
                "status": "Patent Filed",
                "filing_date": datetime.date(2025, 8, 30),
                "publication_date": None,
                "grant_date": None,
                "department_id": dept_models["CYBER"].id,
                "inventors": [("N. Rohit (Student - CYBER)", None, True)]
            },

            # CSD
            {
                "title": "Interactive tactile feedback interface for augmented reality CAD modeling",
                "application_number": "IN202511048291",
                "publication_number": None,
                "grant_number": None,
                "domain": "Computer Science & Design",
                "category": "Hardware",
                "description": "A haptic wearable glove enabling engineering students to manipulate 3D computer CAD geometry directly.",
                "status": "Patent Filed",
                "filing_date": datetime.date(2025, 3, 15),
                "publication_date": None,
                "grant_date": None,
                "department_id": dept_models["CSD"].id,
                "inventors": [("Tanvi Joshi (Student - CSD)", None, True)]
            },
            {
                "title": "Generative UI wireframe synthesizer based on human visual attention maps",
                "application_number": "IN202611039182",
                "publication_number": None,
                "grant_number": None,
                "domain": "Computer Science & Design",
                "category": "Software",
                "description": "An AI layout generator organizing website components based on eye-tracking heatmaps.",
                "status": "Draft Preparation",
                "filing_date": datetime.date(2026, 2, 28),
                "publication_date": None,
                "grant_date": None,
                "department_id": dept_models["CSD"].id,
                "inventors": [("L. Varun (Student - CSD)", None, True)]
            },

            # CSBS
            {
                "title": "Automated supply chain risk optimization engine using smart contract ledgers",
                "application_number": "IN202511082918",
                "publication_number": None,
                "grant_number": None,
                "domain": "Business Systems",
                "category": "Software",
                "description": "A decentralised auditing platform coordinating logistics vendors and institutional purchase orders.",
                "status": "Patent Filed",
                "filing_date": datetime.date(2025, 6, 20),
                "publication_date": None,
                "grant_date": None,
                "department_id": dept_models["CSBS"].id,
                "inventors": [("Aman Kapoor (Student - CSBS)", None, True)]
            },
            {
                "title": "Predictive credit risk assessment platform for micro-finance institutions",
                "application_number": "IN202611081920",
                "publication_number": None,
                "grant_number": None,
                "domain": "Business Systems",
                "category": "Software",
                "description": "A machine learning scoring algorithm utilizing non-traditional transaction metadata.",
                "status": "Idea Identified",
                "filing_date": datetime.date(2026, 5, 10),
                "publication_date": None,
                "grant_date": None,
                "department_id": dept_models["CSBS"].id,
                "inventors": [("P. Sneha (Student - CSBS)", None, True)]
            }
        ]

        # Insert patents & link inventors
        for pat in patents_data:
            patent_model = models.Patent(
                title=pat["title"],
                application_number=pat["application_number"],
                publication_number=pat["publication_number"],
                grant_number=pat["grant_number"],
                domain=pat["domain"],
                category=pat["category"],
                description=pat["description"],
                status=pat["status"],
                filing_date=pat["filing_date"],
                publication_date=pat["publication_date"],
                grant_date=pat["grant_date"],
                department_id=pat["department_id"]
            )
            
            if pat["status"] in ["Under Examination", "FER Issued"]:
                patent_model.updated_at = datetime.datetime.utcnow() - datetime.timedelta(days=200)
            elif pat["status"] == "Draft Preparation":
                patent_model.updated_at = datetime.datetime.utcnow() - datetime.timedelta(days=100)
            elif pat["status"] == "Idea Identified":
                patent_model.updated_at = datetime.datetime.utcnow() - datetime.timedelta(days=120)
            else:
                patent_model.updated_at = datetime.datetime.utcnow() - datetime.timedelta(days=20)
            
            db.add(patent_model)
            db.commit()
            db.refresh(patent_model)

            # Link inventors
            for name, uid, is_prim in pat["inventors"]:
                inv = models.PatentInventor(
                    patent_id=patent_model.id,
                    user_id=uid,
                    inventor_name=name,
                    is_primary=is_prim
                )
                db.add(inv)

            # Add initial status history record
            history = models.PatentStatusHistory(
                patent_id=patent_model.id,
                status=pat["status"],
                notes=f"Initial status logged as {pat['status']}.",
                updated_by=admin_user.id
            )
            db.add(history)

        db.commit()

        # 4. Add Statutory Legal Notifications / Alerts
        n1 = models.Notification(
            user_id=cse_coord.id,
            title="FER Response Deadline Warning (CRITICAL)",
            message="High throughput distributed graph database engine (IT) has FER Response Deadline approaching.",
            read=False
        )
        n2 = models.Notification(
            user_id=admin_user.id,
            title="Annual Maintenance Fee Due (INFO)",
            message="Annual Patent Maintenance Fee due for Granted Patent IN384920B (CSE).",
            read=False
        )
        db.add_all([n1, n2])
        db.commit()

        print("Database re-seeded successfully with ALL 13 DEPARTMENTS containing active patent applications!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
