import unittest
from game.level import Level
from game.settings import LEVELS_DIR


class LevelTests(unittest.TestCase):
    def test_three_levels_load_with_required_content(self):
        levels = Level.load_all(LEVELS_DIR)
        self.assertEqual(len(levels), 3)
        for level in levels:
            self.assertTrue(level.solids)
            self.assertTrue(level.items)
            self.assertTrue(level.checkpoints)
            self.assertTrue(level.finish.width > 0)


if __name__ == "__main__":
    unittest.main()
