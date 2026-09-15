import random
from datetime import datetime, timezone


INCIDENT_TYPES = [
    "CRASH",
    "STALL",
    "DEBRIS",
    "PEDESTRIAN_EMERGENCY",
]

SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]


class IncidentDetector:
    """
    Backend incident simulator.

    Later this can be replaced with a computer-vision/anomaly model.
    """

    def __init__(self):
        self.sequence = 0
        self.active = []

    def detect(self):
        # Keep the demo event rate intentionally low.
        if random.random() >= 0.03:
            return None

        self.sequence += 1
        incident_type = random.choice(INCIDENT_TYPES)

        if incident_type == "CRASH":
            severity = random.choice(["HIGH", "CRITICAL"])
        else:
            severity = random.choice(SEVERITIES)

        incident = {
            "id": f"INC-{self.sequence:04d}",
            "type": incident_type,
            "severity": severity,
            "approach": random.choice(["N", "S", "E", "W"]),
            "intersectionId": "IX-001",
            "detectedAt": datetime.now(timezone.utc).isoformat(),
            "status": "DETECTED",
        }

        self.active.append(incident)

        # Keep the prototype from accumulating indefinitely.
        self.active = self.active[-10:]

        return incident

    def get_active(self):
        return self.active
