#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
奶龙大战僵尸 - Milk Dragon vs Zombies
一个有趣的回合制战斗游戏
"""

import random
import time
import os
import sys
import io

# 设置Windows控制台UTF-8编码
if sys.platform == "win32":
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
    except:
        pass

# ANSI颜色代码
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def clear_screen():
    """清屏"""
    os.system('cls' if os.name == 'nt' else 'clear')

def print_slow(text, delay=0.03):
    """逐字打印效果"""
    for char in text:
        print(char, end='', flush=True)
        time.sleep(delay)
    print()

def print_header(text):
    """打印标题"""
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*50}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.YELLOW}{text.center(50)}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'='*50}{Colors.END}\n")

class MilkDragon:
    """奶龙类"""
    def __init__(self):
        self.max_hp = 100
        self.hp = 100
        self.max_energy = 100
        self.energy = 100
        self.attack_min = 15
        self.attack_max = 25
        self.special_damage_min = 40
        self.special_damage_max = 60
        self.special_cost = 20

    def normal_attack(self):
        """普通攻击"""
        damage = random.randint(self.attack_min, self.attack_max)
        return damage

    def special_attack(self):
        """特殊攻击 - 奶息喷射"""
        if self.energy >= self.special_cost:
            self.energy -= self.special_cost
            damage = random.randint(self.special_damage_min, self.special_damage_max)
            return damage, True
        return 0, False

    def heal(self):
        """喝奶恢复"""
        heal_amount = min(30, self.max_hp - self.hp)
        self.hp += heal_amount
        return heal_amount

    def restore_energy(self):
        """恢复能量"""
        self.energy = min(self.max_energy, self.energy + 10)

    def take_damage(self, damage):
        """受到伤害"""
        self.hp -= damage
        if self.hp < 0:
            self.hp = 0

    def is_alive(self):
        """是否存活"""
        return self.hp > 0

    def display_status(self):
        """显示状态"""
        hp_bar = self._create_bar(self.hp, self.max_hp, 20, Colors.GREEN, Colors.RED)
        energy_bar = self._create_bar(self.energy, self.max_energy, 20, Colors.CYAN, Colors.BLUE)

        print(f"{Colors.BOLD}🐉 奶龙状态：{Colors.END}")
        print(f"   ❤️  HP: {hp_bar} {self.hp}/{self.max_hp}")
        print(f"   ⚡ 能量: {energy_bar} {self.energy}/{self.max_energy}")

    def _create_bar(self, current, maximum, length, color1, color2):
        """创建状态条"""
        filled = int((current / maximum) * length)
        bar = color1 + '█' * filled + color2 + '░' * (length - filled) + Colors.END
        return bar

class Zombie:
    """僵尸类"""
    def __init__(self, zombie_type, name="僵尸"):
        self.name = name
        self.type = zombie_type

        if zombie_type == "normal":
            self.max_hp = 30
            self.attack_min = 5
            self.attack_max = 10
            self.emoji = "🧟"
        elif zombie_type == "strong":
            self.max_hp = 60
            self.attack_min = 10
            self.attack_max = 15
            self.emoji = "🧟‍♂️"
        else:  # boss
            self.max_hp = 150
            self.attack_min = 15
            self.attack_max = 25
            self.emoji = "👹"
            self.name = "僵尸王"

        self.hp = self.max_hp

    def attack(self):
        """攻击"""
        return random.randint(self.attack_min, self.attack_max)

    def take_damage(self, damage):
        """受到伤害"""
        self.hp -= damage
        if self.hp < 0:
            self.hp = 0

    def is_alive(self):
        """是否存活"""
        return self.hp > 0

    def display_status(self):
        """显示状态"""
        hp_percentage = (self.hp / self.max_hp) * 100
        if hp_percentage > 60:
            color = Colors.GREEN
        elif hp_percentage > 30:
            color = Colors.YELLOW
        else:
            color = Colors.RED

        return f"{self.emoji} {self.name}: {color}{self.hp}/{self.max_hp} HP{Colors.END}"

class Game:
    """游戏主类"""
    def __init__(self):
        self.dragon = MilkDragon()
        self.wave = 1
        self.max_wave = 7
        self.zombies = []
        self.total_kills = 0
        self.total_damage_dealt = 0
        self.total_damage_taken = 0

    def start(self):
        """开始游戏"""
        clear_screen()
        print_header("🐉 奶龙大战僵尸 🧟")

        print_slow(f"\n{Colors.CYAN}在一个宁静的奶龙村庄...{Colors.END}")
        time.sleep(0.5)
        print_slow(f"{Colors.YELLOW}突然，僵尸大军来袭！{Colors.END}")
        time.sleep(0.5)
        print_slow(f"{Colors.GREEN}勇敢的小奶龙决定保卫家园！{Colors.END}\n")
        time.sleep(1)

        input(f"{Colors.BOLD}按回车开始冒险...{Colors.END}")

        # 游戏主循环
        while self.wave <= self.max_wave and self.dragon.is_alive():
            if not self.start_wave():
                break

            if self.wave <= self.max_wave:
                self.wave += 1
                time.sleep(1)

        self.game_over()

    def start_wave(self):
        """开始新波次"""
        clear_screen()
        print_header(f"第 {self.wave} 波")

        # 生成僵尸
        self.zombies = self.spawn_zombies()

        print(f"{Colors.YELLOW}僵尸出现了！{Colors.END}\n")
        for zombie in self.zombies:
            print(f"  {zombie.display_status()}")

        time.sleep(1.5)
        input(f"\n{Colors.BOLD}按回车开始战斗...{Colors.END}")

        # 战斗循环
        while self.zombies and self.dragon.is_alive():
            if not self.combat_turn():
                return False

        if self.dragon.is_alive():
            clear_screen()
            print(f"\n{Colors.GREEN}{Colors.BOLD}✨ 第 {self.wave} 波胜利！ ✨{Colors.END}\n")
            time.sleep(1.5)
            return True

        return False

    def spawn_zombies(self):
        """生成僵尸"""
        zombies = []

        if self.wave <= 3:
            # 普通僵尸
            count = random.randint(1, 2)
            for i in range(count):
                zombies.append(Zombie("normal", f"普通僵尸{chr(65+i)}"))
        elif self.wave <= 6:
            # 强壮僵尸
            count = random.randint(2, 3)
            for i in range(count):
                zombies.append(Zombie("strong", f"强壮僵尸{chr(65+i)}"))
        else:
            # BOSS战
            zombies.append(Zombie("boss"))

        return zombies

    def combat_turn(self):
        """战斗回合"""
        clear_screen()
        print_header(f"第 {self.wave} 波 - 战斗中")

        # 显示状态
        self.dragon.display_status()
        print()
        print(f"{Colors.BOLD}🧟 敌人：{Colors.END}")
        for zombie in self.zombies:
            print(f"  {zombie.display_status()}")

        # 玩家行动
        print(f"\n{Colors.BOLD}你的行动：{Colors.END}")
        print("1️⃣  普通攻击（15-25伤害）")
        print(f"2️⃣  奶息喷射（40-60伤害，消耗20能量）{'  ' + Colors.RED + '[能量不足]' + Colors.END if self.dragon.energy < 20 else ''}")
        print("3️⃣  喝奶恢复（+30 HP）")
        print("4️⃣  尝试逃跑")

        choice = input(f"\n{Colors.CYAN}请选择 (1-4): {Colors.END}").strip()

        if choice == "1":
            return self.player_normal_attack()
        elif choice == "2":
            return self.player_special_attack()
        elif choice == "3":
            return self.player_heal()
        elif choice == "4":
            return self.player_flee()
        else:
            print(f"{Colors.RED}无效选择，默认普通攻击！{Colors.END}")
            time.sleep(1)
            return self.player_normal_attack()

    def player_normal_attack(self):
        """玩家普通攻击"""
        target = self.select_target()
        if target is None:
            return True

        damage = self.dragon.normal_attack()
        target.take_damage(damage)
        self.total_damage_dealt += damage

        print(f"\n{Colors.GREEN}🐉 奶龙发动普通攻击！{Colors.END}")
        print(f"{Colors.YELLOW}对 {target.name} 造成了 {damage} 点伤害！{Colors.END}")
        time.sleep(1)

        if not target.is_alive():
            print(f"{Colors.BOLD}{Colors.RED}💥 {target.name} 被击败了！{Colors.END}")
            self.zombies.remove(target)
            self.total_kills += 1
            time.sleep(1)

        if self.zombies:
            return self.zombies_attack()
        return True

    def player_special_attack(self):
        """玩家特殊攻击"""
        target = self.select_target()
        if target is None:
            return True

        damage, success = self.dragon.special_attack()

        if not success:
            print(f"\n{Colors.RED}⚠️  能量不足！自动改为普通攻击！{Colors.END}")
            time.sleep(1.5)
            return self.player_normal_attack()

        target.take_damage(damage)
        self.total_damage_dealt += damage

        print(f"\n{Colors.CYAN}{Colors.BOLD}🌟 奶龙使用了奶息喷射！{Colors.END}")
        print(f"{Colors.YELLOW}强大的奶息击中了 {target.name}，造成 {damage} 点伤害！{Colors.END}")
        time.sleep(1)

        if not target.is_alive():
            print(f"{Colors.BOLD}{Colors.RED}💥 {target.name} 被强大的奶息击败了！{Colors.END}")
            self.zombies.remove(target)
            self.total_kills += 1
            time.sleep(1)

        if self.zombies:
            return self.zombies_attack()
        return True

    def player_heal(self):
        """玩家恢复"""
        heal_amount = self.dragon.heal()

        print(f"\n{Colors.GREEN}🥛 奶龙喝了一口鲜奶！{Colors.END}")
        print(f"{Colors.GREEN}恢复了 {heal_amount} HP！{Colors.END}")
        time.sleep(1.5)

        return self.zombies_attack()

    def player_flee(self):
        """玩家逃跑"""
        if random.random() < 0.5:
            print(f"\n{Colors.GREEN}🏃 成功逃跑了！{Colors.END}")
            time.sleep(1.5)
            return False
        else:
            print(f"\n{Colors.RED}❌ 逃跑失败！僵尸追上来了！{Colors.END}")
            time.sleep(1.5)
            return self.zombies_attack()

    def select_target(self):
        """选择攻击目标"""
        if len(self.zombies) == 1:
            return self.zombies[0]

        print(f"\n{Colors.CYAN}选择攻击目标：{Colors.END}")
        for i, zombie in enumerate(self.zombies, 1):
            print(f"{i}. {zombie.display_status()}")

        while True:
            try:
                choice = int(input(f"{Colors.CYAN}目标编号 (1-{len(self.zombies)}): {Colors.END}"))
                if 1 <= choice <= len(self.zombies):
                    return self.zombies[choice - 1]
            except ValueError:
                pass
            print(f"{Colors.RED}无效选择，请重新输入{Colors.END}")

    def zombies_attack(self):
        """僵尸攻击"""
        print(f"\n{Colors.RED}--- 僵尸的回合 ---{Colors.END}\n")
        time.sleep(0.5)

        total_damage = 0
        for zombie in self.zombies:
            damage = zombie.attack()
            total_damage += damage
            self.dragon.take_damage(damage)

            print(f"{zombie.emoji} {zombie.name} 攻击了奶龙，造成 {damage} 点伤害！")
            time.sleep(0.8)

        self.total_damage_taken += total_damage

        if not self.dragon.is_alive():
            print(f"\n{Colors.RED}{Colors.BOLD}💔 奶龙倒下了...{Colors.END}")
            time.sleep(2)
            return False

        # 恢复能量
        self.dragon.restore_energy()

        print(f"\n{Colors.CYAN}⚡ 奶龙恢复了10点能量{Colors.END}")
        time.sleep(1)
        input(f"\n{Colors.BOLD}按回车继续...{Colors.END}")

        return True

    def game_over(self):
        """游戏结束"""
        clear_screen()

        if self.wave > self.max_wave:
            # 胜利
            print_header("🎉 胜 利 🎉")
            print_slow(f"\n{Colors.GREEN}{Colors.BOLD}恭喜！奶龙成功保卫了家园！{Colors.END}\n")
            print(f"{Colors.YELLOW}僵尸大军被击退了，村庄恢复了和平。{Colors.END}")
            print(f"{Colors.CYAN}小奶龙成为了村庄的英雄！{Colors.END}\n")
        else:
            # 失败
            print_header("💔 游戏结束")
            print_slow(f"\n{Colors.RED}虽然奶龙英勇战斗，但最终还是倒下了...{Colors.END}\n")
            print(f"{Colors.YELLOW}不过，奶龙的勇气会被永远铭记！{Colors.END}\n")

        # 显示统计
        print(f"{Colors.BOLD}{'='*50}{Colors.END}")
        print(f"{Colors.BOLD}战斗统计：{Colors.END}")
        print(f"  完成波数: {self.wave - 1 if not self.dragon.is_alive() else self.wave}")
        print(f"  击败僵尸: {self.total_kills}")
        print(f"  造成伤害: {self.total_damage_dealt}")
        print(f"  受到伤害: {self.total_damage_taken}")
        print(f"{Colors.BOLD}{'='*50}{Colors.END}\n")

        # 询问是否再玩
        replay = input(f"{Colors.CYAN}再来一局？(y/n): {Colors.END}").strip().lower()
        if replay == 'y' or replay == 'yes':
            self.__init__()
            self.start()
        else:
            print(f"\n{Colors.GREEN}感谢游玩！再见！👋{Colors.END}\n")

def main():
    """主函数"""
    try:
        game = Game()
        game.start()
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}游戏已退出。再见！{Colors.END}\n")
        sys.exit(0)

if __name__ == "__main__":
    main()
