// =====================================================
// OneColorGame - 障碍物实体 (静态/移动/旋转)
// =====================================================

import { Entity } from './Entity.js';
import { hexToRgba } from '../core/Config.js';

/**
 * 障碍物类型枚举
 */
export const ObstacleType = {
    STATIC: 'static',
    MOVING_H: 'movingH',
    MOVING_V: 'movingV',
    ROTATING: 'rotating'
};

export class Obstacle extends Entity {
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @param {Object} config - 障碍物配置
     */
    constructor(x, y, w, h, config = {}) {
        super(x, y, w, h);

        this.type = config.type || ObstacleType.STATIC;
        this.alpha = config.alpha || 0.3;

        // 移动参数
        this.originX = x;
        this.originY = y;
        this.speed = config.speed || 80;
        this.range = config.range || 100;
        this._moveTimer = config.moveOffset || 0; // 初始偏移，避免同步
        this._moveDirection = 1;

        // 旋转参数
        this.angle = config.angle || 0;
        this.rotationSpeed = config.rotationSpeed || 1.5; // 弧度/秒
        this.cx = x + w / 2; // 旋转中心
        this.cy = y + h / 2;

        // 视觉效果
        this._pulseTimer = Math.random() * Math.PI * 2;
    }

    /**
     * 每帧更新
     * @param {number} dt
     */
    update(dt) {
        this._pulseTimer += dt;

        switch (this.type) {
            case ObstacleType.MOVING_H:
                this._updateMovingH(dt);
                break;
            case ObstacleType.MOVING_V:
                this._updateMovingV(dt);
                break;
            case ObstacleType.ROTATING:
                this._updateRotating(dt);
                break;
            default:
                break;
        }
    }

    _updateMovingH(dt) {
        this._moveTimer += dt;
        // 使用正弦运动实现平滑往返
        this.x = this.originX + Math.sin(this._moveTimer * this.speed * 0.02) * this.range;
    }

    _updateMovingV(dt) {
        this._moveTimer += dt;
        this.y = this.originY + Math.sin(this._moveTimer * this.speed * 0.02) * this.range;
    }

    _updateRotating(dt) {
        this.angle += this.rotationSpeed * dt;
        if (this.angle > Math.PI * 2) {
            this.angle -= Math.PI * 2;
        }
    }

    /**
     * 获取碰撞包围盒
     * 旋转类型返回 AABB 近似包围盒
     */
    getBounds() {
        if (this.type === ObstacleType.ROTATING) {
            // 旋转矩形的 AABB 包围盒
            const cos = Math.abs(Math.cos(this.angle));
            const sin = Math.abs(Math.sin(this.angle));
            const aabbW = this.width * cos + this.height * sin;
            const aabbH = this.width * sin + this.height * cos;
            return {
                x: this.cx - aabbW / 2,
                y: this.cy - aabbH / 2,
                w: aabbW,
                h: aabbH
            };
        }
        return {
            x: this.x,
            y: this.y,
            w: this.width,
            h: this.height
        };
    }

    /**
     * 获取旋转碰撞信息（用于精确SAT检测）
     */
    getRotatedBounds() {
        if (this.type !== ObstacleType.ROTATING) return null;
        return {
            cx: this.cx,
            cy: this.cy,
            w: this.width,
            h: this.height,
            angle: this.angle
        };
    }

    /**
     * 渲染障碍物
     * @param {CanvasRenderingContext2D} ctx
     * @param {Object} theme
     */
    render(ctx, theme) {
        const dangerColor = theme.danger || theme.primary;

        // 微弱脉冲效果
        const pulse = 1 + Math.sin(this._pulseTimer * 2) * 0.05;
        const alpha = this.alpha * pulse;

        ctx.save();

        if (this.type === ObstacleType.ROTATING) {
            // 旋转渲染
            ctx.translate(this.cx, this.cy);
            ctx.rotate(this.angle);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = dangerColor;
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

            // 边框
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 1;
            ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

            // 旋转指示线
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(this.width / 2, 0);
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 1;
            ctx.stroke();
        } else {
            // 非旋转渲染
            ctx.globalAlpha = alpha;
            ctx.fillStyle = dangerColor;
            ctx.fillRect(this.x, this.y, this.width, this.height);

            // 边框高亮
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x, this.y, this.width, this.height);

            // 移动类型添加方向指示
            if (this.type === ObstacleType.MOVING_H || this.type === ObstacleType.MOVING_V) {
                this._drawMovementIndicator(ctx);
            }
        }

        ctx.restore();
    }

    /**
     * 绘制移动方向指示器
     */
    _drawMovementIndicator(ctx) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const indicatorSize = 4;

        ctx.fillStyle = 'rgba(255,255,255,0.3)';

        if (this.type === ObstacleType.MOVING_H) {
            // 水平箭头
            ctx.beginPath();
            ctx.moveTo(centerX - indicatorSize * 2, centerY);
            ctx.lineTo(centerX - indicatorSize, centerY - indicatorSize);
            ctx.lineTo(centerX - indicatorSize, centerY + indicatorSize);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(centerX + indicatorSize * 2, centerY);
            ctx.lineTo(centerX + indicatorSize, centerY - indicatorSize);
            ctx.lineTo(centerX + indicatorSize, centerY + indicatorSize);
            ctx.fill();
        } else {
            // 垂直箭头
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - indicatorSize * 2);
            ctx.lineTo(centerX - indicatorSize, centerY - indicatorSize);
            ctx.lineTo(centerX + indicatorSize, centerY - indicatorSize);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(centerX, centerY + indicatorSize * 2);
            ctx.lineTo(centerX - indicatorSize, centerY + indicatorSize);
            ctx.lineTo(centerX + indicatorSize, centerY + indicatorSize);
            ctx.fill();
        }
    }
}
