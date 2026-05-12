// =====================================================
// OneColorGame - 设置场景
// =====================================================

import {
    CANVAS_WIDTH, CANVAS_HEIGHT, EVENTS,
    DEFAULT_SETTINGS, STORAGE_KEYS
} from '../core/Config.js';
import { UIRenderer } from '../rendering/UIRenderer.js';

export class SettingsScene {
    /**
     * @param {import('../core/Game.js').Game} game
     */
    constructor(game) {
        this.game = game;
        this.isOverlay = true;

        // 加载设置
        this.settings = { ...DEFAULT_SETTINGS };
        this._loadSettings();

        // UI 区域
        this._backBtn = { x: 300, y: 440, w: 200, h: 45 };
        this._resetBtn = { x: 300, y: 500, w: 200, h: 40 };

        // 滑块交互状态
        this._draggingSlider = null;

        // 滑块配置
        this._sliders = {
            sfxVolume: {
                x: 200, y: 250, w: 250,
                label: '音效音量',
                color: '#165DFF'
            }
        };

        // 粒子开关
        this._particleToggle = {
            x: 200, y: 310, w: 250, h: 30
        };

        // 动画
        this._fadeIn = 0;
    }

    _loadSettings() {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            if (stored) {
                Object.assign(this.settings, JSON.parse(stored));
            }
        } catch (e) { /* ignore */ }
    }

    _saveSettings() {
        try {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
        } catch (e) { /* ignore */ }
        this.game.eventBus.emit(EVENTS.SETTING_CHANGED, this.settings);
    }

    enter() {
        this._fadeIn = 0;
    }

    exit() {
        this._saveSettings();
    }

    update(dt) {
        if (this._fadeIn < 1) {
            this._fadeIn = Math.min(1, this._fadeIn + dt * 4);
        }

        // 滑块拖拽
        if (this._draggingSlider && this.game.inputManager.mouseDown) {
            const sliderConfig = this._sliders[this._draggingSlider];
            const trackX = sliderConfig.x + 120;
            const mouseX = this.game.inputManager.mouseX;
            let value = (mouseX - trackX) / sliderConfig.w;
            value = Math.max(0, Math.min(1, value));
            this.settings[this._draggingSlider] = value;
            // 实时通知音频系统更新音量
            this.game.eventBus.emit(EVENTS.SETTING_CHANGED, this.settings);
        } else {
            this._draggingSlider = null;
        }
    }

    handleInput(inputManager) {
        const im = inputManager;
        const { game } = this;

        // 返回
        if (im.isKeyJustPressed('Escape') ||
            im.isClickInRect(this._backBtn.x, this._backBtn.y, this._backBtn.w, this._backBtn.h)) {
            im.consumeClick();
            game.eventBus.emit(EVENTS.PLAY_SOUND, 'click');
            this._saveSettings();
            game.sceneManager.pop();
            return;
        }

        // 重置进度
        if (im.isClickInRect(this._resetBtn.x, this._resetBtn.y, this._resetBtn.w, this._resetBtn.h)) {
            im.consumeClick();
            game.eventBus.emit(EVENTS.PLAY_SOUND, 'click');
            try {
                localStorage.removeItem(STORAGE_KEYS.PROGRESS);
            } catch (e) { /* ignore */ }
            return;
        }

        // 滑块交互
        if (im.mouseDown) {
            for (const [key, slider] of Object.entries(this._sliders)) {
                const trackX = slider.x + 120;
                if (im.isMouseInRect(trackX - 10, slider.y - 15, slider.w + 20, 30)) {
                    this._draggingSlider = key;
                }
            }
        }

        // 粒子效果开关
        if (im.isClickInRect(this._particleToggle.x, this._particleToggle.y - 10,
                             this._particleToggle.w + 120, this._particleToggle.h)) {
            im.consumeClick();
            game.eventBus.emit(EVENTS.PLAY_SOUND, 'click');
            this.settings.showParticles = !this.settings.showParticles;
            game.particleSystem.setEnabled(this.settings.showParticles);
            this._saveSettings();
        }
    }

    render(renderer) {
        const ctx = renderer.getContext();
        const alpha = this._fadeIn;

        // 半透明遮罩
        ctx.save();
        ctx.globalAlpha = 0.7 * alpha;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = alpha;

        // 标题
        UIRenderer.drawTitle(ctx, '设 置', 160, 32, '#ffffff', alpha);

        // 音效音量滑块
        const sfxSlider = this._sliders.sfxVolume;
        UIRenderer.drawSlider(ctx, {
            ...sfxSlider,
            value: this.settings.sfxVolume,
            label: sfxSlider.label,
            isActive: this._draggingSlider === 'sfxVolume'
        });

        // 粒子效果开关
        const pt = this._particleToggle;
        ctx.font = '14px "Microsoft YaHei"';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('粒子效果', pt.x, pt.y + 5);

        // 开关按钮
        const toggleX = pt.x + 120;
        const toggleW = 50;
        const toggleH = 24;
        const toggleY = pt.y - 7;
        const isOn = this.settings.showParticles;

        ctx.fillStyle = isOn ? '#165DFF' : 'rgba(255,255,255,0.15)';
        ctx.beginPath();
        // 兼容性圆角矩形
        const tr = Math.min(12, toggleW / 2, toggleH / 2);
        ctx.moveTo(toggleX + tr, toggleY);
        ctx.lineTo(toggleX + toggleW - tr, toggleY);
        ctx.quadraticCurveTo(toggleX + toggleW, toggleY, toggleX + toggleW, toggleY + tr);
        ctx.lineTo(toggleX + toggleW, toggleY + toggleH - tr);
        ctx.quadraticCurveTo(toggleX + toggleW, toggleY + toggleH, toggleX + toggleW - tr, toggleY + toggleH);
        ctx.lineTo(toggleX + tr, toggleY + toggleH);
        ctx.quadraticCurveTo(toggleX, toggleY + toggleH, toggleX, toggleY + toggleH - tr);
        ctx.lineTo(toggleX, toggleY + tr);
        ctx.quadraticCurveTo(toggleX, toggleY, toggleX + tr, toggleY);
        ctx.closePath();
        ctx.fill();

        // 滑块圆点
        const knobRadius = 10;
        const knobX = isOn ? toggleX + toggleW - knobRadius - 2 : toggleX + knobRadius + 2;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(knobX, toggleY + toggleH / 2, knobRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '12px "Microsoft YaHei"';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.textAlign = 'left';
        ctx.fillText(isOn ? '开' : '关', toggleX + toggleW + 10, pt.y + 5);

        const im = this.game.inputManager;

        // 返回按钮
        UIRenderer.drawButton(ctx, {
            text: '← 返回',
            ...this._backBtn,
            color: '#165DFF',
            isHovered: im.isMouseInRect(this._backBtn.x, this._backBtn.y, this._backBtn.w, this._backBtn.h)
        });

        // 重置进度
        UIRenderer.drawButton(ctx, {
            text: '重置游戏进度',
            ...this._resetBtn,
            color: 'rgba(180,60,60,0.7)',
            isHovered: im.isMouseInRect(this._resetBtn.x, this._resetBtn.y, this._resetBtn.w, this._resetBtn.h),
            alpha: 0.8
        });

        // 提示
        UIRenderer.drawHint(ctx, 'ESC 返回', 555, `rgba(255,255,255,${0.3 * alpha})`);

        ctx.restore();
    }
}
