"""角色渲染模块 - 支持多种动画状态和视觉效果"""
import pygame
from typing import Tuple


class CharacterRenderer:
    """原创占位角色渲染器，支持待机、行走、跳跃、受伤、冲刺动画"""

    def __init__(self):
        self.frame_count = 0

    def draw_shadow(self, surface: pygame.Surface, rect: pygame.Rect):
        """绘制角色阴影"""
        shadow = pygame.Surface((rect.width - 2, 9), pygame.SRCALPHA)
        pygame.draw.ellipse(shadow, (38, 47, 50, 120), shadow.get_rect())
        surface.blit(shadow, (rect.x + 1, rect.bottom - 5))

    def draw_body(self, surface: pygame.Surface, rect: pygame.Rect, state: str, facing: int):
        """绘制角色身体"""
        body = pygame.Rect(rect.x + 3, rect.y + 13, rect.w - 6, rect.h - 13)
        shirt = (54, 154, 126)
        outline = (48, 116, 105)

        # 冲刺时身体倾斜效果
        if state == "dash":
            body.x += facing * 2
            shirt = (44, 144, 116)

        pygame.draw.rect(surface, shirt, body, border_radius=5)
        pygame.draw.rect(surface, outline, body, 2, border_radius=5)

    def draw_head(self, surface: pygame.Surface, rect: pygame.Rect, facing: int):
        """绘制角色头部"""
        skin = (246, 186, 128)
        hair = (36, 43, 43)

        # 头部
        pygame.draw.ellipse(surface, skin, (rect.x + 2, rect.y, rect.w - 4, 26))

        # 头发
        pygame.draw.arc(surface, hair, (rect.x + 1, rect.y - 2, rect.w - 2, 18), 0, 3.14, 5)

        # 眼睛
        eye_x = rect.centerx + facing * 5
        pygame.draw.circle(surface, (30, 38, 39), (eye_x, rect.y + 11), 2)

        # 嘴巴
        pygame.draw.line(surface, (30, 38, 39),
                        (rect.centerx, rect.y + 18),
                        (rect.centerx + facing * 4, rect.y + 19), 2)

    def draw_legs(self, surface: pygame.Surface, rect: pygame.Rect, state: str,
                  velocity_x: float, anim_time: float):
        """绘制角色腿部，支持行走动画"""
        leg_color = (48, 56, 55)

        # 根据状态计算腿部偏移
        leg_offset = 0
        if state == "walk" and abs(velocity_x) > 20:
            # 行走动画：腿部交替摆动
            leg_offset = int(anim_time * 12 % 2 > 1)
        elif state == "jump":
            # 跳跃时腿部并拢
            leg_offset = 0
        elif state == "dash":
            # 冲刺时腿部向后伸展
            leg_offset = 2

        # 绘制双腿
        pygame.draw.line(surface, leg_color,
                        (rect.x + 9, rect.bottom - 3),
                        (rect.x + 8 + leg_offset, rect.bottom + 3), 3)
        pygame.draw.line(surface, leg_color,
                        (rect.right - 9, rect.bottom - 3),
                        (rect.right - 8 - leg_offset, rect.bottom + 3), 3)

    def draw_hurt_effect(self, surface: pygame.Surface, rect: pygame.Rect, tick: int):
        """绘制受伤闪烁效果"""
        if tick % 8 < 4:
            # 受伤时角色闪烁：半透明红色覆盖
            hurt_overlay = pygame.Surface((rect.width, rect.height), pygame.SRCALPHA)
            hurt_overlay.fill((255, 80, 80, 100))
            surface.blit(hurt_overlay, rect.topleft)

    def draw(self, surface: pygame.Surface, rect: pygame.Rect,
             state: str, facing: int, velocity_x: float, anim_time: float,
             invulnerable: float, tick: int):
        """
        绘制完整角色

        Args:
            surface: 绘制目标表面
            rect: 角色矩形位置
            state: 动画状态 (idle/walk/jump/dash)
            facing: 朝向 (1=右, -1=左)
            velocity_x: X轴速度，用于行走动画
            anim_time: 动画时间
            invulnerable: 无敌时间（>0时闪烁）
            tick: 游戏tick，用于闪烁效果
        """
        # 无敌状态时闪烁（每8帧显示4帧）
        if invulnerable > 0 and tick % 8 < 4:
            return

        # 绘制顺序：阴影 -> 身体 -> 头部 -> 腿部 -> 受伤效果
        self.draw_shadow(surface, rect)
        self.draw_body(surface, rect, state, facing)
        self.draw_head(surface, rect, facing)
        self.draw_legs(surface, rect, state, velocity_x, anim_time)

        # 受伤效果（如果需要）
        if invulnerable > 0 and tick % 8 >= 4:
            self.draw_hurt_effect(surface, rect, tick)


class AssetRenderer:
    """
    预留资源渲染器接口
    未来可以加载 assets/manifest.json 中定义的精灵图、动画帧等
    """

    def __init__(self, manifest_path=None):
        self.manifest_path = manifest_path
        self.sprites = {}
        self.animations = {}
        # 预留加载逻辑
        # if manifest_path and manifest_path.exists():
        #     self._load_manifest(manifest_path)

    def has_assets(self) -> bool:
        """检查是否有可用的资源"""
        return len(self.sprites) > 0

    def draw(self, surface: pygame.Surface, rect: pygame.Rect,
             animation: str, frame: int, flip_h: bool = False):
        """
        从资源绘制角色（预留接口）

        Args:
            surface: 绘制目标
            rect: 位置
            animation: 动画名称
            frame: 帧索引
            flip_h: 是否水平翻转
        """
        # 预留实现
        pass
