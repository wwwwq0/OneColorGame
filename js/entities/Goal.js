// =====================================================
// OneColorGame - 终点实体
// =====================================================

import { Entity } from './Entity.js';

export class Goal extends Entity {
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     */
    constructor(x, y, w, h) {
        super(x, y, w, h);
        this._pulseTimer = 0;
        this._dashOffset = 0;
    }

    update(dt) {
        this._pulseTimer += dt;
        this._dashOffset += dt * 20;
    }

    /**
     * 渲染终点
     * @param {CanvasRenderingContext2D} ctx
     * @param {Object} theme
     */
    render(ctx, theme) {
        const goalColor = theme.goal || theme.primary;

        // 脉冲缩放
        const pulse = 1 + Math.sin(this._pulseTimer * 3) * 0.05;
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        ctx.save();

        // 外发光
        ctx.shadowColor = goalColor;
        ctx.shadowBlur = 15 + Math.sin(this._pulseTimer * 2) * 5;

        // 缩放变换
        ctx.translate(cx, cy);
        ctx.scale(pulse, pulse);
        ctx.translate(-cx, -cy);

        // 填充极淡背景
        ctx.globalAlpha = 0.1 + Math.sin(this._pulseTimer * 2) * 0.05;
        ctx.fillStyle = goalColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // 虚线边框（旋转动画）
        ctx.globalAlpha = 0.8;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.lineDashOffset = -this._dashOffset;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.setLineDash([]);

        // 中心标记 - 星形
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 0.5 + Math.sin(this._pulseTimer * 4) * 0.2;
        ctx.fillStyle = '#ffffff';
        this._drawStar(ctx, cx, cy, 5, this.width * 0.2, this.width * 0.1);

        // 内部网格装饰
        ctx.globalAlpha = 0.08;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        const gridSize = 10;
        for (let gx = this.x + gridSize; gx < this.x + this.width; gx += gridSize) {
            ctx.beginPath();
            ctx.moveTo(gx, this.y);
            ctx.lineTo(gx, this.y + this.height);
            ctx.stroke();
        }
        for (let gy = this.y + gridSize; gy < this.y + this.height; gy += gridSize) {
            ctx.beginPath();
            ctx.moveTo(this.x, gy);
            ctx.lineTo(this.x + this.width, gy);
            ctx.stroke();
        }

        ctx.restore();
    }

    /**
     * 绘制星形
     */
    _drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);

        for (let i = 0; i < spikes; i++) {
            let x = cx + Math.cos(rot) * outerRadius;
            let y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }

        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
    }
}
