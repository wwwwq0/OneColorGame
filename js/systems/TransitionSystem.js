// =====================================================
// OneColorGame - 场景过渡系统
// =====================================================

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../core/Config.js';

export class TransitionSystem {
    constructor() {
        this.active = false;
        this.type = 'fade';        // fade | circle | slideLeft
        this.progress = 0;         // 0 到 1
        this.duration = 0.5;
        this.phase = 'in';         // 'in' (遮罩增加) | 'out' (遮罩减少)
        this._onMidpoint = null;
        this._onComplete = null;
        this._midpointFired = false;
        this.color = '#000000';

        // circle 过渡的中心点
        this.circleCX = CANVAS_WIDTH / 2;
        this.circleCY = CANVAS_HEIGHT / 2;
    }

    /**
     * 启动过渡动画
     * @param {string} type - 'fade' | 'circle' | 'slideLeft'
     * @param {number} duration - 总持续时间（秒），前半入后半出
     * @param {Function} onMidpoint - 中点回调（切换场景）
     * @param {Function} [onComplete] - 完成回调
     * @param {Object} [options] - 附加选项
     */
    start(type, duration, onMidpoint, onComplete = null, options = {}) {
        this.active = true;
        this.type = type;
        this.duration = duration;
        this.progress = 0;
        this.phase = 'in';
        this._onMidpoint = onMidpoint;
        this._onComplete = onComplete;
        this._midpointFired = false;
        this.color = options.color || '#000000';

        if (options.cx !== undefined) this.circleCX = options.cx;
        if (options.cy !== undefined) this.circleCY = options.cy;
    }

    /**
     * 是否正在过渡
     */
    isActive() {
        return this.active;
    }

    /**
     * 更新过渡进度
     * @param {number} dt
     */
    update(dt) {
        if (!this.active) return;

        this.progress += dt / (this.duration / 2); // 半程速度

        if (this.phase === 'in') {
            if (this.progress >= 1) {
                this.progress = 1;

                // 触发中点回调
                if (!this._midpointFired && this._onMidpoint) {
                    this._midpointFired = true;
                    this._onMidpoint();
                }

                // 进入出场阶段
                this.phase = 'out';
                this.progress = 0;
            }
        } else {
            // 'out' 阶段
            if (this.progress >= 1) {
                this.progress = 1;
                this.active = false;

                if (this._onComplete) {
                    this._onComplete();
                }
            }
        }
    }

    /**
     * 渲染过渡效果
     * @param {CanvasRenderingContext2D} ctx
     */
    render(ctx) {
        if (!this.active) return;

        // 计算当前不透明度/遮罩大小
        let t = this.progress;

        // 缓动函数 (ease-in-out)
        t = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

        // 出场阶段反转
        if (this.phase === 'out') {
            t = 1 - t;
        }

        switch (this.type) {
            case 'fade':
                this._renderFade(ctx, t);
                break;
            case 'circle':
                this._renderCircle(ctx, t);
                break;
            case 'slideLeft':
                this._renderSlide(ctx, t);
                break;
        }
    }

    _renderFade(ctx, t) {
        ctx.save();
        ctx.globalAlpha = t;
        ctx.fillStyle = this.color;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.restore();
    }

    _renderCircle(ctx, t) {
        // 圆形遮罩 - t=1 时完全遮住，t=0 时完全露出
        const maxRadius = Math.sqrt(
            CANVAS_WIDTH * CANVAS_WIDTH + CANVAS_HEIGHT * CANVAS_HEIGHT
        ) / 2;
        const radius = maxRadius * (1 - t);

        ctx.save();
        ctx.fillStyle = this.color;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // 挖出圆形透明区域
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(this.circleCX, this.circleCY, Math.max(0, radius), 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // 修复混合模式
        ctx.globalCompositeOperation = 'source-over';
    }

    _renderSlide(ctx, t) {
        ctx.save();
        ctx.fillStyle = this.color;
        const slideX = CANVAS_WIDTH * t;
        ctx.fillRect(CANVAS_WIDTH - slideX, 0, slideX, CANVAS_HEIGHT);
        ctx.restore();
    }
}
