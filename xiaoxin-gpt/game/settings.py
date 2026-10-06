from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LEVELS_DIR = ROOT / "levels"
ASSETS_DIR = ROOT / "assets"
LOGICAL_SIZE = (1280, 720)
TITLE = "小新大冒险：放学路上"
FPS = 60
TILE_SIZE = 32
GRAVITY = 1900.0
MAX_FALL_SPEED = 1050.0
PLAYER_SPEED = 285.0
PLAYER_RUN_SPEED = 390.0
PLAYER_ACCEL = 2200.0
JUMP_SPEED = 690.0
COYOTE_TIME = 0.105
JUMP_BUFFER = 0.13
DASH_SPEED = 720.0
DASH_DURATION = 0.16
DASH_COOLDOWN = 0.8
INVULNERABLE_TIME = 1.2
STARTING_LIVES = 3
LEVEL_TIME = 180

KEYS = {
    "left": ("a", "left"), "right": ("d", "right"),
    "jump": ("space",), "dash": ("shift",),
    "pause": ("escape",), "restart": ("r",), "confirm": ("enter",),
}
