import random


APPROACHES = ["N", "S", "E", "W"]


class VehicleDetector:
    """
    Prototype vehicle detector.

    This is intentionally a backend simulation: it produces changing
    traffic counts until a real camera/YOLO pipeline is connected.
    """

    def __init__(self):
        self.state = {
            direction: {
                "lane1": random.randint(2, 18),
                "lane2": random.randint(1, 12),
            }
            for direction in APPROACHES
        }

    def get_current_traffic(self):
        result = {}

        for direction in APPROACHES:
            lane1 = self.state[direction]["lane1"]
            lane2 = self.state[direction]["lane2"]

            lane1 = max(0, min(40, lane1 + random.randint(-2, 2)))
            lane2 = max(0, min(40, lane2 + random.randint(-2, 2)))

            self.state[direction]["lane1"] = lane1
            self.state[direction]["lane2"] = lane2

            total = lane1 + lane2
            speed = (
                random.randint(5, 18)
                if total > 25
                else random.randint(25, 60)
            )

            result[direction] = {
                "vehicleCount": total,
                "lane1": lane1,
                "lane2": lane2,
                "avgSpeedKmh": speed,
                "occupancy": round(min(total / 40, 1), 2),
            }

        return result
