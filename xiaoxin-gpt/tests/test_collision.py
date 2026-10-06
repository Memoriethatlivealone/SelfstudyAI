import unittest
import pygame
from game.collision import move_and_collide


class CollisionTests(unittest.TestCase):
    def test_floor_stops_falling_player(self):
        rect = pygame.Rect(10, 60, 20, 30)
        velocity = pygame.Vector2(0, 120)
        hit_x, hit_y = move_and_collide(rect, velocity, [pygame.Rect(0, 100, 100, 30)], 0.5)
        self.assertFalse(hit_x)
        self.assertTrue(hit_y)
        self.assertEqual(rect.bottom, 100)


if __name__ == "__main__":
    unittest.main()
