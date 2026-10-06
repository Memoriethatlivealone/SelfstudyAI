import pygame


class Collectible:
    def __init__(self, data: dict):
        self.kind = data.get("type", "snack")
        x, y = data["pos"]
        self.rect = pygame.Rect(x, y, 22, 22)
        self.base_y = y
        self.phase = float(data.get("phase", 0))
        self.collected = False

    def update(self, dt: float):
        self.phase += dt * 3
        self.rect.y = self.base_y + round(4 * __import__("math").sin(self.phase))

    def draw(self, surface, camera):
        if self.collected:
            return
        rect = camera.apply(self.rect)
        color = (248, 191, 70) if self.kind == "snack" else (230, 112, 137)
        pygame.draw.circle(surface, color, rect.center, 10)
        pygame.draw.circle(surface, (255, 243, 192), (rect.centerx - 3, rect.centery - 3), 3)
        pygame.draw.circle(surface, (127, 81, 48), rect.center, 10, 2)


class Hazard:
    def __init__(self, data: dict):
        self.kind = data.get("type", "spikes")
        self.rect = pygame.Rect(*data["rect"])
        self.period = float(data.get("period", 2.4))
        self.active_time = float(data.get("active", 1.0))
        self.phase = float(data.get("phase", 0))

    @property
    def active(self):
        return self.kind != "pulse" or (self.phase % self.period) < self.active_time

    def update(self, dt: float):
        self.phase += dt

    def draw(self, surface, camera):
        rect = camera.apply(self.rect)
        if self.kind == "pulse":
            pygame.draw.rect(surface, (211, 92, 70) if self.active else (88, 145, 133), rect, border_radius=5)
            if self.active:
                for x in range(rect.left + 3, rect.right, 12):
                    pygame.draw.line(surface, (255, 198, 123), (x, rect.top + 2), (x - 6, rect.bottom - 2), 2)
        else:
            pygame.draw.rect(surface, (151, 79, 77), rect)
            for x in range(rect.left, rect.right, 18):
                pygame.draw.polygon(surface, (224, 126, 103), [(x, rect.bottom), (x + 9, rect.top), (x + 18, rect.bottom)])
