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
        faculty_pwd = auth.get_password_hash("Faculty123!")
        iqac_pwd = auth.get_password_hash("Iqac123!")

        admin_user = models.User(username="admin", email="admin@patentpulse.edu", hashed_password=admin_pwd, full_name="Dr. R. K. Vance", role="super_admin")
        cse_coord = models.User(username="cse_coordinator", email="cse.coordinator@patentpulse.edu", hashed_password=coord_pwd, full_name="Prof. David Miller", role="department_coordinator", department_id=cse.id)
        ece_coord = models.User(username="ece_coordinator", email="ece.coordinator@patentpulse.edu", hashed_password=coord_pwd, full_name="Prof. Susan Clarke", role="department_coordinator", department_id=ece.id)
        faculty_user = models.User(username="faculty", email="faculty@patentpulse.edu", hashed_password=faculty_pwd, full_name="Dr. Alan Turing", role="faculty_inventor", department_id=cse.id)
        faculty_user2 = models.User(username="faculty_ece", email="ece.faculty@patentpulse.edu", hashed_password=faculty_pwd, full_name="Dr. Nikola Tesla", role="faculty_inventor", department_id=ece.id)
        iqac_user = models.User(username="iqac", email="iqac@patentpulse.edu", hashed_password=iqac_pwd, full_name="Dr. IQAC Lead", role="management_viewer")

        db.add_all([admin_user, cse_coord, ece_coord, faculty_user, faculty_user2, iqac_user])
        db.commit()

        # 3. Seed Patents
        # We need historical patent filing data spanning from 2021 to 2026.
        # This gives a nice trajectory for our forecaster.
        patents_data = [
            # 2021
            {
                "title": "Machine learning based load balancer for distributed computing networks",
                "application_number": "IN202111045621",
                "publication_number": "IN202111045621A",
                "grant_number": "IN384920B",
                "domain": "Machine Learning",
                "category": "Software",
                "description": "An intelligent load balancing model employing reinforcement learning to distribute network loads across multiple micro-servers dynamically.",
                "status": "Granted",
                "filing_date": datetime.date(2021, 3, 14),
                "publication_date": datetime.date(2021, 9, 24),
                "grant_date": datetime.date(2023, 11, 5),
                "department_id": cse.id,
                "inventors": [("Dr. Alan Turing", faculty_user.id, True), ("Dr. Sarah Jenkins", None, False)]
            },
            {
                "title": "High performance thermoelectric cooler device with bismuth telluride alloys",
                "application_number": "IN202111059281",
                "publication_number": "IN202111059281A",
                "grant_number": "IN392019B",
                "domain": "Electronics",
                "category": "Hardware",
                "description": "A novel structure for solid-state cooling utilizing advanced bismuth telluride alloy layering to achieve 15% higher efficiency.",
                "status": "Granted",
                "filing_date": datetime.date(2021, 7, 20),
                "publication_date": datetime.date(2021, 12, 10),
                "grant_date": datetime.date(2024, 1, 12),
                "department_id": ece.id,
                "inventors": [("Dr. Nikola Tesla", faculty_user2.id, True)]
            },
            # 2022
            {
                "title": "IoT based smart agricultural watering scheduling mechanism",
                "application_number": "IN202211029102",
                "publication_number": "IN202211029102A",
                "grant_number": None,
                "domain": "Internet of Things",
                "category": "Hardware",
                "description": "An automated irrigation system combining soil moisture arrays, weather API data, and IoT microcontrollers to optimize water consumption.",
                "status": "Published",
                "filing_date": datetime.date(2022, 2, 11),
                "publication_date": datetime.date(2022, 8, 19),
                "grant_date": None,
                "department_id": cse.id,
                "inventors": [("Prof. David Miller", cse_coord.id, True), ("Dr. Alan Turing", faculty_user.id, False)]
            },
            {
                "title": "Double-acting hydraulic shock absorber assembly for heavy trucks",
                "application_number": "IN202211099231",
                "publication_number": "IN202211099231A",
                "grant_number": "IN402912B",
                "domain": "Mechanical Engineering",
                "category": "Hardware",
                "description": "A shock absorber structure featuring dual damping valves, enhancing passenger comfort and mechanical durability in industrial class-8 trucks.",
                "status": "Granted",
                "filing_date": datetime.date(2022, 6, 5),
                "publication_date": datetime.date(2022, 12, 15),
                "grant_date": datetime.date(2024, 8, 22),
                "department_id": me.id,
                "inventors": [("Prof. James Watt", None, True)]
            },
            # 2023
            {
                "title": "Wearable ECG sensor array with automated cardiovascular anomaly forecasting",
                "application_number": "IN202311019283",
                "publication_number": "IN202311019283A",
                "grant_number": None,
                "domain": "Healthcare",
                "category": "Hardware",
                "description": "A lightweight skin-adhering patch that tracks multi-lead ECG signals and applies lightweight on-device CNN classifiers to detect atrial fibrillation.",
                "status": "Under Examination",
                "filing_date": datetime.date(2023, 4, 18),
                "publication_date": datetime.date(2023, 10, 29),
                "grant_date": None,
                "department_id": ece.id,
                "inventors": [("Dr. Nikola Tesla", faculty_user2.id, True), ("Prof. Susan Clarke", ece_coord.id, False)]
            },
            {
                "title": "Enzymatic bioreactor design for rapid cellulose degradation",
                "application_number": "IN202311039822",
                "publication_number": "IN202311039822A",
                "grant_number": None,
                "domain": "Healthcare",
                "category": "Process",
                "description": "A biological reactor incorporating immobilized enzymes to speed up the decomposition of plant-based waste materials into bio-ethanol.",
                "status": "Under Examination",
                "filing_date": datetime.date(2023, 8, 12),
                "publication_date": datetime.date(2024, 2, 23),
                "grant_date": None,
                "department_id": bt.id,
                "inventors": [("Dr. Rosalind Franklin", None, True)]
            },
            # 2024
            {
                "title": "Deep learning system for micro-calcification classification in digital mammography",
                "application_number": "IN202411082910",
                "publication_number": None,
                "grant_number": None,
                "domain": "Artificial Intelligence",
                "category": "Software",
                "description": "A neural network pipeline that extracts spatial features from mammograms and outputs malignancy risks for breast cancer screening.",
                "status": "FER Issued",
                "filing_date": datetime.date(2024, 3, 2),
                "publication_date": None,
                "grant_date": None,
                "department_id": cse.id,
                "inventors": [("Dr. Alan Turing", faculty_user.id, True)]
            },
            {
                "title": "Hybrid solar-wind energy grid optimizer using genetic algorithms",
                "application_number": "IN202411091823",
                "publication_number": "IN202411091823A",
                "grant_number": None,
                "domain": "Renewable Energy",
                "category": "Software",
                "description": "A microgrid controller that coordinates battery state, wind turbine pitch, and solar PV angles using genetic optimization techniques.",
                "status": "FER Responded",
                "filing_date": datetime.date(2024, 7, 15),
                "publication_date": datetime.date(2025, 1, 24),
                "grant_date": None,
                "department_id": ece.id,
                "inventors": [("Dr. Nikola Tesla", faculty_user2.id, True)]
            },
            # 2025
            {
                "title": "Cybersecurity anomaly detection framework for zero-trust enterprise intranets",
                "application_number": "IN202511019281",
                "publication_number": None,
                "grant_number": None,
                "domain": "Cybersecurity",
                "category": "Software",
                "description": "A network security architecture that enforces continuous authentication and monitors intra-network packets for lateral movement anomalies.",
                "status": "Patent Filed",
                "filing_date": datetime.date(2025, 2, 28),
                "publication_date": None,
                "grant_date": None,
                "department_id": cse.id,
                "inventors": [("Dr. Alan Turing", faculty_user.id, True), ("Prof. David Miller", cse_coord.id, False)]
            },
            {
                "title": "Bipedal robotic gait adaptation system using terrain mapping depth cameras",
                "application_number": "IN202511051928",
                "publication_number": None,
                "grant_number": None,
                "domain": "Robotics",
                "category": "Hardware",
                "description": "A locomotion controller for legged robots that feeds depth camera terrain point clouds into neural networks to adjust foot positioning dynamically.",
                "status": "Patent Filed",
                "filing_date": datetime.date(2025, 5, 12),
                "publication_date": None,
                "grant_date": None,
                "department_id": me.id,
                "inventors": [("Prof. Susan Clarke", ece_coord.id, False), ("Dr. Alan Turing", faculty_user.id, True)]
            },
            # 2026 (Recent Ideas / Drafts)
            {
                "title": "Smart automated green-house monitoring node using LoRaWAN transmission",
                "application_number": None,
                "publication_number": None,
                "grant_number": None,
                "domain": "Internet of Things",
                "category": "Hardware",
                "description": "A battery-powered sensor probe transmitting temperature, humidity, and soil pH levels over 5km using low-power wide-area networks.",
                "status": "Draft Preparation",
                "filing_date": None,
                "publication_date": None,
                "grant_date": None,
                "department_id": ece.id,
                "inventors": [("Dr. Nikola Tesla", faculty_user2.id, True)]
            },
            {
                "title": "Secure decentralized credential storage protocol based on zero-knowledge proofs",
                "application_number": None,
                "publication_number": None,
                "grant_number": None,
                "domain": "Cybersecurity",
                "category": "Software",
                "description": "A cryptographic mechanism allowing users to authenticate their credentials to university resources without revealing personal data.",
                "status": "Idea Identified",
                "filing_date": None,
                "publication_date": None,
                "grant_date": None,
                "department_id": cse.id,
                "inventors": [("Dr. Alan Turing", faculty_user.id, True)]
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
            message="Deep learning system for micro-calcification classification has been in FER Issued status for >60 days. Response deadline is approaching.",
            read=False
        )
        n2 = models.Notification(
            user_id=faculty_user.id,
            title="Patent Granted!",
            message="Your patent 'Machine learning based load balancer' has been officially granted.",
            read=False
        )
        db.add_all([n1, n2])
        db.commit()

        print("Database seeded successfully with default departments, users, and historical patents!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
