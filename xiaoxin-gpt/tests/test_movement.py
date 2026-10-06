"""测试角色移动输入系统"""
import unittest
import pygame
from game.main import Game
from game.states import GameState


class MovementTests(unittest.TestCase):
    """测试 A/D 和左右方向键移动功能"""

    def test_d_key_moves_right(self):
        """测试 D 键向右移动"""
        game = Game(headless=True, start_playing=True)
        start_x = game.player.rect.x

        # 按下 D 键
        game.handle_event(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_d))

        # 更新多帧
        for _ in range(10):
            game.update(1 / 60)

        # 松开 D 键
        game.handle_event(pygame.event.Event(pygame.KEYUP, key=pygame.K_d))

        # 验证角色向右移动
        self.assertGreater(game.player.rect.x, start_x, "D 键应该使角色向右移动")
        pygame.quit()

    def test_a_key_moves_left(self):
        """测试 A 键向左移动"""
        game = Game(headless=True, start_playing=True)

        # 先向右移动一段距离
        game.player.rect.x = 200
        start_x = game.player.rect.x

        # 按下 A 键
        game.handle_event(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_a))

        # 更新多帧
        for _ in range(10):
            game.update(1 / 60)

        # 松开 A 键
        game.handle_event(pygame.event.Event(pygame.KEYUP, key=pygame.K_a))

        # 验证角色向左移动
        self.assertLess(game.player.rect.x, start_x, "A 键应该使角色向左移动")
        pygame.quit()

    def test_right_arrow_moves_right(self):
        """测试右方向键向右移动"""
        game = Game(headless=True, start_playing=True)
        start_x = game.player.rect.x

        # 按下右方向键
        game.handle_event(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_RIGHT))

        # 更新多帧
        for _ in range(10):
            game.update(1 / 60)

        # 松开右方向键
        game.handle_event(pygame.event.Event(pygame.KEYUP, key=pygame.K_RIGHT))

        # 验证角色向右移动
        self.assertGreater(game.player.rect.x, start_x, "右方向键应该使角色向右移动")
        pygame.quit()

    def test_left_arrow_moves_left(self):
        """测试左方向键向左移动"""
        game = Game(headless=True, start_playing=True)

        # 先向右移动一段距离
        game.player.rect.x = 200
        start_x = game.player.rect.x

        # 按下左方向键
        game.handle_event(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_LEFT))

        # 更新多帧
        for _ in range(10):
            game.update(1 / 60)

        # 松开左方向键
        game.handle_event(pygame.event.Event(pygame.KEYUP, key=pygame.K_LEFT))

        # 验证角色向左移动
        self.assertLess(game.player.rect.x, start_x, "左方向键应该使角色向左移动")
        pygame.quit()

    def test_continuous_movement_while_holding_key(self):
        """测试按住按键可以连续移动"""
        game = Game(headless=True, start_playing=True)
        start_x = game.player.rect.x

        # 按下 D 键
        game.handle_event(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_d))

        # 持续更新30帧
        for _ in range(30):
            game.update(1 / 60)

        mid_x = game.player.rect.x

        # 继续持续更新30帧（仍然按住）
        for _ in range(30):
            game.update(1 / 60)

        end_x = game.player.rect.x

        # 松开 D 键
        game.handle_event(pygame.event.Event(pygame.KEYUP, key=pygame.K_d))

        # 验证持续移动
        self.assertGreater(mid_x, start_x, "第一阶段应该移动")
        self.assertGreater(end_x, mid_x, "持续按住应该继续移动")
        pygame.quit()

    def test_stops_after_key_release(self):
        """测试松开按键后角色逐渐停止"""
        game = Game(headless=True, start_playing=True)

        # 按下 D 键并移动
        game.handle_event(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_d))
        for _ in range(20):
            game.update(1 / 60)

        # 松开 D 键
        game.handle_event(pygame.event.Event(pygame.KEYUP, key=pygame.K_d))

        # 记录速度
        velocity_after_release = abs(game.player.velocity.x)

        # 继续更新，角色应该减速
        for _ in range(10):
            game.update(1 / 60)

        velocity_after_decel = abs(game.player.velocity.x)

        # 验证速度逐渐归零
        self.assertLess(velocity_after_decel, velocity_after_release,
                       "松开按键后速度应该减少")

        # 继续更新足够长时间，速度应该接近0
        for _ in range(30):
            game.update(1 / 60)

        self.assertLess(abs(game.player.velocity.x), 10,
                       "松开按键后速度最终应该接近0")
        pygame.quit()

    def test_title_screen_can_enter_game(self):
        """测试标题界面可以正常进入游戏"""
        game = Game(headless=True, start_playing=False)

        # 初始应该在标题界面
        self.assertEqual(game.state, GameState.TITLE)

        # 按下 Enter 键
        game.handle_event(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_RETURN))

        # 应该切换到游戏状态
        self.assertEqual(game.state, GameState.PLAYING)
        pygame.quit()

    def test_title_screen_movement_key_enters_game(self):
        """测试标题界面按移动键也可以进入游戏"""
        game = Game(headless=True, start_playing=False)

        # 初始应该在标题界面
        self.assertEqual(game.state, GameState.TITLE)

        # 按下 D 键
        game.handle_event(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_d))

        # 应该切换到游戏状态
        self.assertEqual(game.state, GameState.PLAYING)

        # 并且 D 键应该被记录在 held_keys 中
        self.assertIn("right", game.held_keys)
        pygame.quit()

    def test_window_focus_lost_clears_keys(self):
        """测试窗口失焦后按键状态被清空"""
        game = Game(headless=True, start_playing=True)

        # 按下多个键
        game.handle_event(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_d))
        game.handle_event(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_LSHIFT))

        # 验证按键被记录
        self.assertIn("right", game.held_keys)
        self.assertIn("run", game.held_keys)

        # 移动角色使其有速度
        for _ in range(5):
            game.update(1 / 60)

        initial_velocity_x = game.player.velocity.x
        self.assertGreater(abs(initial_velocity_x), 0, "角色应该有速度")

        # 触发窗口失焦事件
        game.handle_event(pygame.event.Event(pygame.WINDOWFOCUSLOST))

        # 验证按键状态被清空
        self.assertEqual(len(game.held_keys), 0, "窗口失焦后 held_keys 应该被清空")

        # 验证角色速度被清空
        self.assertEqual(game.player.velocity.x, 0, "窗口失焦后角色速度应该被清空")
        pygame.quit()

    def test_no_fake_movement_by_speed_modification(self):
        """测试不能通过直接修改速度伪造移动效果"""
        game = Game(headless=True, start_playing=True)
        start_x = game.player.rect.x

        # 直接设置速度但不按键
        game.player.velocity.x = 300

        # 更新一帧
        game.update(1 / 60)

        # 由于没有按键，速度应该被减速系统降低
        # 而不是维持在300
        self.assertLess(abs(game.player.velocity.x), 300,
                       "没有按键输入时，速度应该被减速")
        pygame.quit()


if __name__ == "__main__":
    unittest.main()
