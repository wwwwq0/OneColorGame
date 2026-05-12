// =====================================================
// OneColorGame - 检查点实体
// =====================================================

import { Entity } from './Entity.js';
import { hexToRgba } from '../core/Config.js';

export class Checkpoint extends Entity {
    /**
     * @param {number} x - 中心位置 x
     * @param {number} y - 中心位置 y
     */
    constructor(x, y) {
        super(x - 12, y - 12, 24, 24);
        this.centerX = x;
        this.centerY = y;
        this.activated = false;
        this._activateTimer = 0;
        this._pulseTimer = 0;
        this._glowIntensity = 0;
    }

    update(dt) {
        this._pulseTimer += dt;

        if (this.activated) {
            this._activateTimer += dt;
            this._glowIntensity = Math.min(1, this._glowIntensity + dt * 3);
        }
    }

    /**
     * 激活检查点
     * @returns {boolean} 是否首次激活
     */
    activate() {
        if (this.activated) return false;
        this.activated = true;
        this._activateTimer = 0;
        this._glowIntensity = 0;
        return true;
    }

    /**
     * 渲染检查点
     * @param {CanvasRenderingContext2D} ctx
     * @param {Object} theme
     */
    render(ctx, theme) {
        const color = theme.primary;
        const cx = this.centerX;
        const cy = this.centerY;

        ctx.save();

        if (this.activated) {
            // 已激活 - 发光实心
            const glowPulse = Math.sin(this._pulseTimer * 3) * 0.3;

            // 外发光环
            ctx.shadowColor = color;
            ctx.shadowBlur = 15 + glowPulse * 10;
            ctx.globalAlpha = 0.6 + glowPulse * 0.2;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(cx, cy, 10, 0, Math.PI * 2);
            ctx.fill();

            // 内核白点
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 0.9;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(cx, cy, 4, 0, Math.PI * 2);
            ctx.fill();

            // 旋转的装饰线
            ctx.globalAlpha = 0.4;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            const rotAngle = this._activateTimer * 2;
            for (let i = 0; i < 4; i++) {
                const a = rotAngle + (Math.PI / 2) * i;
                ctx.beginPath();
                ctx.moveTo(cx + Math.cos(a) * 6, cy + Math.sin(a) * 6);
                ctx.lineTo(cx + Math.cos(a) * 11, cy + Math.sin(a) * 11);
                ctx.stroke();
            }
        } else {
            // 未激活 - 半透明菱形
            const breathe = Math.sin(this._pulseTimer * 2) * 0.1;
            ctx.globalAlpha = 0.3 + breathe;
            ctx.fillStyle = color;

            ctx.translate(cx, cy);
            ctx.rotate(Math.PI / 4);
            ctx.fillRect(-7, -7, 14, 14);

            // 白色边框
            ctx.strokeStyle = 'rgba(255,255,255,0.4)';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(-7, -7, 14, 14);
        }

        ctx.restore();
    }
}
