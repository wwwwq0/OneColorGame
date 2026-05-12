// =====================================================
// OneColorGame - 音频管理器 (Web Audio API 合成音效)
// =====================================================

import { EVENTS, DEFAULT_SETTINGS, STORAGE_KEYS } from '../core/Config.js';

export class AudioManager {
    /**
     * @param {import('../core/EventBus.js').EventBus} eventBus
     */
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.audioContext = null;
        this.masterGain = null;
        this.sfxGain = null;
        this._initialized = false;

        // 加载设置
        this.settings = { ...DEFAULT_SETTINGS };
        this._loadSettings();

        // 监听事件
        this.eventBus.on(EVENTS.PLAY_SOUND, (soundName) => {
            this.playSound(soundName);
        });

        this.eventBus.on(EVENTS.SETTING_CHANGED, (newSettings) => {
            if (newSettings.sfxVolume !== undefined) {
                this.settings.sfxVolume = newSettings.sfxVolume;
                if (this.sfxGain) {
                    this.sfxGain.gain.value = this.settings.sfxVolume;
                }
            }
            this._saveSettings();
        });
    }

    _loadSettings() {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            if (stored) {
                const parsed = JSON.parse(stored);
                Object.assign(this.settings, parsed);
            }
        } catch (e) { /* ignore */ }
    }

    _saveSettings() {
        try {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
        } catch (e) { /* ignore */ }
    }

    /**
     * 初始化 AudioContext（需要在用户手势后调用）
     */
    init() {
        if (this._initialized) return;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = 1.0;

            this.sfxGain = this.audioContext.createGain();
            this.sfxGain.connect(this.masterGain);
            this.sfxGain.gain.value = this.settings.sfxVolume;

            this._initialized = true;
        } catch (e) {
            console.warn('Web Audio API not available:', e);
        }
    }

    /**
     * 恢复被浏览器暂停的 AudioContext
     */
    resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    /**
     * 播放指定音效
     * @param {string} soundName
     */
    playSound(soundName) {
        if (!this._initialized || !this.audioContext) {
            this.init();
        }
        if (!this.audioContext) return;

        this.resumeContext();

        switch (soundName) {
            case 'click':
                this._playClick();
                break;
            case 'death':
                this._playDeath();
                break;
            case 'win':
                this._playWin();
                break;
            case 'checkpoint':
                this._playCheckpoint();
                break;
            case 'star':
                this._playStar();
                break;
            case 'move':
                this._playMove();
                break;
            default:
                break;
        }
    }

    /**
     * 创建振荡器 + 增益节点的基础音效单元
     */
    _createTone(type, frequency, startTime, duration, volume = 0.3) {
        const ctx = this.audioContext;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(volume, startTime + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(startTime);
        osc.stop(startTime + duration);

        return { osc, gain };
    }

    /** UI 点击音效 - 短促清脆 */
    _playClick() {
        const t = this.audioContext.currentTime;
        this._createTone('square', 800, t, 0.05, 0.15);
    }

    /** 死亡音效 - 低频噪声下降 */
    _playDeath() {
        const ctx = this.audioContext;
        const t = ctx.currentTime;

        // 下降的低频
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.35);

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.4);

        // 叠加噪声感
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(150, t);
        osc2.frequency.exponentialRampToValueAtTime(30, t + 0.3);

        gain2.gain.setValueAtTime(0.15, t);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

        osc2.connect(gain2);
        gain2.connect(this.sfxGain);
        osc2.start(t);
        osc2.stop(t + 0.35);
    }

    /** 胜利音效 - 上升琶音 C5-E5-G5-C6 */
    _playWin() {
        const t = this.audioContext.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        const spacing = 0.1;
        notes.forEach((freq, i) => {
            this._createTone('sine', freq, t + i * spacing, 0.25, 0.25);
        });
    }

    /** 检查点音效 - 双音叮咚 */
    _playCheckpoint() {
        const t = this.audioContext.currentTime;
        this._createTone('sine', 659.25, t, 0.12, 0.2);       // E5
        this._createTone('sine', 783.99, t + 0.08, 0.15, 0.25); // G5
    }

    /** 星星获得音效 */
    _playStar() {
        const t = this.audioContext.currentTime;
        this._createTone('sine', 880, t, 0.1, 0.2);
        this._createTone('sine', 1108.73, t + 0.08, 0.1, 0.2);
        this._createTone('sine', 1318.51, t + 0.16, 0.15, 0.25);
    }

    /** 移动开始的微弱音效 */
    _playMove() {
        const t = this.audioContext.currentTime;
        this._createTone('sine', 440, t, 0.03, 0.05);
    }
}
