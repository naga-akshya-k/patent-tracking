import os
import sys
import datetime

# Add the backend root to sys.path so we can import 'app'
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    print("Step 1: Importing backend modules...")
    from app.config import settings
    from app.database import engine, Base, SessionLocal
    from app import models, schemas, auth
    from app.ai.ai_engine import categorizer_engine, forecaster_engine, risk_engine
    from app.seed import seed_database
    print("SUCCESS: Modules imported correctly.")
except Exception as e:
    print(f"FAILED: Import error: {e}")
    sys.exit(1)

def run_tests():
    print("\nStep 2: Checking database initialization...")
    try:
        # Override connection URL to a temp validation sqlite database
        settings.DATABASE_URL = "sqlite:///./validation_test.db"
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        print("SUCCESS: Tables generated in validation database.")
    except Exception as e:
        print(f"FAILED: Database table generation: {e}")
        sys.exit(1)

    print("\nStep 3: Checking database seeding...")
    try:
        seed_database()
        print("SUCCESS: Seeding completed.")
    except Exception as e:
        print(f"FAILED: Seeding: {e}")
        sys.exit(1)

    db = SessionLocal()
    try:
        user_count = db.query(models.User).count()
        patent_count = db.query(models.Patent).count()
        print(f"Verified Records - Users: {user_count}, Patents: {patent_count}")
        assert user_count > 0, "No users seeded"
        assert patent_count > 0, "No patents seeded"
    except Exception as e:
        print(f"FAILED: Database verification: {e}")
        sys.exit(1)

    print("\nStep 4: Training AI Categorization Engine...")
    try:
        categorizer_engine.train()
        print("SUCCESS: AI Categorizer trained.")
    except Exception as e:
        print(f"FAILED: AI Categorizer training: {e}")
        sys.exit(1)

    print("\nStep 5: Testing AI Domain Predictions...")
    test_titles = [
        ("Machine learning model for smart cars", "Artificial Intelligence"),
        ("IoT crop sensor system", "Internet of Things"),
        ("Wind turbine gear assembly", "Renewable Energy")
    ]
    for title, expected in test_titles:
        pred, conf = categorizer_engine.predict(title)
        print(f"Title: '{title}' => Predicted: '{pred}' (Conf: {conf:.2f})")
        assert pred is not None, "Failed to predict domain"

    print("\nStep 6: Testing AI Forecasting...")
    try:
        mock_trends = [
            {"year": 2021, "filings": 5, "grants": 1},
            {"year": 2022, "filings": 8, "grants": 2},
            {"year": 2023, "filings": 12, "grants": 4},
            {"year": 2024, "filings": 15, "grants": 5},
            {"year": 2025, "filings": 22, "grants": 8},
            {"year": 2026, "filings": 30, "grants": 12}
        ]
        forecast = forecaster_engine.forecast_growth(mock_trends, years_ahead=3)
        print("AI 3-Year Forecast Projections:")
        for item in forecast:
            print(f"  Year {item['year']} => Predicted Filings: {item['predicted_filings']}, Predicted Grants: {item['predicted_grants']}")
        assert len(forecast) == 3, "Should predict exactly 3 years"
    except Exception as e:
        print(f"FAILED: Forecasting test: {e}")
        sys.exit(1)

    print("\nStep 7: Testing AI Risk Assessor...")
    try:
        # Check a few seeded patents
        patents = db.query(models.Patent).all()
        for p in patents[:3]:
            docs = db.query(models.PatentDocument).filter(models.PatentDocument.patent_id == p.id).all()
            history = db.query(models.PatentStatusHistory).filter(models.PatentStatusHistory.patent_id == p.id).all()
            assessment = risk_engine.assess_risk(p, docs, history)
            print(f"Patent ID #{p.id} ('{p.title[:30]}...') => Status: {p.status} => Risk: {assessment['risk_level']}")
            if assessment['risk_level'] != 'Low':
                print(f"  Warnings: {assessment['reasons']}")
                print(f"  Actions: {assessment['action_items']}")
    except Exception as e:
        print(f"FAILED: Risk assessment test: {e}")
        sys.exit(1)
    finally:
        db.close()

    # Clean up validation database file
    try:
        if os.path.exists("validation_test.db"):
            os.remove("validation_test.db")
    except Exception:
        pass

    print("\nALL BACKEND UNIT TESTS COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
