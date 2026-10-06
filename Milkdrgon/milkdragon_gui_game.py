#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
奶龙大战僵尸 - GUI版本
使用Pygame制作的图形界面游戏
"""

import pygame
import random
import sys
from enum import Enum

# 初始化Pygame
pygame.init()

# 游戏常量
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
FPS = 60

# 颜色定义
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
BLUE = (0, 100, 255)
YELLOW = (255, 255, 0)
ORANGE = (255, 165, 0)
PURPLE = (200, 0, 255)
DARK_GREEN = (0, 180, 0)
DARK_RED = (180, 0, 0)
LIGHT_BLUE = (173, 216, 230)
GRAY = (128, 128, 128)

class GameState(Enum):
    MENU = 1
    PLAYING = 2
    WAVE_TRANSITION = 3
    GAME_OVER = 4
    VICTORY = 5

class Button:
    """按钮类"""
    def __init__(self, x, y, width, height, text, color, hover_color):
        self.rect = pygame.Rect(x, y, width, height)
        self.text = text
        self.color = color
        self.hover_color = hover_color
        self.is_hovered = False

    def draw(self, screen, font):
        color = self.hover_color if self.is_hovered else self.color
        pygame.draw.rect(screen, color, self.rect, border_radius=10)
        pygame.draw.rect(screen, BLACK, self.rect, 3, border_radius=10)

        text_surf = font.render(self.text, True, WHITE)
        text_rect = text_surf.get_rect(center=self.rect.center)
        screen.blit(text_surf, text_rect)

    def check_hover(self, pos):
        self.is_hovered = self.rect.collidepoint(pos)
        return self.is_hovered

    def is_clicked(self, pos):
        return self.rect.collidepoint(pos)

class Projectile:
    """投射物类（奶龙的攻击）"""
    def __init__(self, x, y, target_x, target_y, is_special=False):
        self.x = x
        self.y = y
        self.target_x = target_x
        self.target_y = target_y
        self.speed = 8
        self.is_special = is_special
        self.radius = 15 if is_special else 8

        # 计算方向
        dx = target_x - x
        dy = target_y - y
        distance = max(1, (dx**2 + dy**2)**0.5)
        self.vx = (dx / distance) * self.speed
        self.vy = (dy / distance) * self.speed

    def update(self):
        self.x += self.vx
        self.y += self.vy

    def draw(self, screen):
        if self.is_special:
            # 特殊攻击 - 紫色大球
            pygame.draw.circle(screen, PURPLE, (int(self.x), int(self.y)), self.radius)
            pygame.draw.circle(screen, WHITE, (int(self.x), int(self.y)), self.radius-5)
        else:
            # 普通攻击 - 蓝色小球
            pygame.draw.circle(screen, BLUE, (int(self.x), int(self.y)), self.radius)
            pygame.draw.circle(screen, LIGHT_BLUE, (int(self.x), int(self.y)), self.radius-3)

    def is_off_screen(self):
        return self.x < -50 or self.x > SCREEN_WIDTH + 50 or self.y < -50 or self.y > SCREEN_HEIGHT + 50

class MilkDragon:
    """奶龙类"""
    def __init__(self):
        self.x = 100
        self.y = SCREEN_HEIGHT // 2
        self.width = 60
        self.height = 60
        self.max_hp = 100
        self.hp = 100
        self.max_energy = 100
        self.energy = 100
        self.speed = 5

        self.attack_min = 15
        self.attack_max = 25
        self.special_damage_min = 40
        self.special_damage_max = 60
        self.special_cost = 20

        self.energy_regen = 0.3  # 每帧恢复的能量

        # 加载奶龙图片
        self.image = None
        self.use_image = False
        try:
            original_image = pygame.image.load("nailong.png")
            # 缩放图片到合适大小
            self.image = pygame.transform.scale(original_image, (self.width, self.height))
            self.use_image = True
        except:
            # 如果图片加载失败，使用默认绘制
            self.use_image = False

    def move(self, keys):
        """根据键盘移动"""
        if keys[pygame.K_w] or keys[pygame.K_UP]:
            self.y = max(50, self.y - self.speed)
        if keys[pygame.K_s] or keys[pygame.K_DOWN]:
            self.y = min(SCREEN_HEIGHT - 100, self.y + self.speed)
        if keys[pygame.K_a] or keys[pygame.K_LEFT]:
            self.x = max(20, self.x - self.speed)
        if keys[pygame.K_d] or keys[pygame.K_RIGHT]:
            self.x = min(250, self.x + self.speed)

    def shoot(self, target_x, target_y, is_special=False):
        """发射投射物"""
        if is_special and self.energy >= self.special_cost:
            self.energy -= self.special_cost
            return Projectile(self.x + self.width//2, self.y + self.height//2,
                            target_x, target_y, True)
        elif not is_special:
            return Projectile(self.x + self.width//2, self.y + self.height//2,
                            target_x, target_y, False)
        return None

    def restore_energy(self):
        """恢复能量"""
        self.energy = min(self.max_energy, self.energy + self.energy_regen)

    def heal(self):
        """恢复生命"""
        if self.energy >= 15:
            self.energy -= 15
            heal_amount = min(30, self.max_hp - self.hp)
            self.hp += heal_amount
            return True
        return False

    def take_damage(self, damage):
        """受到伤害"""
        self.hp = max(0, self.hp - damage)

    def is_alive(self):
        return self.hp > 0

    def draw(self, screen):
        """绘制奶龙"""
        if self.use_image and self.image:
            # 使用图片
            screen.blit(self.image, (int(self.x), int(self.y)))
        else:
            # 使用默认绘制（圆形）
            pygame.draw.circle(screen, LIGHT_BLUE, (int(self.x + self.width//2), int(self.y + self.height//2)), 30)
            pygame.draw.circle(screen, BLUE, (int(self.x + self.width//2), int(self.y + self.height//2)), 30, 3)

            # 眼睛
            pygame.draw.circle(screen, BLACK, (int(self.x + 25), int(self.y + 20)), 5)
            pygame.draw.circle(screen, BLACK, (int(self.x + 40), int(self.y + 20)), 5)

            # 嘴巴
            pygame.draw.arc(screen, BLACK, (self.x + 20, self.y + 25, 25, 15), 3.14, 6.28, 2)

class Zombie:
    """僵尸类"""
    def __init__(self, zombie_type, spawn_y, wave):
        self.type = zombie_type
        self.y = spawn_y
        self.wave = wave

        if zombie_type == "normal":
            self.max_hp = 30
            self.hp = 30
            self.speed = 1.5
            self.damage = random.randint(5, 10)
            self.width = 40
            self.height = 50
            self.color = GREEN
            self.score = 10
        elif zombie_type == "strong":
            self.max_hp = 60
            self.hp = 60
            self.speed = 1.0
            self.damage = random.randint(10, 15)
            self.width = 50
            self.height = 60
            self.color = ORANGE
            self.score = 20
        else:  # boss
            self.max_hp = 150
            self.hp = 150
            self.speed = 0.8
            self.damage = random.randint(15, 25)
            self.width = 80
            self.height = 90
            self.color = RED
            self.score = 100

        self.x = SCREEN_WIDTH + 50
        self.attack_cooldown = 0

    def update(self):
        """更新位置"""
        self.x -= self.speed
        if self.attack_cooldown > 0:
            self.attack_cooldown -= 1

    def take_damage(self, damage):
        """受到伤害"""
        self.hp -= damage
        return self.hp <= 0

    def can_attack(self, dragon):
        """检查是否可以攻击奶龙"""
        if self.attack_cooldown == 0:
            distance = ((self.x - dragon.x)**2 + (self.y - dragon.y)**2)**0.5
            if distance < 80:
                return True
        return False

    def attack(self, dragon):
        """攻击奶龙"""
        dragon.take_damage(self.damage)
        self.attack_cooldown = 60  # 1秒冷却

    def draw(self, screen):
        """绘制僵尸"""
        # 身体
        pygame.draw.rect(screen, self.color, (int(self.x), int(self.y), self.width, self.height), border_radius=10)
        pygame.draw.rect(screen, BLACK, (int(self.x), int(self.y), self.width, self.height), 2, border_radius=10)

        # 眼睛
        eye_y = self.y + self.height // 3
        pygame.draw.circle(screen, BLACK, (int(self.x + self.width//3), int(eye_y)), 5)
        pygame.draw.circle(screen, BLACK, (int(self.x + 2*self.width//3), int(eye_y)), 5)

        # HP条
        hp_width = 40
        hp_height = 5
        hp_x = self.x + (self.width - hp_width) // 2
        hp_y = self.y - 10

        hp_percentage = self.hp / self.max_hp
        pygame.draw.rect(screen, RED, (hp_x, hp_y, hp_width, hp_height))
        pygame.draw.rect(screen, GREEN, (hp_x, hp_y, hp_width * hp_percentage, hp_height))

class Game:
    """游戏主类"""
    def __init__(self):
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("奶龙大战僵尸")
        self.clock = pygame.time.Clock()

        # 字体
        self.title_font = pygame.font.Font(None, 72)
        self.font = pygame.font.Font(None, 36)
        self.small_font = pygame.font.Font(None, 24)

        # 游戏状态
        self.state = GameState.MENU
        self.dragon = None
        self.zombies = []
        self.projectiles = []
        self.wave = 1
        self.max_wave = 7
        self.score = 0
        self.kills = 0
        self.wave_timer = 0
        self.spawn_timer = 0
        self.zombies_to_spawn = 0

        # 按钮
        self.start_button = Button(300, 300, 200, 60, "开始游戏", BLUE, DARK_GREEN)
        self.quit_button = Button(300, 400, 200, 60, "退出游戏", RED, DARK_RED)
        self.restart_button = Button(300, 350, 200, 60, "重新开始", GREEN, DARK_GREEN)

        # 冷却时间
        self.attack_cooldown = 0
        self.special_cooldown = 0
        self.heal_cooldown = 0

    def reset_game(self):
        """重置游戏"""
        self.dragon = MilkDragon()
        self.zombies = []
        self.projectiles = []
        self.wave = 1
        self.score = 0
        self.kills = 0
        self.wave_timer = 0
        self.spawn_timer = 0
        self.zombies_to_spawn = 0
        self.attack_cooldown = 0
        self.special_cooldown = 0
        self.heal_cooldown = 0
        self.state = GameState.WAVE_TRANSITION

    def spawn_wave(self):
        """生成新波次"""
        if self.wave <= 3:
            self.zombies_to_spawn = random.randint(2, 4)
            self.zombie_type = "normal"
        elif self.wave <= 6:
            self.zombies_to_spawn = random.randint(3, 5)
            self.zombie_type = "strong"
        else:
            self.zombies_to_spawn = 1
            self.zombie_type = "boss"

        self.spawn_timer = 0

    def handle_menu_events(self, event):
        """处理菜单事件"""
        if event.type == pygame.MOUSEBUTTONDOWN:
            pos = pygame.mouse.get_pos()
            if self.start_button.is_clicked(pos):
                self.reset_game()
            elif self.quit_button.is_clicked(pos):
                return False
        return True

    def handle_playing_events(self, event):
        """处理游戏中的事件"""
        if event.type == pygame.MOUSEBUTTONDOWN:
            if self.attack_cooldown == 0:
                pos = pygame.mouse.get_pos()
                if event.button == 1:  # 左键 - 普通攻击
                    projectile = self.dragon.shoot(pos[0], pos[1], False)
                    if projectile:
                        self.projectiles.append(projectile)
                        self.attack_cooldown = 20  # 0.33秒冷却
                elif event.button == 3:  # 右键 - 特殊攻击
                    if self.special_cooldown == 0:
                        projectile = self.dragon.shoot(pos[0], pos[1], True)
                        if projectile:
                            self.projectiles.append(projectile)
                            self.special_cooldown = 60  # 1秒冷却

        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_SPACE or event.key == pygame.K_h:
                if self.heal_cooldown == 0:
                    if self.dragon.heal():
                        self.heal_cooldown = 180  # 3秒冷却

        return True

    def handle_gameover_events(self, event):
        """处理游戏结束事件"""
        if event.type == pygame.MOUSEBUTTONDOWN:
            pos = pygame.mouse.get_pos()
            if self.restart_button.is_clicked(pos):
                self.reset_game()
            elif self.quit_button.is_clicked(pos):
                self.state = GameState.MENU
        return True

    def update_playing(self):
        """更新游戏状态"""
        keys = pygame.key.get_pressed()
        self.dragon.move(keys)
        self.dragon.restore_energy()

        # 更新冷却
        if self.attack_cooldown > 0:
            self.attack_cooldown -= 1
        if self.special_cooldown > 0:
            self.special_cooldown -= 1
        if self.heal_cooldown > 0:
            self.heal_cooldown -= 1

        # 生成僵尸
        if self.zombies_to_spawn > 0:
            self.spawn_timer += 1
            if self.spawn_timer >= 90:  # 每1.5秒生成一个
                spawn_y = random.randint(100, SCREEN_HEIGHT - 150)
                self.zombies.append(Zombie(self.zombie_type, spawn_y, self.wave))
                self.zombies_to_spawn -= 1
                self.spawn_timer = 0

        # 更新投射物
        for projectile in self.projectiles[:]:
            projectile.update()
            if projectile.is_off_screen():
                self.projectiles.remove(projectile)
                continue

            # 检查碰撞
            for zombie in self.zombies[:]:
                dx = projectile.x - (zombie.x + zombie.width//2)
                dy = projectile.y - (zombie.y + zombie.height//2)
                distance = (dx**2 + dy**2)**0.5

                if distance < zombie.width//2 + projectile.radius:
                    damage = random.randint(self.dragon.special_damage_min,
                                          self.dragon.special_damage_max) if projectile.is_special else \
                            random.randint(self.dragon.attack_min, self.dragon.attack_max)

                    if zombie.take_damage(damage):
                        self.zombies.remove(zombie)
                        self.score += zombie.score
                        self.kills += 1

                    if projectile in self.projectiles:
                        self.projectiles.remove(projectile)
                    break

        # 更新僵尸
        for zombie in self.zombies:
            zombie.update()

            # 检查是否可以攻击奶龙
            if zombie.can_attack(self.dragon):
                zombie.attack(self.dragon)

        # 移除离开屏幕的僵尸（到达左侧）
        self.zombies = [z for z in self.zombies if z.x > -100]

        # 检查游戏结束
        if not self.dragon.is_alive():
            self.state = GameState.GAME_OVER
        elif self.zombies_to_spawn == 0 and len(self.zombies) == 0:
            if self.wave >= self.max_wave:
                self.state = GameState.VICTORY
            else:
                self.wave += 1
                self.wave_timer = 180  # 3秒过渡
                self.state = GameState.WAVE_TRANSITION

    def update_wave_transition(self):
        """更新波次过渡"""
        self.wave_timer -= 1
        if self.wave_timer <= 0:
            self.spawn_wave()
            self.state = GameState.PLAYING

    def draw_menu(self):
        """绘制菜单"""
        self.screen.fill(LIGHT_BLUE)

        # 标题
        title = self.title_font.render("奶龙大战僵尸", True, BLUE)
        title_rect = title.get_rect(center=(SCREEN_WIDTH//2, 150))
        self.screen.blit(title, title_rect)

        # 副标题
        subtitle = self.font.render("Milk Dragon vs Zombies", True, DARK_GREEN)
        subtitle_rect = subtitle.get_rect(center=(SCREEN_WIDTH//2, 220))
        self.screen.blit(subtitle, subtitle_rect)

        # 按钮
        pos = pygame.mouse.get_pos()
        self.start_button.check_hover(pos)
        self.quit_button.check_hover(pos)
        self.start_button.draw(self.screen, self.font)
        self.quit_button.draw(self.screen, self.font)

    def draw_hud(self):
        """绘制HUD（界面信息）"""
        # 背景面板
        pygame.draw.rect(self.screen, (50, 50, 50), (0, 0, SCREEN_WIDTH, 40))

        # HP条
        hp_percentage = self.dragon.hp / self.dragon.max_hp
        pygame.draw.rect(self.screen, DARK_RED, (10, 10, 200, 20))
        pygame.draw.rect(self.screen, RED, (10, 10, 200 * hp_percentage, 20))
        hp_text = self.small_font.render(f"HP: {int(self.dragon.hp)}/{self.dragon.max_hp}", True, WHITE)
        self.screen.blit(hp_text, (220, 10))

        # 能量条
        energy_percentage = self.dragon.energy / self.dragon.max_energy
        pygame.draw.rect(self.screen, DARK_GREEN, (10, 570, 200, 20))
        pygame.draw.rect(self.screen, BLUE, (10, 570, 200 * energy_percentage, 20))
        energy_text = self.small_font.render(f"能量: {int(self.dragon.energy)}/{self.dragon.max_energy}", True, WHITE)
        self.screen.blit(energy_text, (220, 570))

        # 波数和分数
        wave_text = self.font.render(f"第 {self.wave} 波", True, WHITE)
        self.screen.blit(wave_text, (SCREEN_WIDTH - 150, 5))

        score_text = self.small_font.render(f"分数: {self.score}", True, YELLOW)
        self.screen.blit(score_text, (400, 10))

        # 技能提示
        hint_y = SCREEN_HEIGHT - 60
        hint1 = self.small_font.render("左键: 普通攻击", True, WHITE)
        hint2 = self.small_font.render("右键: 特殊攻击", True, PURPLE)
        hint3 = self.small_font.render("空格: 恢复HP", True, GREEN)
        hint4 = self.small_font.render("WASD: 移动", True, YELLOW)

        self.screen.blit(hint1, (10, hint_y - 90))
        self.screen.blit(hint2, (10, hint_y - 60))
        self.screen.blit(hint3, (10, hint_y - 30))
        self.screen.blit(hint4, (200, hint_y - 30))

    def draw_playing(self):
        """绘制游戏画面"""
        # 背景
        self.screen.fill((240, 248, 255))

        # 绘制草地
        pygame.draw.rect(self.screen, (144, 238, 144), (0, SCREEN_HEIGHT - 50, SCREEN_WIDTH, 50))

        # 绘制奶龙
        self.dragon.draw(self.screen)

        # 绘制僵尸
        for zombie in self.zombies:
            zombie.draw(self.screen)

        # 绘制投射物
        for projectile in self.projectiles:
            projectile.draw(self.screen)

        # 绘制HUD
        self.draw_hud()

    def draw_wave_transition(self):
        """绘制波次过渡"""
        self.draw_playing()

        # 半透明遮罩
        overlay = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT))
        overlay.set_alpha(200)
        overlay.fill(BLACK)
        self.screen.blit(overlay, (0, 0))

        # 波次文字
        wave_text = self.title_font.render(f"第 {self.wave} 波", True, YELLOW)
        wave_rect = wave_text.get_rect(center=(SCREEN_WIDTH//2, SCREEN_HEIGHT//2))
        self.screen.blit(wave_text, wave_rect)

    def draw_gameover(self):
        """绘制游戏结束画面"""
        self.screen.fill((100, 100, 150))

        # 标题
        if self.state == GameState.VICTORY:
            title = self.title_font.render("胜利！", True, YELLOW)
            subtitle = self.font.render("成功保卫家园！", True, GREEN)
        else:
            title = self.title_font.render("游戏结束", True, RED)
            subtitle = self.font.render("奶龙倒下了...", True, GRAY)

        title_rect = title.get_rect(center=(SCREEN_WIDTH//2, 120))
        subtitle_rect = subtitle.get_rect(center=(SCREEN_WIDTH//2, 200))
        self.screen.blit(title, title_rect)
        self.screen.blit(subtitle, subtitle_rect)

        # 统计
        stats = [
            f"完成波数: {self.wave if self.state == GameState.VICTORY else self.wave - 1}",
            f"击败僵尸: {self.kills}",
            f"最终分数: {self.score}"
        ]

        y = 260
        for stat in stats:
            stat_text = self.font.render(stat, True, WHITE)
            stat_rect = stat_text.get_rect(center=(SCREEN_WIDTH//2, y))
            self.screen.blit(stat_text, stat_rect)
            y += 40

        # 按钮
        pos = pygame.mouse.get_pos()
        self.restart_button.check_hover(pos)
        self.quit_button.check_hover(pos)
        self.restart_button.draw(self.screen, self.font)
        self.quit_button.draw(self.screen, self.font)

    def run(self):
        """运行游戏主循环"""
        running = True

        while running:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False

                if self.state == GameState.MENU:
                    running = self.handle_menu_events(event)
                elif self.state == GameState.PLAYING:
                    running = self.handle_playing_events(event)
                elif self.state in [GameState.GAME_OVER, GameState.VICTORY]:
                    running = self.handle_gameover_events(event)

            # 更新
            if self.state == GameState.PLAYING:
                self.update_playing()
            elif self.state == GameState.WAVE_TRANSITION:
                self.update_wave_transition()

            # 绘制
            if self.state == GameState.MENU:
                self.draw_menu()
            elif self.state == GameState.PLAYING:
                self.draw_playing()
            elif self.state == GameState.WAVE_TRANSITION:
                self.draw_wave_transition()
            elif self.state in [GameState.GAME_OVER, GameState.VICTORY]:
                self.draw_gameover()

            pygame.display.flip()
            self.clock.tick(FPS)

        pygame.quit()
        sys.exit()

def main():
    """主函数"""
    game = Game()
    game.run()

if __name__ == "__main__":
    main()
