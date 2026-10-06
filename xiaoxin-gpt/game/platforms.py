import math
import pygame


class MovingPlatform:
    def __init__(self, data: dict):
        self.rect = pygame.Rect(*data["rect"])
        self.start = pygame.Vector2(self.rect.topleft)
        self.end = pygame.Vector2(data["end"])
        self.speed = float(data.get("speed", 90))
        self.phase = float(data.get("phase", 0))
        self.previous = self.rect.copy()

    def update(self, dt: float):
        self.previous = self.rect.copy()
        self.phase = (self.phase + dt * self.speed / max(1, (self.end - self.start).length())) % 2
        t = self.phase if self.phase <= 1 else 2 - self.phase
        pos = self.start.lerp(self.end, t)
        self.rect.topleft = (round(pos.x), round(pos.y))

    def draw(self, surface, camera):
        rect = camera.apply(self.rect)
        pygame.draw.rect(surface, (57, 128, 110), rect, border_radius=4)
        pygame.draw.rect(surface, (143, 205, 165), (rect.x, rect.y, rect.w, 6), border_radius=3)

