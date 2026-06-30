import datetime
import numpy as np
import pandas as pd
from typing import List, Dict, Tuple, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# 1. AI Patent Domain Categorization Engine
class AICategorizer:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.classifier = LogisticRegression(max_iter=1000)
        self.is_trained = False
        
        # Seed training corpus
        self.train_data = [
            # Artificial Intelligence / Machine Learning / Data Science
            ("Neural network architecture for real-time video object detection", "Artificial Intelligence"),
            ("Deep learning based speech synthesis and voice conversion system", "Artificial Intelligence"),
            ("Natural language processing for automated medical text summaries", "Artificial Intelligence"),
            ("Machine learning system to forecast stock market volatility", "Machine Learning"),
            ("Reinforcement learning for autonomous navigation of warehouse robots", "Machine Learning"),
            ("Predictive data analytics platform for user churn forecasting", "Data Science"),
            ("Big data clustering algorithms for high-dimensional sensor data", "Data Science"),
            
            # IoT & Cybersecurity
            ("Smart home IoT gateway with encrypted wireless communication", "Internet of Things"),
            ("Distributed wireless sensor network for agricultural climate monitoring", "Internet of Things"),
            ("Intrusion detection system using network packet anomaly classification", "Cybersecurity"),
            ("Zero-trust authentication framework for secure cloud storage access", "Cybersecurity"),
            ("Blockchain ledger mechanism for secure intellectual property logging", "Cybersecurity"),
            
            # Healthcare & Agriculture
            ("Non-invasive blood glucose monitoring system using infrared sensors", "Healthcare"),
            ("Wearable cardiac telemetry device with automatic arrhythmia warnings", "Healthcare"),
            ("AI-driven diagnostic analyzer for automated cell culture counting", "Healthcare"),
            ("Automated hydroponic irrigation control unit using soil moisture levels", "Agriculture"),
            ("Drone-based hyperspectral crop disease detection and fertilizer mapping", "Agriculture"),
            
            # Robotics & Electronics
            ("Six-axis robotic manipulator arm with force feedback sensors", "Robotics"),
            ("Self-balancing bipedal robot control system using IMU orientation", "Robotics"),
            ("High speed low power digital-to-analog converter interface", "Electronics"),
            ("Flexible printed circuit board design for wearable biosensors", "Electronics"),
            
            # Mechanical, Renewable Energy
            ("Adaptive fluid dynamic valve for variable pressure exhaust systems", "Mechanical Engineering"),
            ("High torque magnetic gear coupling mechanism for heavy machinery", "Mechanical Engineering"),
            ("Bifacial solar panel mounting system with astronomical tracker", "Renewable Energy"),
            ("High-capacity sodium-ion battery anode fabrication technique", "Renewable Energy"),
            ("Wind turbine power optimization controller adjusting blade pitch", "Renewable Energy")
        ]

    def train(self):
        texts = [item[0] for item in self.train_data]
        labels = [item[1] for item in self.train_data]
        
        X = self.vectorizer.fit_transform(texts)
        self.classifier.fit(X, labels)
        self.is_trained = True
        print("AI Categorizer trained successfully.")

    def predict(self, title: str, description: str = "") -> Tuple[str, float]:
        if not self.is_trained:
            self.train()
            
        text = f"{title} {description or ''}"
        X_test = self.vectorizer.transform([text])
        probabilities = self.classifier.predict_proba(X_test)[0]
        max_idx = np.argmax(probabilities)
        
        predicted_class = self.classifier.classes_[max_idx]
        confidence = float(probabilities[max_idx])
        
        return predicted_class, confidence


# 2. AI Trend Forecasting Engine
class AIForecaster:
    @staticmethod
    def forecast_growth(historical_filings: List[Dict[str, Any]], years_ahead: int = 3) -> List[Dict[str, Any]]:
        """
        Takes list of {'year': int, 'filings': int, 'grants': int}
        Fits linear trend and projects next years.
        """
        if len(historical_filings) < 2:
            # Fallback if insufficient historical data
            last_year = historical_filings[-1]['year'] if historical_filings else 2026
            last_filings = historical_filings[-1]['filings'] if historical_filings else 5
            last_grants = historical_filings[-1]['grants'] if historical_filings else 1
            predictions = []
            for i in range(1, years_ahead + 1):
                predictions.append({
                    "year": last_year + i,
                    "predicted_filings": int(last_filings * (1 + 0.1 * i)),
                    "predicted_grants": int(last_grants * (1 + 0.08 * i))
                })
            return predictions

        df = pd.DataFrame(historical_filings)
        
        X = df['year'].values.reshape(-1, 1)
        y_filings = df['filings'].values
        y_grants = df['grants'].values
        
        # Fit simple trends
        from sklearn.linear_model import LinearRegression
        model_filings = LinearRegression().fit(X, y_filings)
        model_grants = LinearRegression().fit(X, y_grants)
        
        last_year = int(df['year'].max())
        predictions = []
        
        for i in range(1, years_ahead + 1):
            target_year = last_year + i
            pred_f = model_filings.predict([[target_year]])[0]
            pred_g = model_grants.predict([[target_year]])[0]
            
            # Clamp to positive integers
            pred_f = max(0, int(round(pred_f)))
            pred_g = max(0, int(round(pred_g)))
            
            predictions.append({
                "year": target_year,
                "predicted_filings": pred_f,
                "predicted_grants": pred_g
            })
            
        return predictions


