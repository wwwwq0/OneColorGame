// =====================================================
// OneColorGame - 安全区域实体
// =====================================================

import { Entity } from './Entity.js';

export class SafeZone extends Entity {
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     */
    constructor(x, y, w, h) {
        super(x, y, w, h);
    }

    /**
     * 渲染安全区域 - 实心主题色
     * @param {CanvasRenderingContext2D} ctx
     * @param {Object} theme
     */
    render(ctx, theme) {
        const safeColor = theme.safe || theme.primary;

        ctx.save();
        ctx.globalAlpha = 1;
        ctx.fillStyle = safeColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // 微弱的内部纹理
        ctx.globalAlpha = 0.05;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        const patternSize = 20;
        for (let px = this.x; px < this.x + this.width; px += patternSize) {
            for (let py = this.y; py < this.y + this.height; py += patternSize) {
                ctx.strokeRect(px, py, patternSize, patternSize);
            }
        }

        ctx.restore();
    }
}
