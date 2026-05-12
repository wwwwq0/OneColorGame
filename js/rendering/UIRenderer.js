// =====================================================
// OneColorGame - UI 渲染工具 (HUD/按钮/文字/星星)
// =====================================================

import { CANVAS_WIDTH, CANVAS_HEIGHT, hexToRgba } from '../core/Config.js';

/**
 * 兼容性 roundRect 绘制（支持旧浏览器）
 */
function roundRectPath(ctx, x, y, w, h, r) {
    if (w < 0) w = 0;
    if (h < 0) h = 0;
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

export class UIRenderer {
    /**
     * 绘制游戏 HUD
     * @param {CanvasRenderingContext2D} ctx
     * @param {Object} options
     */
    static drawHUD(ctx, { levelName, levelIndex, timer, themeColor, deathCount }) {
        ctx.save();

        // 左上角: 关卡名
        ctx.font = 'bold 16px "Microsoft YaHei"';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.8;
        ctx.fillText(`第${levelIndex + 1}关 · ${levelName}`, 15, 12);

        // 计时器
        const minutes = Math.floor(timer / 60);
        const seconds = Math.floor(timer % 60);
        const ms = Math.floor((timer % 1) * 100);
        const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;

        ctx.font = '14px "Courier New", monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillText(timeStr, 15, 35);

        // 右上角: 死亡次数
        if (deathCount > 0) {
            ctx.textAlign = 'right';
            ctx.font = '14px "Microsoft YaHei"';
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fillText(`死亡: ${deathCount}`, CANVAS_WIDTH - 15, 15);
        }

        ctx.restore();
    }

    /**
     * 绘制按钮
     * @param {CanvasRenderingContext2D} ctx
     * @param {Object} options
     * @returns {{x: number, y: number, w: number, h: number}} 按钮碰撞区域
     */
    static drawButton(ctx, { text, x, y, w, h, color, isHovered, alpha = 1 }) {
        ctx.save();
        ctx.globalAlpha = alpha;

        const radius = 8;

        // 背景
        const bgColor = isHovered ? color : (color.startsWith('#') ? hexToRgba(color, 0.8) : color);
        ctx.fillStyle = bgColor;
        if (isHovered) {
            ctx.shadowColor = color;
            ctx.shadowBlur = 15;
        }

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

        // 白色边框
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 文字
        ctx.font = 'bold 16px "Microsoft YaHei"';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x + w / 2, y + h / 2);

        ctx.restore();

        return { x, y, w, h };
    }

    /**
     * 绘制星星评级
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} count - 获得的星星数 (0-3)
     * @param {number} x - 中心 x
     * @param {number} y - 中心 y
     * @param {number} size - 星星大小
     * @param {string} color - 填充颜色
     */
    static drawStars(ctx, count, x, y, size, color) {
        const spacing = size * 2.5;
        const startX = x - spacing;

        for (let i = 0; i < 3; i++) {
            const starX = startX + i * spacing;
            const filled = i < count;

            ctx.save();
            if (filled) {
                ctx.fillStyle = color;
                ctx.shadowColor = color;
                ctx.shadowBlur = 8;
            } else {
                ctx.fillStyle = 'rgba(255,255,255,0.2)';
            }

            UIRenderer._drawStarShape(ctx, starX, y, 5, size, size * 0.4);
            ctx.fill();
            ctx.restore();
        }
    }

    /**
     * 绘制星形路径
     */
    static _drawStarShape(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = -Math.PI / 2;
        const step = Math.PI / spikes;

        ctx.beginPath();
        for (let i = 0; i < spikes; i++) {
            let sx = cx + Math.cos(rot) * outerRadius;
            let sy = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(sx, sy);
            rot += step;

            sx = cx + Math.cos(rot) * innerRadius;
            sy = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(sx, sy);
            rot += step;
        }
        ctx.closePath();
    }

    /**
     * 绘制关卡选择卡片
     */
    static drawLevelCard(ctx, { index, x, y, w, h, themeColor, stars, locked, isHovered, name }) {
        ctx.save();

        const radius = 10;

        // 卡片背景
        if (locked) {
            ctx.fillStyle = 'rgba(255,255,255,0.05)';
        } else if (isHovered) {
            ctx.fillStyle = hexToRgba(themeColor, 0.3);
            ctx.shadowColor = themeColor;
            ctx.shadowBlur = 20;
        } else {
            ctx.fillStyle = hexToRgba(themeColor, 0.15);
        }

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

        // 边框
        ctx.shadowBlur = 0;
        ctx.strokeStyle = locked ? 'rgba(255,255,255,0.1)' : hexToRgba(themeColor, 0.5);
        ctx.lineWidth = locked ? 1 : 2;
        ctx.stroke();

        // 关卡编号
        ctx.font = locked ? 'bold 24px "Microsoft YaHei"' : 'bold 28px "Microsoft YaHei"';
        ctx.fillStyle = locked ? 'rgba(255,255,255,0.2)' : '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(locked ? '🔒' : `${index + 1}`, x + w / 2, y + h / 2 - 12);

        // 关卡名
        if (!locked && name) {
            ctx.font = '11px "Microsoft YaHei"';
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.fillText(name, x + w / 2, y + h / 2 + 8);
        }

        // 星星
        if (!locked && stars > 0) {
            UIRenderer.drawStars(ctx, stars, x + w / 2, y + h - 16, 7, themeColor);
        }

        ctx.restore();

        return { x, y, w, h };
    }

    /**
     * 绘制设置滑块
     */
    static drawSlider(ctx, { x, y, w, value, color, label, isActive }) {
        ctx.save();

        // 标签
        ctx.font = '14px "Microsoft YaHei"';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, x, y);

        // 滑块轨道
        const trackX = x + 120;
        const trackY = y - 4;
        const trackH = 8;

        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        roundRectPath(ctx, trackX, trackY, w, trackH, 4);
        ctx.fill();

        // 已填充部分
        ctx.fillStyle = color;
        roundRectPath(ctx, trackX, trackY, w * value, trackH, 4);
        ctx.fill();

        // 滑块手柄
        const knobX = trackX + w * value;
        const knobY = y;
        ctx.fillStyle = isActive ? '#ffffff' : 'rgba(255,255,255,0.9)';
        ctx.shadowColor = color;
        ctx.shadowBlur = isActive ? 10 : 5;
        ctx.beginPath();
        ctx.arc(knobX, knobY, 8, 0, Math.PI * 2);
        ctx.fill();

        // 数值
        ctx.shadowBlur = 0;
        ctx.font = '12px "Courier New"';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.textAlign = 'left';
        ctx.fillText(`${Math.round(value * 100)}%`, trackX + w + 15, y);

        ctx.restore();

        return { x: trackX, y: trackY - 6, w, h: 20 };
    }

    /**
     * 绘制虚拟摇杆
     */
    static drawVirtualJoystick(ctx, joystickInfo) {
        if (!joystickInfo) return;

        const { centerX, centerY, knobX, knobY, radius } = joystickInfo;

        ctx.save();

        // 外圈
        ctx.globalAlpha = 0.2;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

        // 内圈（摇杆位置）
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(knobX, knobY, 15, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * 绘制居中标题文字
     */
    static drawTitle(ctx, text, y, fontSize, color, alpha = 1) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = `bold ${fontSize}px "Microsoft YaHei"`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
        ctx.fillText(text, CANVAS_WIDTH / 2, y);
        ctx.restore();
    }

    /**
     * 绘制提示文字
     */
    static drawHint(ctx, text, y, color = 'rgba(255,255,255,0.5)') {
        ctx.save();
        ctx.font = '13px "Microsoft YaHei"';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, CANVAS_WIDTH / 2, y);
        ctx.restore();
    }

    /**
     * 绘制胜利结算面板
     */
    static drawVictoryPanel(ctx, { levelName, levelIndex, time, stars, parTime, themeColor }) {
        ctx.save();

        // 半透明背景
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // 面板
        const pw = 400, ph = 320;
        const px = (CANVAS_WIDTH - pw) / 2;
        const py = (CANVAS_HEIGHT - ph) / 2;

        ctx.fillStyle = 'rgba(20,20,40,0.95)';
        roundRectPath(ctx, px, py, pw, ph, 16);
        ctx.fill();

        ctx.strokeStyle = hexToRgba(themeColor, 0.5);
        ctx.lineWidth = 2;
        roundRectPath(ctx, px, py, pw, ph, 16);
        ctx.stroke();

        // 标题
        ctx.font = 'bold 28px "Microsoft YaHei"';
        ctx.fillStyle = themeColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = themeColor;
        ctx.shadowBlur = 15;
        ctx.fillText('关卡通过!', CANVAS_WIDTH / 2, py + 45);

        // 关卡名
        ctx.shadowBlur = 0;
        ctx.font = '15px "Microsoft YaHei"';
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillText(`第${levelIndex + 1}关 · ${levelName}`, CANVAS_WIDTH / 2, py + 80);

        // 星星
        UIRenderer.drawStars(ctx, stars, CANVAS_WIDTH / 2, py + 125, 18, themeColor);

        // 用时
        const minutes = Math.floor(time / 60);
        const seconds = (time % 60).toFixed(2);
        ctx.font = '16px "Microsoft YaHei"';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`用时: ${minutes > 0 ? minutes + '分' : ''}${seconds}秒`, CANVAS_WIDTH / 2, py + 170);

        // 标准时间
        ctx.font = '13px "Microsoft YaHei"';
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillText(`标准时间: ${parTime}秒`, CANVAS_WIDTH / 2, py + 195);

        ctx.restore();
    }
}