# 3. AI Risk Assessment Engine
class AIRiskAssessor:
    @staticmethod
    def assess_risk(patent: Any, documents: List[Any], history: List[Any]) -> Dict[str, Any]:
        """
        Analyzes status changes, duration, and missing documents to evaluate approval risks.
        """
        risk_level = "Low"
        reasons = []
        action_items = []
        
        # Calculate days in current status
        now = datetime.datetime.utcnow()
        last_update = patent.updated_at
        days_in_status = (now - last_update).days
        
        # Check for missing crucial documents based on status
        doc_types = [doc.document_type for doc in documents]
        
        if patent.status == "Idea Identified":
            if days_in_status > 90:
                risk_level = "Medium"
                reasons.append(f"Patent has been in 'Idea Identified' stage for {days_in_status} days without drafting progress.")
                action_items.append("Coordinate with the primary inventor to initiate drafting.")
                
        elif patent.status == "Draft Preparation":
            if days_in_status > 120:
                risk_level = "High"
                reasons.append(f"Drafting stage exceeding 4 months ({days_in_status} days). Possible stalling.")
                action_items.append("Set a strict deadline for patent draft submission and review with inventor.")
            elif "Patent Draft" not in doc_types:
                risk_level = "Medium"
                reasons.append("No active patent draft document has been uploaded for verification.")
                action_items.append("Upload the latest patent draft version.")

        elif patent.status == "Patent Filed":
            if "Filing Certificate" not in doc_types:
                risk_level = "Medium"
                reasons.append("Missing government filing certificate / official receipt.")
                action_items.append("Upload the official application receipt / filing certificate.")
            if days_in_status > 365:
                risk_level = "Medium"
                reasons.append(f"Filed over a year ago ({days_in_status} days) with no status updates to Published/Examined.")
                action_items.append("Query government IP portal for latest status updates.")

        elif patent.status == "Under Examination":
            if days_in_status > 270:
                risk_level = "High"
                reasons.append(f"Pending examination for {days_in_status} days. Exceeds standard evaluation times.")
                action_items.append("Contact the empanelled patent agent or query the examiner for status updates.")

        elif patent.status == "FER Issued":
            if days_in_status > 60:
                risk_level = "High"
                reasons.append(f"First Examination Report (FER) was issued {days_in_status} days ago without response submission.")
                action_items.append("FER responses typically have strict 6-month deadlines. Draft and submit FER response immediately.")
            elif "Examination Report" not in doc_types:
                risk_level = "Medium"
                reasons.append("FER is marked as issued but the report document is missing from repository.")
                action_items.append("Upload the official FER document received from patent office.")

        elif patent.status == "FER Responded":
            if days_in_status > 180:
                risk_level = "Medium"
                reasons.append(f"FER response submitted {days_in_status} days ago. Awaiting examiner response or grant hearing.")
                action_items.append("Follow up with patent counsel on any hearing scheduling.")

        elif patent.status == "Granted":
            if "Grant Certificate" not in doc_types:
                risk_level = "Medium"
                reasons.append("Patent is marked as granted, but official Grant Certificate is missing.")
                action_items.append("Upload the official grant certificate to seal the repository entry.")

        # Cap Risk Level depending on general factors
        # If there are no documents whatsoever and stage is past Idea
        if patent.status != "Idea Identified" and len(documents) == 0:
            risk_level = "High"
            reasons.append("No documentation uploaded. Zero audit trail in repository.")
            action_items.append("Upload application receipt, drafts, or relevant certificates immediately.")

        return {
            "patent_id": patent.id,
            "title": patent.title,
            "status": patent.status,
            "days_in_status": days_in_status,
            "risk_level": risk_level,
            "reasons": reasons,
            "action_items": action_items
        }

# Instantiate global engines
categorizer_engine = AICategorizer()
forecaster_engine = AIForecaster()
risk_engine = AIRiskAssessor()
