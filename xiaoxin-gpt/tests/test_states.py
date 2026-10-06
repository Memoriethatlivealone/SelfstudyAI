import unittest
import pygame
from game.main import Game
from game.states import GameState


class StateTests(unittest.TestCase):
    def test_title_confirm_starts_playing(self):
        game = Game(headless=True)
        event = pygame.event.Event(pygame.KEYDOWN, key=pygame.K_RETURN)
        game.handle_event(event)
        self.assertEqual(game.state, GameState.PLAYING)
        pygame.quit()

    def test_right_key_moves_player(self):
        game = Game(headless=True)
        game.handle_event(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_RETURN))
        start_x = game.player.rect.x
        game.handle_event(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_d))
        for _ in range(8):
            game.update(1 / 60)
        game.handle_event(pygame.event.Event(pygame.KEYUP, key=pygame.K_d))
        self.assertGreater(game.player.rect.x, start_x)
        pygame.quit()


if __name__ == "__main__":
    unittest.main()
