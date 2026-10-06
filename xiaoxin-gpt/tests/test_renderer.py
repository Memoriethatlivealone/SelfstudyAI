"""测试角色渲染系统"""
import unittest
import pygame
from game.renderer import CharacterRenderer, AssetRenderer
from game.player import Player


class RendererTests(unittest.TestCase):
    """测试角色渲染模块"""

    def setUp(self):
        """每个测试前初始化pygame"""
        pygame.init()
        self.surface = pygame.Surface((800, 600))

    def tearDown(self):
        """每个测试后清理"""
        pygame.quit()

    def test_character_renderer_initialization(self):
        """测试角色渲染器可以正常初始化"""
        renderer = CharacterRenderer()
        self.assertIsNotNone(renderer)
        self.assertEqual(renderer.frame_count, 0)

    def test_draw_shadow(self):
        """测试阴影绘制不会崩溃"""
        renderer = CharacterRenderer()
        rect = pygame.Rect(100, 100, 28, 42)
        # 应该正常绘制，不抛出异常
        renderer.draw_shadow(self.surface, rect)

    def test_draw_body(self):
        """测试身体绘制支持不同状态"""
        renderer = CharacterRenderer()
        rect = pygame.Rect(100, 100, 28, 42)

        # 测试各种状态
        for state in ["idle", "walk", "jump", "dash"]:
            for facing in [-1, 1]:
                renderer.draw_body(self.surface, rect, state, facing)

    def test_draw_complete_character(self):
        """测试完整角色绘制"""
        renderer = CharacterRenderer()
        rect = pygame.Rect(100, 100, 28, 42)

        # 测试完整绘制
        renderer.draw(
            surface=self.surface,
            rect=rect,
            state="walk",
            facing=1,
            velocity_x=100,
            anim_time=0.5,
            invulnerable=0,
            tick=0
        )

    def test_invulnerable_flashing(self):
        """测试无敌闪烁效果"""
        renderer = CharacterRenderer()
        rect = pygame.Rect(100, 100, 28, 42)

        # 无敌时间 > 0，tick % 8 < 4 应该不绘制（返回）
        # 这个测试只确保不会崩溃
        for tick in range(16):
            renderer.draw(
                surface=self.surface,
                rect=rect,
                state="idle",
                facing=1,
                velocity_x=0,
                anim_time=0,
                invulnerable=1.0,
                tick=tick
            )

    def test_player_uses_renderer(self):
        """测试玩家正确使用渲染器"""
        player = Player((100, 100))
        self.assertIsNotNone(player.renderer)
        self.assertIsInstance(player.renderer, CharacterRenderer)

    def test_asset_renderer_initialization(self):
        """测试资源渲染器接口"""
        asset_renderer = AssetRenderer()
        self.assertIsNotNone(asset_renderer)
        self.assertFalse(asset_renderer.has_assets())
        self.assertEqual(len(asset_renderer.sprites), 0)


if __name__ == "__main__":
    unittest.main()
