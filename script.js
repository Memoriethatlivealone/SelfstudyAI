// 番茄时钟应用
class PomodoroTimer {
    constructor() {
        this.modes = {
            'pomodoro': 25 * 60,
            'short-break': 5 * 60,
            'long-break': 15 * 60
        };

        this.currentMode = 'pomodoro';
        this.timeLeft = this.modes[this.currentMode];
        this.isRunning = false;
        this.timerInterval = null;
        this.completedPomodoros = 0;

        this.initElements();
        this.initEventListeners();
        this.loadSettings();
        this.updateDisplay();
    }

    initElements() {
        this.minutesDisplay = document.getElementById('minutes');
        this.secondsDisplay = document.getElementById('seconds');
        this.startBtn = document.getElementById('start-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.completedCountDisplay = document.getElementById('completed-count');
        this.modeBtns = document.querySelectorAll('.mode-btn');

        // 设置输入框
        this.pomodoroTimeInput = document.getElementById('pomodoro-time');
        this.shortBreakTimeInput = document.getElementById('short-break-time');
        this.longBreakTimeInput = document.getElementById('long-break-time');
        this.autoStartBreaksCheckbox = document.getElementById('auto-start-breaks');
        this.enableSoundCheckbox = document.getElementById('enable-sound');
    }

    initEventListeners() {
        // 开始/暂停按钮
        this.startBtn.addEventListener('click', () => this.toggleTimer());

        // 重置按钮
        this.resetBtn.addEventListener('click', () => this.resetTimer());

        // 模式切换按钮
        this.modeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!this.isRunning) {
                    this.switchMode(e.target.dataset.mode);
                }
            });
        });

        // 设置输入框变化
        this.pomodoroTimeInput.addEventListener('change', () => this.updateSettings());
        this.shortBreakTimeInput.addEventListener('change', () => this.updateSettings());
        this.longBreakTimeInput.addEventListener('change', () => this.updateSettings());
        this.autoStartBreaksCheckbox.addEventListener('change', () => this.saveSettings());
        this.enableSoundCheckbox.addEventListener('change', () => this.saveSettings());

        // 页面可见性变化（用于标题更新）
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.isRunning) {
                this.updateTitle();
            }
        });
    }

    toggleTimer() {
        if (this.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }

    startTimer() {
        this.isRunning = true;
        this.startBtn.textContent = '暂停';
        this.startBtn.classList.add('pause');

        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            this.updateTitle();

            if (this.timeLeft === 0) {
                this.timerComplete();
            }
        }, 1000);
    }

    pauseTimer() {
        this.isRunning = false;
        this.startBtn.textContent = '开始';
        this.startBtn.classList.remove('pause');
        clearInterval(this.timerInterval);
        document.title = '番茄时钟 - Pomodoro Timer';
    }

    resetTimer() {
        this.pauseTimer();
        this.timeLeft = this.modes[this.currentMode];
        this.updateDisplay();
        document.title = '番茄时钟 - Pomodoro Timer';
    }

    timerComplete() {
        this.pauseTimer();

        // 如果完成的是专注时间，增加计数
        if (this.currentMode === 'pomodoro') {
            this.completedPomodoros++;
            this.completedCountDisplay.textContent = this.completedPomodoros;
            this.saveCompletedCount();

            // 决定下一个模式：每4个番茄钟后是长休息
            const nextMode = (this.completedPomodoros % 4 === 0) ? 'long-break' : 'short-break';

            this.showNotification('专注时间结束！', '休息一下吧 🎉');

            if (this.autoStartBreaksCheckbox.checked) {
                this.switchMode(nextMode);
                setTimeout(() => this.startTimer(), 1000);
            } else {
                this.switchMode(nextMode);
            }
        } else {
            // 休息结束
            this.showNotification('休息结束！', '准备开始新的番茄钟 💪');
            this.switchMode('pomodoro');
        }

        // 播放提醒音
        if (this.enableSoundCheckbox.checked) {
            this.playSound();
        }
    }

    switchMode(mode) {
        this.currentMode = mode;
        this.timeLeft = this.modes[mode];

        // 更新活动按钮
        this.modeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        this.updateDisplay();
        this.updateBodyColor();
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;

        this.minutesDisplay.textContent = String(minutes).padStart(2, '0');
        this.secondsDisplay.textContent = String(seconds).padStart(2, '0');
    }

    updateTitle() {
        if (this.isRunning) {
            const minutes = Math.floor(this.timeLeft / 60);
            const seconds = this.timeLeft % 60;
            const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            document.title = `${timeStr} - 番茄时钟`;
        }
    }

    updateBodyColor() {
        const colors = {
            'pomodoro': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'short-break': 'linear-gradient(135deg, #38ef7d 0%, #11998e 100%)',
            'long-break': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
        };

        document.body.style.background = colors[this.currentMode];
    }

    updateSettings() {
        const pomodoroMinutes = parseInt(this.pomodoroTimeInput.value) || 25;
        const shortBreakMinutes = parseInt(this.shortBreakTimeInput.value) || 5;
        const longBreakMinutes = parseInt(this.longBreakTimeInput.value) || 15;

        this.modes['pomodoro'] = pomodoroMinutes * 60;
        this.modes['short-break'] = shortBreakMinutes * 60;
        this.modes['long-break'] = longBreakMinutes * 60;

        // 如果当前不在运行，更新时间
        if (!this.isRunning) {
            this.timeLeft = this.modes[this.currentMode];
            this.updateDisplay();
        }

        this.saveSettings();
    }

    saveSettings() {
        const settings = {
            pomodoroTime: parseInt(this.pomodoroTimeInput.value),
            shortBreakTime: parseInt(this.shortBreakTimeInput.value),
            longBreakTime: parseInt(this.longBreakTimeInput.value),
            autoStartBreaks: this.autoStartBreaksCheckbox.checked,
            enableSound: this.enableSoundCheckbox.checked
        };

        localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('pomodoroSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            this.pomodoroTimeInput.value = settings.pomodoroTime || 25;
            this.shortBreakTimeInput.value = settings.shortBreakTime || 5;
            this.longBreakTimeInput.value = settings.longBreakTime || 15;
            this.autoStartBreaksCheckbox.checked = settings.autoStartBreaks !== false;
            this.enableSoundCheckbox.checked = settings.enableSound !== false;

            this.updateSettings();
        }

        // 加载完成计数
        const completedCount = localStorage.getItem('completedPomodoros');
        if (completedCount) {
            this.completedPomodoros = parseInt(completedCount);
            this.completedCountDisplay.textContent = this.completedPomodoros;
        }
    }

    saveCompletedCount() {
        localStorage.setItem('completedPomodoros', this.completedPomodoros);
    }

    showNotification(title, body) {
        // 检查浏览器是否支持通知
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification(title, { body, icon: '🍅' });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification(title, { body, icon: '🍅' });
                    }
                });
            }
        }

        // 同时在页面上显示提示
        alert(`${title}\n${body}`);
    }

    playSound() {
        // 使用Web Audio API创建简单的提示音
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    const timer = new PomodoroTimer();

    // 请求通知权限
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
});
