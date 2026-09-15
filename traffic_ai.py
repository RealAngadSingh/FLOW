class TrafficOptimizer:
    """
    Rule-based adaptive traffic optimizer.

    It is a real backend decision engine, but it is NOT machine-learning
    or reinforcement learning yet.
    """

    def __init__(self):
        self.last_green = {"N": 0, "S": 0, "E": 0, "W": 0}
        self.tick = 0

    def decide(self, approaches):
        self.tick += 1

        scores = {}
        reasoning = []

        for direction, data in approaches.items():
            density = data["vehicleCount"]

            # Starvation protection: reward approaches that have waited.
            starvation = self.tick - self.last_green.get(direction, 0)
            starvation_bonus = max(0, starvation - 3) * 2

            score = density + starvation_bonus
            scores[direction] = round(score, 1)

            reasoning.append(
                f"{direction}: density={density} "
                f"starvation={starvation} score={score:.1f}"
            )

        chosen = max(scores, key=scores.get)
        self.last_green[chosen] = self.tick

        density = approaches[chosen]["vehicleCount"]
        green_duration = max(5, min(45, round(5 + (density / 40) * 40)))

        reasoning.append(
            f"Selected {chosen} — GREEN for {green_duration}s"
        )

        return {
            "approach": chosen,
            "greenDuration": green_duration,
            "amberDuration": 3,
            "scores": scores,
            "reasoning": reasoning,
        }

    @staticmethod
    def congestion_index(approaches):
        total = sum(x["vehicleCount"] for x in approaches.values())
        return round((total / (40 * 4)) * 100)
