import argparse
import sys
from pathlib import Path
import pygame
from . import settings
from .camera import Camera
from .level import Level
from .player import Player
from .states import GameState
from .ui import UI


class Game:
    def __init__(self, headless=False, start_playing=False):
        pygame.init()
        pygame.display.set_caption(settings.TITLE)
        flags = pygame.RESIZABLE | (pygame.HIDDEN if headless else 0)
        self.window = pygame.display.set_mode(settings.LOGICAL_SIZE, flags)
        self.canvas = pygame.Surface(settings.LOGICAL_SIZE)
        self.clock = pygame.time.Clock()
        self.ui = UI()
        self.level_paths = sorted(settings.LEVELS_DIR.glob("level_*.json"))
        self.levels = [Level.load(path) for path in self.level_paths]
        if not self.level_paths:
            raise RuntimeError("levels 目录中没有可读取的关卡 JSON")
        self.level_index = 0
        self.state = GameState.PLAYING if start_playing else GameState.TITLE
        self.lives = settings.STARTING_LIVES
        self.score = 0
        self.collected = 0
        self.elapsed = 0.0
        self.deaths = 0
        self.shake = 0.0
        self.held_keys = set()
        self.load_level(0)

    @property
    def level(self):
        return self.levels[self.level_index]

    def load_level(self, index):
        self.level_index = index
        self.levels[index] = Level.load(self.level_paths[index])
        self.player = Player(self.level.spawn)
        self.camera = Camera(self.level.world_size, settings.LOGICAL_SIZE)
        self.elapsed = 0.0
        self.level_time = settings.LEVEL_TIME

    def handle_event(self, event):
        if event.type == pygame.QUIT:
            return False
        if event.type == pygame.WINDOWFOCUSLOST:
            self.held_keys.clear()
            # 窗口失焦时清空玩家速度，防止角色继续移动
            if hasattr(self, 'player'):
                self.player.velocity.x = 0
            return True
        if event.type == pygame.KEYDOWN:
            if event.key in (pygame.K_a, pygame.K_LEFT):
                self.held_keys.add("left")
            elif event.key in (pygame.K_d, pygame.K_RIGHT):
                self.held_keys.add("right")
            elif event.key in (pygame.K_LSHIFT, pygame.K_RSHIFT):
                self.held_keys.update(("run", "dash"))
            elif event.key == pygame.K_SPACE:
                self.held_keys.add("jump")
        elif event.type == pygame.KEYUP:
            if event.key in (pygame.K_a, pygame.K_LEFT):
                self.held_keys.discard("left")
            elif event.key in (pygame.K_d, pygame.K_RIGHT):
                self.held_keys.discard("right")
            elif event.key in (pygame.K_LSHIFT, pygame.K_RSHIFT):
                self.held_keys.discard("run")
                self.held_keys.discard("dash")
            elif event.key == pygame.K_SPACE:
                self.held_keys.discard("jump")
        if event.type == pygame.KEYDOWN:
            if self.state == GameState.TITLE:
                if event.key in (pygame.K_RETURN, pygame.K_SPACE):
                    self.state = GameState.PLAYING
                elif event.key in (pygame.K_a, pygame.K_d, pygame.K_LEFT, pygame.K_RIGHT, pygame.K_LSHIFT, pygame.K_RSHIFT):
                    self.state = GameState.PLAYING
                elif event.key == pygame.K_ESCAPE:
                    return False
            elif self.state == GameState.PLAYING:
                if event.key == pygame.K_ESCAPE:
                    self.state = GameState.PAUSED
                elif event.key == pygame.K_r:
                    self.load_level(self.level_index)
                elif event.key == pygame.K_SPACE:
                    self.player.request_jump()
            elif self.state == GameState.PAUSED:
                if event.key == pygame.K_ESCAPE:
                    self.state = GameState.PLAYING
                elif event.key == pygame.K_RETURN:
                    self.state = GameState.PLAYING
                elif event.key == pygame.K_r:
                    self.load_level(self.level_index)
            elif self.state in (GameState.LEVEL_COMPLETE, GameState.VICTORY):
                if event.key in (pygame.K_RETURN, pygame.K_SPACE):
                    if self.state == GameState.VICTORY:
                        self.lives = settings.STARTING_LIVES
                        self.score = self.collected = self.deaths = 0
                        self.load_level(0)
                        self.state = GameState.PLAYING
                    else:
                        self.load_level(self.level_index + 1)
                        self.state = GameState.PLAYING
            elif self.state == GameState.GAME_OVER:
                if event.key in (pygame.K_RETURN, pygame.K_r):
                    self.lives = settings.STARTING_LIVES
                    self.score = self.collected = self.deaths = 0
                    self.load_level(0)
                    self.state = GameState.PLAYING
                elif event.key == pygame.K_ESCAPE:
                    return False
        return True

    def update(self, dt):
        if self.state != GameState.PLAYING:
            return
        self.elapsed += dt
        self.level_time -= dt
        if self.level_time <= 0:
            self.damage_player(force=True)
            if self.state != GameState.GAME_OVER:
                self.level_time = settings.LEVEL_TIME

        # 使用事件驱动的按键状态，避免轮询式检测导致的状态不一致
        held = set(self.held_keys)
        dash_pressed = "dash" in held
        held_for_player = held - {"jump", "dash"}
        self.player.update(dt, held_for_player, self.level.solids, jump_pressed=False, dash_pressed=dash_pressed)
        self.held_keys.discard("dash")
        self.level.update(dt, self.player.rect)
        if self.player.rect.top > self.level.height + 64:
            self.damage_player(force=True)
            return
        for checkpoint in self.level.checkpoints:
            if self.player.rect.colliderect(checkpoint.rect) and not checkpoint.active:
                for other in self.level.checkpoints: other.active = False
                checkpoint.active = True
                self.checkpoint_spawn = checkpoint.spawn
                self.score += 100
        for enemy in self.level.enemies:
            if enemy.alive and self.player.rect.colliderect(enemy.rect):
                if self.player.velocity.y > 80 and self.player.rect.bottom - enemy.rect.top < 20:
                    enemy.alive = False
                    self.player.velocity.y = -settings.JUMP_SPEED * 0.53
                    self.score += 200
                elif self.player.dash_timer > 0:
                    enemy.alive = False
                    self.score += 150
                else:
                    self.damage_player()
        for hazard in self.level.hazards:
            if hazard.active and self.player.rect.colliderect(hazard.rect):
                self.damage_player()
        for item in self.level.items:
            if not item.collected and self.player.rect.colliderect(item.rect):
                item.collected = True
                self.collected += 1
                self.score += 50 if item.kind == "snack" else 100
        if self.player.rect.colliderect(self.level.finish):
            self.score += max(0, int(self.level_time)) * 2
            self.state = GameState.VICTORY if self.level_index == len(self.levels) - 1 else GameState.LEVEL_COMPLETE
        self.camera.update(self.player.rect)
        self.shake = max(0.0, self.shake - dt)

    def damage_player(self, force=False):
        if not force and self.player.invulnerable > 0:
            return
        self.lives -= 1
        self.deaths += 1
        self.shake = 0.18
        if self.lives <= 0:
            self.state = GameState.GAME_OVER
        else:
            self.load_level(self.level_index)
            if hasattr(self, "checkpoint_spawn"):
                self.player = Player(self.checkpoint_spawn)

    def draw(self):
        self.level.draw(self.canvas, self.camera)
        self.player.draw(self.canvas, self.camera, pygame.time.get_ticks() // 55)
        self.ui.hud(self.canvas, self.level, self.lives, self.score, self.collected, self.level_time)
        if self.state == GameState.TITLE:
            self.ui.overlay(self.canvas, "小新大冒险", ["放学路上，一起找回走失的便当！", "Enter 开始    A/D 移动    Space 跳跃    Shift 冲刺", "原创占位角色与关卡素材，可替换为授权资源"])
        elif self.state == GameState.PAUSED:
            self.ui.overlay(self.canvas, "暂停", ["Enter 或 Esc 继续    R 重开本关"])
        elif self.state == GameState.LEVEL_COMPLETE:
            self.ui.overlay(self.canvas, "抵达下一站！", [f"{self.level.name} 完成    当前分数 {self.score}", "按 Enter 继续"])
        elif self.state == GameState.GAME_OVER:
            self.ui.overlay(self.canvas, "再试一次吧", [f"最终分数 {self.score}", "Enter 或 R 从头开始    Esc 退出"])
        elif self.state == GameState.VICTORY:
            self.ui.overlay(self.canvas, "便当大作战完成！", [f"最终分数 {self.score}    收集零食 {self.collected}", "按 Enter 再玩一次"])
        size = self.window.get_size()
        scaled = pygame.transform.scale(self.canvas, size)
        self.window.blit(scaled, (0, 0))
        pygame.display.flip()

    def run(self, max_frames=None):
        running = True
        frames = 0
        while running and (max_frames is None or frames < max_frames):
            dt = min(self.clock.tick(settings.FPS) / 1000.0, 0.04)
            for event in pygame.event.get():
                running = self.handle_event(event) and running
            self.update(dt)
            self.draw()
            frames += 1
        pygame.quit()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--headless", action="store_true")
    parser.add_argument("--frames", type=int, default=None)
    parser.add_argument("--play", action="store_true", help="直接进入第一关")
    args = parser.parse_args()
    Game(headless=args.headless, start_playing=args.play).run(args.frames)


if __name__ == "__main__":
    main()
