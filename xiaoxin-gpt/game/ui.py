import pygame
from .settings import LOGICAL_SIZE


def load_font(size: int, bold: bool = False) -> pygame.font.Font:
    """通过字体文件路径加载，避开部分 Pygame 版本的 SysFont 兼容问题。"""
    for name in ("microsoftyahei", "simhei", "simsun", "arial"):
        try:
            path = pygame.font.match_font(name, bold=bold)
            if path:
                return pygame.font.Font(path, size)
        except (OSError, TypeError, ValueError):
            continue
    return pygame.font.Font(None, size)


class UI:
    def __init__(self):
        self.font = load_font(23, bold=True)
        self.small = load_font(17)
        self.title = load_font(48, bold=True)

    def text(self, surface, value, pos, font=None, color=(34, 50, 50), center=False):
        image = (font or self.font).render(value, True, color)
        rect = image.get_rect(center=pos) if center else image.get_rect(topleft=pos)
        surface.blit(image, rect)

    def hud(self, surface, level, lives, score, collected, time_left):
        panel = pygame.Surface((LOGICAL_SIZE[0], 48), pygame.SRCALPHA)
        panel.fill((245, 248, 230, 228))
        surface.blit(panel, (0, 0))
        self.text(surface, level.name, (20, 11))
        self.text(surface, f"生命  {lives}", (400, 11))
        self.text(surface, f"零食  {collected}", (565, 11))
        self.text(surface, f"分數  {score}", (730, 11))
        self.text(surface, f"時間  {max(0, int(time_left))}", (910, 11))
        self.text(surface, "Esc 暂停", (1160, 15), self.small, (56, 75, 74))

    def overlay(self, surface, heading, lines, accent=(245, 235, 204)):
        shade = pygame.Surface(LOGICAL_SIZE, pygame.SRCALPHA)
        shade.fill((25, 37, 41, 178))
        surface.blit(shade, (0, 0))
        self.text(surface, heading, (640, 284), self.title, accent, True)
        for index, line in enumerate(lines):
            self.text(surface, line, (640, 362 + index * 42), self.font, (247, 248, 233), True)
