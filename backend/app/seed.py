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
        # 1. Seed Departments
        cse = models.Department(name="Computer Science & Engineering", code="CSE")
        ece = models.Department(name="Electronics & Communication Engineering", code="ECE")
        me = models.Department(name="Mechanical Engineering", code="ME")
        bt = models.Department(name="Biotechnology & Healthcare", code="BT")
        db.add_all([cse, ece, me, bt])
        db.commit()

        # Refresh departments to get IDs
        db.refresh(cse)
        db.refresh(ece)
        db.refresh(me)
        db.refresh(bt)

        # 2. Seed Users with role credentials
        admin_pwd = auth.get_password_hash("Admin123!")
        coord_pwd = auth.get_password_hash("Coord123!")
        iqac_pwd = auth.get_password_hash("Iqac123!")

        admin_user = models.User(username="admin", email="admin@patentpulse.edu", hashed_password=admin_pwd, full_name="Dr. R. K. Vance", role="super_admin")
        cse_coord = models.User(username="cse_coordinator", email="cse.coordinator@patentpulse.edu", hashed_password=coord_pwd, full_name="Prof. David Miller", role="department_coordinator", department_id=cse.id)
        ece_coord = models.User(username="ece_coordinator", email="ece.coordinator@patentpulse.edu", hashed_password=coord_pwd, full_name="Prof. Susan Clarke", role="department_coordinator", department_id=ece.id)
        me_coord = models.User(username="me_coordinator", email="me.coordinator@patentpulse.edu", hashed_password=coord_pwd, full_name="Prof. H. S. Murthy", role="department_coordinator", department_id=me.id)
        iqac_user = models.User(username="auditor", email="auditor@patentpulse.edu", hashed_password=iqac_pwd, full_name="Dr. IQAC Lead", role="management_viewer")

        db.add_all([admin_user, cse_coord, ece_coord, me_coord, iqac_user])
        db.commit()

        # 3. Seed Student Patents (2021 to 2026)
        patents_data = [
            # 2021
            {
                "title": "Machine learning based dynamic load balancer for campus cloud servers",
                "application_number": "IN202111045621",
                "publication_number": "IN202111045621A",
                "grant_number": "IN384920B",
                "domain": "Machine Learning",
                "category": "Software",
                "description": "An intelligent load balancing model developed by CSE students employing reinforcement learning to distribute local college server requests.",
                "status": "Granted",
                "filing_date": datetime.date(2021, 3, 14),
                "publication_date": datetime.date(2021, 9, 24),
                "grant_date": datetime.date(2023, 11, 5),
                "department_id": cse.id,
                "inventors": [("Aarav Sharma (Student - CSE)", None, True), ("Prof. David Miller (Advisor)", cse_coord.id, False)]
            },
            {
                "title": "High efficiency thermoelectric solar panel cooling device with bismuth alloys",
                "application_number": "IN202111059281",
                "publication_number": "IN202111059281A",
                "grant_number": "IN392019B",
                "domain": "Electronics",
                "category": "Hardware",
                "description": "A student hardware prototype utilizing thermoelectric bismuth layering to cool solar PV modules and raise solar efficiency in colleges by 15%.",
                "status": "Granted",
                "filing_date": datetime.date(2021, 7, 20),
                "publication_date": datetime.date(2021, 12, 10),
                "grant_date": datetime.date(2024, 1, 12),
                "department_id": ece.id,
                "inventors": [("Rohan Malhotra (Student - ECE)", None, True), ("Prof. Susan Clarke (Advisor)", ece_coord.id, False)]
            },
            # 2022
            {
                "title": "IoT based automated smart watering controller for greenhouse plants",
                "application_number": "IN202211029102",
                "publication_number": "IN202211029102A",
                "grant_number": None,
                "domain": "Internet of Things",
                "category": "Hardware",
                "description": "An automated drip irrigation controller designed by CSE students utilizing ESP32, soil moisture arrays, and internet-triggered scheduling.",
                "status": "Published",
                "filing_date": datetime.date(2022, 2, 11),
                "publication_date": datetime.date(2022, 8, 19),
                "grant_date": None,
                "department_id": cse.id,
                "inventors": [("Ananya Iyer (Student - CSE)", None, True), ("Prof. David Miller (Advisor)", cse_coord.id, False)]
            },
            {
                "title": "Pneumatically assisted double-acting shock absorber for warehouse machinery",
                "application_number": "IN202211099231",
                "publication_number": "IN202211099231A",
                "grant_number": "IN402912B",
                "domain": "Mechanical Engineering",
                "category": "Hardware",
                "description": "A pneumatic damping assembly designed by Mechanical students to protect factory machines from micro-structural vibrational damage.",
                "status": "Granted",
                "filing_date": datetime.date(2022, 6, 5),
                "publication_date": datetime.date(2022, 12, 15),
                "grant_date": datetime.date(2024, 8, 22),
                "department_id": me.id,
                "inventors": [("Vikram Sen (Student - ME)", None, True), ("Prof. H. S. Murthy (Advisor)", me_coord.id, False)]
            },
            # 2023
            {
                "title": "Wearable ECG sensor array with automated cardiovascular anomaly classification",
                "application_number": "IN202311019283",
                "publication_number": "IN202311019283A",
                "grant_number": None,
                "domain": "Healthcare",
                "category": "Hardware",
                "description": "A smart medical patch that tracks ECG signals and applies localized neural network thresholds to alert users of irregular patterns.",
                "status": "Under Examination",
                "filing_date": datetime.date(2023, 4, 18),
                "publication_date": datetime.date(2023, 10, 29),
                "grant_date": None,
                "department_id": ece.id,
                "inventors": [("Ishaan Goel (Student - ECE)", None, True), ("Prof. Susan Clarke (Advisor)", ece_coord.id, False)]
            },
            {
                "title": "Continuous enzymatic bioreactor design for rapid agricultural cellulose degradation",
                "application_number": "IN202311039822",
                "publication_number": "IN202311039822A",
                "grant_number": None,
                "domain": "Healthcare",
                "category": "Process",
                "description": "A biological reactor incorporating immobilized enzymes to speed up decomposition of plant residues into clean bio-ethanol fuels.",
                "status": "Under Examination",
                "filing_date": datetime.date(2023, 8, 12),
                "publication_date": datetime.date(2024, 2, 23),
                "grant_date": None,
                "department_id": bt.id,
                "inventors": [("Nisha Rao (Student - BT)", None, True)]
            },
            # 2024
            {
                "title": "Deep learning system for micro-calcification categorization in digital mammography",
                "application_number": "IN202411082910",
                "publication_number": None,
                "grant_number": None,
                "domain": "Artificial Intelligence",
                "category": "Software",
                "description": "A computer vision model developed by CSE seniors that outputs malignancy risks for breast cancer screening assistance.",
                "status": "FER Issued",
                "filing_date": datetime.date(2024, 3, 2),
                "publication_date": None,
                "grant_date": None,
                "department_id": cse.id,
                "inventors": [("Aditya Vardhan (Student - CSE)", None, True), ("Prof. David Miller (Advisor)", cse_coord.id, False)]
            },
            {
                "title": "Hybrid solar-wind local grid power distributor using genetic algorithms",
                "application_number": "IN202411091823",
                "publication_number": "IN202411091823A",
                "grant_number": None,
                "domain": "Renewable Energy",
                "category": "Software",
                "description": "An automated microgrid switcher that coordinates battery levels and solar PV arrays using dynamic genetic optimizations.",
                "status": "FER Responded",
                "filing_date": datetime.date(2024, 7, 15),
                "publication_date": datetime.date(2025, 1, 24),
                "grant_date": None,
                "department_id": ece.id,
                "inventors": [("Kiran Rao (Student - ECE)", None, True), ("Prof. Susan Clarke (Advisor)", ece_coord.id, False)]
            },
            # 2025
            {
                "title": "Zero-trust network intrusion detection system based on lateral anomaly checking",
                "application_number": "IN202511019281",
                "publication_number": None,
                "grant_number": None,
                "domain": "Cybersecurity",
                "category": "Software",
                "description": "A security framework verifying student intranet traffic using machine learning classifiers to flag potential compromised nodes.",
                "status": "Patent Filed",
                "filing_date": datetime.date(2025, 2, 28),
                "publication_date": None,
                "grant_date": None,
                "department_id": cse.id,
                "inventors": [("Sanya Gupta (Student - CSE)", None, True), ("Prof. David Miller (Advisor)", cse_coord.id, False)]
            },
            {
                "title": "Bipedal robotic gait adaptation system using terrain mapping depth cameras",
                "application_number": "IN202511051928",
                "publication_number": None,
                "grant_number": None,
                "domain": "Robotics",
                "category": "Hardware",
                "description": "A mechanical legged robot controller that processes real-time depth mapping to adjust foot placing over irregular obstacles.",
                "status": "Patent Filed",
                "filing_date": datetime.date(2025, 5, 12),
                "publication_date": None,
                "grant_date": None,
                "department_id": me.id,
                "inventors": [("Arjun Reddy (Student - ME)", None, True), ("Prof. H. S. Murthy (Advisor)", me_coord.id, False)]
            },
            # 2026
            {
                "title": "Smart automated greenhouse monitoring node using LoRaWAN transmission",
                "application_number": None,
                "publication_number": None,
                "grant_number": None,
                "domain": "Internet of Things",
                "category": "Hardware",
                "description": "A battery-powered student hardware prototype transmitting temperature and soil pH over 5km using low-power wide-area mesh signals.",
                "status": "Draft Preparation",
                "filing_date": None,
                "publication_date": None,
                "grant_date": None,
                "department_id": ece.id,
                "inventors": [("Arjun Das (Student - ECE)", None, True)]
            },
            {
                "title": "Secure decentralized student credential verification system using zero-knowledge proofs",
                "application_number": None,
                "publication_number": None,
                "grant_number": None,
                "domain": "Cybersecurity",
                "category": "Software",
                "description": "A cryptographic backend allowing student identity verifications for exams without exposing private register metrics.",
                "status": "Idea Identified",
                "filing_date": None,
                "publication_date": None,
                "grant_date": None,
                "department_id": cse.id,
                "inventors": [("Siddharth Sen (Student - CSE)", None, True)]
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
            # Artificially shift updated_at backward in time to trigger AI Risk warnings
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
            
            # For Granted patents, simulate history milestones
            if pat["status"] == "Granted":
                history1 = models.PatentStatusHistory(
                    patent_id=patent_model.id,
                    status="Patent Filed",
                    notes="Official application filed.",
                    updated_by=admin_user.id,
                    changed_at=datetime.datetime.combine(pat["filing_date"], datetime.time.min)
                )
                history2 = models.PatentStatusHistory(
                    patent_id=patent_model.id,
                    status="Published",
                    notes="Published in Patent Office Gazette.",
                    updated_by=admin_user.id,
                    changed_at=datetime.datetime.combine(pat["publication_date"], datetime.time.min)
                )
                db.add_all([history1, history2])

        db.commit()

        # 4. Add initial notifications
        n1 = models.Notification(
            user_id=cse_coord.id,
            title="FER Deadline Warning",
            message="Deep learning system for mammography by student Aditya Vardhan has been in FER Issued status for >60 days. Response deadline is approaching.",
            read=False
        )
        db.add(n1)
        db.commit()

        print("Database seeded successfully with default departments, admin users, and student patents!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
