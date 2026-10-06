import pygame


class Camera:
    def __init__(self, world_size: tuple[int, int], viewport: tuple[int, int]):
        self.world_size = world_size
        self.viewport = viewport
        self.offset = pygame.Vector2()

    def update(self, target: pygame.Rect):
        width, height = self.viewport
        world_w, world_h = self.world_size
        self.offset.x = max(0, min(target.centerx - width * 0.42, world_w - width))
        self.offset.y = max(0, min(target.centery - height * 0.56, world_h - height))

    def apply(self, rect: pygame.Rect) -> pygame.Rect:
        return rect.move(-round(self.offset.x), -round(self.offset.y))
