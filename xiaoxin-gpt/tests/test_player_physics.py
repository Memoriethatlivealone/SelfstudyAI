import unittest
import pygame
from game.player import Player


class PlayerPhysicsTests(unittest.TestCase):
    def test_jump_buffer_triggers_landing_jump(self):
        player = Player((20, 58))
        floor = pygame.Rect(0, 100, 300, 80)
        player.update(0.03, set(), [floor])
        self.assertTrue(player.grounded)
        player.request_jump()
        player.update(0.016, set(), [floor])
        self.assertLess(player.velocity.y, 0)
        self.assertFalse(player.grounded)

    def test_coyote_time_allows_jump_after_leaving_ground(self):
        player = Player((20, 58))
        floor = pygame.Rect(0, 100, 40, 80)
        player.update(0.03, set(), [floor])
        player.rect.x = 50
        player.update(0.02, {"right"}, [floor])
        player.request_jump()
        player.update(0.016, {"right"}, [floor])
        self.assertLess(player.velocity.y, 0)


if __name__ == "__main__":
    unittest.main()
