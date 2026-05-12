// =====================================================
// OneColorGame - Canvas 2D 渲染器封装
// =====================================================

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../core/Config.js';

export class Renderer {
    /**
     * @param {HTMLCanvasElement} canvas
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = CANVAS_WIDTH;
        this.height = CANVAS_HEIGHT;

        // 确保 Canvas 内部尺寸正确
        canvas.width = this.width;
        canvas.height = this.height;

        // 默认文字渲染设置
        this.ctx.textBaseline = 'middle';
        this.ctx.textAlign = 'center';
    }

    /** 获取原始 2d 上下文 */
    getContext() {
        return this.ctx;
    }

    /** 清屏并填充纯色背景 */
    clear(color = '#0a0a1a') {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    /**
     * 绘制矩形
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @param {string} color - CSS 颜色值
     * @param {number} [alpha=1]
     */
    drawRect(x, y, w, h, color, alpha = 1) {
        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
        ctx.restore();
    }

    /**
     * 绘制带圆角的矩形
     */
    drawRoundRect(x, y, w, h, radius, color, alpha = 1) {
        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
        ctx.lineTo(x + w, y + h - radius);
        ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        ctx.lineTo(x + radius, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    /**
     * 绘制带描边的矩形
     */
    drawStrokedRect(x, y, w, h, fillColor, strokeColor, lineWidth = 2, alpha = 1) {
        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = alpha;
        if (fillColor) {
            ctx.fillStyle = fillColor;
            ctx.fillRect(x, y, w, h);
        }
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        ctx.strokeRect(x, y, w, h);
        ctx.restore();
    }

    /**
     * 绘制旋转矩形
     * @param {number} cx - 中心 x
     * @param {number} cy - 中心 y
     * @param {number} w
     * @param {number} h
     * @param {number} angle - 弧度
     * @param {string} color
     * @param {number} [alpha=1]
     */
    drawRotatedRect(cx, cy, w, h, angle, color, alpha = 1) {
        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.fillStyle = color;
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.restore();
    }

    /**
     * 绘制圆形
     */
    drawCircle(x, y, radius, color, alpha = 1) {
        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    /**
     * 绘制虚线矩形
     */
    drawDashedRect(x, y, w, h, color, lineWidth = 2, dashPattern = [6, 4], alpha = 1) {
        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.setLineDash(dashPattern);
        ctx.strokeRect(x, y, w, h);
        ctx.setLineDash([]);
        ctx.restore();
    }

    /**
     * 绘制文字
     * @param {string} text
     * @param {number} x
     * @param {number} y
     * @param {string} [font='16px Microsoft YaHei']
     * @param {string} [color='#ffffff']
     * @param {string} [align='center']
     * @param {number} [alpha=1]
     */
    drawText(text, x, y, font = '16px Microsoft YaHei', color = '#ffffff', align = 'center', alpha = 1) {
        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, y);
        ctx.restore();
    }

    /**
     * 绘制带阴影的文字
     */
    drawTextWithShadow(text, x, y, font, color, shadowColor = 'rgba(0,0,0,0.5)', shadowBlur = 4, align = 'center') {
        const ctx = this.ctx;
        ctx.save();
        ctx.font = font;
        ctx.textAlign = align;
        ctx.textBaseline = 'middle';
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = shadowBlur;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
        ctx.restore();
    }

    /**
     * 全屏半透明覆盖
     */
    fillScreen(color, alpha = 1) {
        this.drawRect(0, 0, this.width, this.height, color, alpha);
    }

    /**
     * 保存状态
     */
    save() {
        this.ctx.save();
    }

    /**
     * 恢复状态
     */
    restore() {
        this.ctx.restore();
    }

    /**
     * 平移
     */
    translate(x, y) {
        this.ctx.translate(x, y);
    }

    /**
     * 裁剪圆形区域（用于圆形过渡）
     */
    clipCircle(cx, cy, radius) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.clip();
    }

    /**
     * 绘制网格背景
     */
    drawGrid(spacing, color, alpha = 0.1) {
        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        for (let x = 0; x <= this.width; x += spacing) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
            ctx.stroke();
        }
        for (let y = 0; y <= this.height; y += spacing) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
            ctx.stroke();
        }
        ctx.restore();
    }
}
