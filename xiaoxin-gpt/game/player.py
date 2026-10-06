import pygame
from . import settings
from .collision import move_and_collide
from .renderer import CharacterRenderer


class Player:
    def __init__(self, spawn: tuple[int, int]):
        self.rect = pygame.Rect(spawn[0], spawn[1], 28, 42)
        self.velocity = pygame.Vector2()
        self.facing = 1
        self.grounded = False
        self.coyote = 0.0
        self.jump_buffer = 0.0
        self.dash_timer = 0.0
        self.dash_cooldown = 0.0
        self.invulnerable = 0.0
        self.anim_time = 0.0
        self.state = "idle"
        self.renderer = CharacterRenderer()

    def request_jump(self):
        self.jump_buffer = settings.JUMP_BUFFER

    def update(self, dt: float, held: set[str], solids: list[pygame.Rect], jump_pressed=False, dash_pressed=False):
        if jump_pressed:
            self.request_jump()
        self.jump_buffer = max(0.0, self.jump_buffer - dt)
        self.coyote = settings.COYOTE_TIME if self.grounded else max(0.0, self.coyote - dt)
        self.dash_cooldown = max(0.0, self.dash_cooldown - dt)
        self.invulnerable = max(0.0, self.invulnerable - dt)
        self.anim_time += dt

        direction = int("right" in held) - int("left" in held)
        if direction:
            self.facing = direction
        if dash_pressed and self.dash_cooldown <= 0:
            self.dash_timer = settings.DASH_DURATION
            self.dash_cooldown = settings.DASH_COOLDOWN
            self.velocity.x = self.facing * settings.DASH_SPEED
            self.velocity.y = min(self.velocity.y, 0)

        if self.dash_timer > 0:
            self.dash_timer = max(0.0, self.dash_timer - dt)
            self.velocity.x = self.facing * settings.DASH_SPEED
            self.velocity.y = 0
        else:
            max_speed = settings.PLAYER_RUN_SPEED if "run" in held else settings.PLAYER_SPEED
            target_x = direction * max_speed
            self.velocity.x = self._approach(self.velocity.x, target_x, settings.PLAYER_ACCEL * dt)
            if self.jump_buffer > 0 and self.coyote > 0:
                self.velocity.y = -settings.JUMP_SPEED
                self.grounded = False
                self.coyote = 0
                self.jump_buffer = 0
            self.velocity.y = min(settings.MAX_FALL_SPEED, self.velocity.y + settings.GRAVITY * dt)

        hit_x, hit_y = move_and_collide(self.rect, self.velocity, solids, dt)
        if hit_x:
            self.velocity.x = 0
            self.dash_timer = 0
        if hit_y:
            if self.velocity.y > 0:
                self.grounded = True
            self.velocity.y = 0
        else:
            self.grounded = False
        if self.grounded:
            self.coyote = settings.COYOTE_TIME
        self.state = "dash" if self.dash_timer else "jump" if not self.grounded else "walk" if abs(self.velocity.x) > 20 else "idle"

    @staticmethod
    def _approach(current: float, target: float, amount: float) -> float:
        if current < target:
            return min(target, current + amount)
        return max(target, current - amount)

    def draw(self, surface: pygame.Surface, camera, tick: int):
        """使用独立渲染器绘制角色"""
        rect = camera.apply(self.rect)
        self.renderer.draw(
            surface=surface,
            rect=rect,
            state=self.state,
            facing=self.facing,
            velocity_x=self.velocity.x,
            anim_time=self.anim_time,
            invulnerable=self.invulnerable,
            tick=tick
        )

