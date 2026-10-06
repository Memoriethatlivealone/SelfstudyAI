// 音效管理器类 - 使用 Web Audio API 生成简单音效
export class AudioManager {
  constructor() {
    this.audioContext = null;
    this.isMuted = false;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API 不支持');
    }
  }

  // 播放音效的基础方法
  playTone(frequency, duration, type = 'sine', volume = 0.3) {
    if (!this.audioContext || this.isMuted) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // 播放和弦
  playChord(frequencies, duration, volume = 0.2) {
    if (!this.audioContext || this.isMuted) return;

    frequencies.forEach(freq => {
      this.playTone(freq, duration, 'sine', volume / frequencies.length);
    });
  }

  // 开始游戏音效
  playStart() {
    this.playChord([523.25, 659.25, 783.99], 0.5); // C大调和弦
  }

  // 选择卡片音效
  playSelect() {
    this.playTone(880, 0.1, 'square', 0.2);
  }

  // 放置角色音效
  playPlace() {
    const now = this.audioContext?.currentTime || 0;
    this.playTone(659.25, 0.1, 'sine', 0.3);
    setTimeout(() => {
      this.playTone(783.99, 0.1, 'sine', 0.2);
    }, 50);
  }

  // 收集阳光音效
  playCollect() {
    this.playTone(1046.50, 0.15, 'sine', 0.3); // 高音C
    setTimeout(() => {
      this.playTone(1318.51, 0.1, 'sine', 0.2); // E
    }, 80);
  }

  // 错误音效
  playError() {
    this.playTone(200, 0.2, 'sawtooth', 0.3);
  }

  // 取消音效
  playCancel() {
    this.playTone(440, 0.1, 'square', 0.2);
  }

  // 暂停音效
  playPause() {
    this.playTone(523.25, 0.15, 'sine', 0.3);
  }

  // 继续音效
  playResume() {
    this.playTone(659.25, 0.15, 'sine', 0.3);
  }

  // 胜利音效
  playVictory() {
    const melody = [
      { freq: 523.25, time: 0 },
      { freq: 659.25, time: 150 },
      { freq: 783.99, time: 300 },
      { freq: 1046.50, time: 450 }
    ];

    melody.forEach(note => {
      setTimeout(() => {
        this.playTone(note.freq, 0.3, 'sine', 0.3);
      }, note.time);
    });
  }

  // 失败音效
  playDefeat() {
    const melody = [
      { freq: 392, time: 0 },
      { freq: 349.23, time: 150 },
      { freq: 293.66, time: 300 },
      { freq: 261.63, time: 450 }
    ];

    melody.forEach(note => {
      setTimeout(() => {
        this.playTone(note.freq, 0.3, 'sine', 0.3);
      }, note.time);
    });
  }

  // 攻击音效（可选，不过调用频率高可能太吵）
  playAttack() {
    if (!this.isMuted && Math.random() < 0.3) { // 只有30%概率播放
      this.playTone(800, 0.05, 'square', 0.1);
    }
  }

  // 切换静音
  toggleMute() {
    this.isMuted = !this.isMuted;
  }
}
