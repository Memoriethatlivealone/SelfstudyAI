import math
import pygame
from . import settings


class Enemy:
    def __init__(self, data: dict):
        self.kind = data.get("type", "patrol")
        self.rect = pygame.Rect(*data["rect"])
        self.origin_x = self.rect.x
        self.range = int(data.get("range", 100))
        self.speed = float(data.get("speed", 65))
        self.direction = -1
        self.velocity_y = 0.0
        self.alive = True
        self.phase = 0.0

    def update(self, dt: float, player_rect: pygame.Rect, solids: list[pygame.Rect]):
        if not self.alive:
            return
        self.phase += dt
        if self.kind == "chase" and abs(player_rect.centerx - self.rect.centerx) < 230:
            self.direction = 1 if player_rect.centerx > self.rect.centerx else -1
            speed = self.speed * 1.25
        else:
            speed = self.speed
            if self.rect.x < self.origin_x - self.range or self.rect.x > self.origin_x + self.range:
                self.direction *= -1
        self.rect.x += round(speed * self.direction * dt)
        if self.kind == "jumper" and self.phase >= 1.25:
            self.velocity_y = -370
            self.phase = 0
        self.velocity_y = min(800, self.velocity_y + settings.GRAVITY * dt)
        self.rect.y += round(self.velocity_y * dt)
        for solid in solids:
            if self.rect.colliderect(solid) and self.velocity_y >= 0:
                self.rect.bottom = solid.top
                self.velocity_y = 0

    def draw(self, surface, camera):
        if not self.alive:
            return
        rect = camera.apply(self.rect)
        colors = {"patrol": (224, 116, 79), "jumper": (199, 117, 183), "chase": (177, 86, 72)}
        pygame.draw.ellipse(surface, colors.get(self.kind, (224, 116, 79)), rect)
        pygame.draw.circle(surface, (250, 239, 218), (rect.x + rect.w // 3, rect.y + 9), 3)
        pygame.draw.circle(surface, (250, 239, 218), (rect.x + rect.w * 2 // 3, rect.y + 9), 3)
        pygame.draw.circle(surface, (35, 43, 46), (rect.x + rect.w // 3, rect.y + 9), 1)
        pygame.draw.circle(surface, (35, 43, 46), (rect.x + rect.w * 2 // 3, rect.y + 9), 1)

