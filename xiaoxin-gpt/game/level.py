import json
from dataclasses import dataclass
from pathlib import Path
import pygame
from .enemies import Enemy
from .items import Collectible, Hazard
from .platforms import MovingPlatform


@dataclass
class Checkpoint:
    rect: pygame.Rect
    spawn: tuple[int, int]
    active: bool = False


class Level:
    def __init__(self, data: dict):
        self.name = data["name"]
        self.theme = data.get("theme", "street")
        self.width = int(data["width"])
        self.height = int(data["height"])
        self.world_size = (self.width, self.height)
        self.spawn = tuple(data["spawn"])
        self.finish = pygame.Rect(*data["finish"])
        self.solids = [pygame.Rect(*r) for r in data.get("solids", [])]
        self.platforms = [MovingPlatform(p) for p in data.get("moving_platforms", [])]
        self.enemies = [Enemy(e) for e in data.get("enemies", [])]
        self.items = [Collectible(i) for i in data.get("items", [])]
        self.hazards = [Hazard(h) for h in data.get("hazards", [])]
        self.checkpoints = [Checkpoint(pygame.Rect(*c["rect"]), tuple(c["spawn"])) for c in data.get("checkpoints", [])]
        self.solids.extend(p.rect for p in self.platforms)

    @classmethod
    def load(cls, path: str | Path):
        with Path(path).open(encoding="utf-8") as file:
            return cls(json.load(file))

    @classmethod
    def load_all(cls, directory: str | Path):
        return [cls.load(path) for path in sorted(Path(directory).glob("level_*.json"))]

    def update(self, dt: float, player_rect: pygame.Rect):
        old_solids = list(self.solids[:len(self.solids) - len(self.platforms)])
        for platform in self.platforms:
            platform.update(dt)
        self.solids = old_solids + [p.rect for p in self.platforms]
        for enemy in self.enemies:
            enemy.update(dt, player_rect, self.solids)
        for item in self.items:
            item.update(dt)
        for hazard in self.hazards:
            hazard.update(dt)

    def draw(self, surface: pygame.Surface, camera):
        palette = {
            "street": ((205, 232, 222), (104, 160, 142), (235, 214, 157)),
            "park": ((190, 222, 201), (102, 150, 105), (198, 176, 125)),
            "night": ((58, 85, 104), (67, 114, 103), (124, 104, 87)),
        }
        sky, ground, accent = palette.get(self.theme, palette["street"])
        surface.fill(sky)
        offset = camera.offset.x
        for x in range(-int(offset) % 192 - 192, 1280, 192):
            pygame.draw.circle(surface, (245, 246, 226), (x + 45, 112), 24)
            pygame.draw.circle(surface, (245, 246, 226), (x + 75, 111), 32)
            pygame.draw.circle(surface, (245, 246, 226), (x + 103, 117), 22)
        visible = pygame.Rect(int(camera.offset.x) - 80, int(camera.offset.y) - 80, 1440, 880)
        for solid in self.solids:
            if visible.colliderect(solid):
                rect = camera.apply(solid)
                pygame.draw.rect(surface, ground, rect)
                pygame.draw.rect(surface, accent, (rect.x, rect.y, rect.w, min(8, rect.h)))
                if rect.h >= 32:
                    for tx in range(rect.left + 8, rect.right, 32):
                        pygame.draw.line(surface, (*ground[:3],), (tx, rect.y + 9), (tx, rect.bottom), 1)
        for platform in self.platforms:
            if visible.colliderect(platform.rect):
                platform.draw(surface, camera)
        for checkpoint in self.checkpoints:
            if visible.colliderect(checkpoint.rect):
                rect = camera.apply(checkpoint.rect)
                pygame.draw.line(surface, (54, 87, 82), rect.midbottom, (rect.centerx, rect.top), 3)
                flag = (103, 197, 137) if checkpoint.active else (223, 172, 100)
                pygame.draw.polygon(surface, flag, [(rect.centerx, rect.top), (rect.right + 9, rect.top + 8), (rect.centerx, rect.top + 16)])
        if visible.colliderect(self.finish):
            rect = camera.apply(self.finish)
            pygame.draw.line(surface, (58, 83, 83), rect.midbottom, (rect.centerx, rect.top), 5)
            pygame.draw.polygon(surface, (238, 132, 93), [(rect.centerx, rect.top), (rect.right + 22, rect.top + 10), (rect.centerx, rect.top + 21)])
        for item in self.items:
            if not item.collected and visible.colliderect(item.rect):
                item.draw(surface, camera)
        for enemy in self.enemies:
            if enemy.alive and visible.colliderect(enemy.rect):
                enemy.draw(surface, camera)
        for hazard in self.hazards:
            if visible.colliderect(hazard.rect):
                hazard.draw(surface, camera)

