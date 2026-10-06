from pathlib import Path
import json


class AssetManifest:
    """素材清单读取器；缺少可选资源时由游戏绘制原创占位图。"""
    def __init__(self, root: Path):
        manifest_path = root / "assets" / "manifest.json"
        self.root = root
        self.entries = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {}

    def path(self, category: str, name: str):
        value = self.entries.get(category, {}).get(name)
        if not value:
            return None
        path = self.root / "assets" / value
        return path if path.exists() else None
