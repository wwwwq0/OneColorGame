// =====================================================
// OneColorGame - 相机系统 (跟随 + 震动)
// =====================================================

import { CANVAS_WIDTH, CANVAS_HEIGHT, CAMERA_LERP_SPEED } from '../core/Config.js';

export class CameraSystem {
    constructor() {
        // 相机偏移
        this.x = 0;
        this.y = 0;

        // 目标位置
        this.targetX = 0;
        this.targetY = 0;

        // 屏幕震动
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeTimer = 0;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;

        // 世界尺寸（当前等于视口）
        this.worldWidth = CANVAS_WIDTH;
        this.worldHeight = CANVAS_HEIGHT;
    }

    /**
     * 平滑跟随目标实体
     * @param {{x: number, y: number, width: number, height: number}} entity
     * @param {number} dt - 秒
     */
    follow(entity, dt) {
        // 计算目标使实体居中
        this.targetX = entity.x + entity.width / 2 - CANVAS_WIDTH / 2;
        this.targetY = entity.y + entity.height / 2 - CANVAS_HEIGHT / 2;

        // 限制相机不超出世界范围
        this.targetX = Math.max(0, Math.min(this.targetX, this.worldWidth - CANVAS_WIDTH));
        this.targetY = Math.max(0, Math.min(this.targetY, this.worldHeight - CANVAS_HEIGHT));

        // 平滑插值
        const lerp = 1 - Math.exp(-CAMERA_LERP_SPEED * dt);
        this.x += (this.targetX - this.x) * lerp;
        this.y += (this.targetY - this.y) * lerp;
    }

    /**
     * 启动屏幕震动
     * @param {number} intensity - 震动强度（像素）
     * @param {number} duration - 持续时间（秒）
     */
    shake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
        this.shakeTimer = duration;
    }

    /**
     * 更新震动效果
     * @param {number} dt
     */
    update(dt) {
        if (this.shakeTimer > 0) {
            this.shakeTimer -= dt;

            // 衰减因子
            const decay = this.shakeTimer / this.shakeDuration;
            const currentIntensity = this.shakeIntensity * decay;

            // 随机偏移
            this.shakeOffsetX = (Math.random() * 2 - 1) * currentIntensity;
            this.shakeOffsetY = (Math.random() * 2 - 1) * currentIntensity;

            if (this.shakeTimer <= 0) {
                this.shakeTimer = 0;
                this.shakeOffsetX = 0;
                this.shakeOffsetY = 0;
            }
        }
    }

    /**
     * 应用相机变换到 Canvas 上下文
     * @param {CanvasRenderingContext2D} ctx
     */
    applyTransform(ctx) {
        ctx.save();
        ctx.translate(
            -this.x + this.shakeOffsetX,
            -this.y + this.shakeOffsetY
        );
    }

    /**
     * 恢复相机变换
     * @param {CanvasRenderingContext2D} ctx
     */
    resetTransform(ctx) {
        ctx.restore();
    }

    /**
     * 重置相机到默认位置
     */
    reset() {
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.shakeTimer = 0;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
    }

    /**
     * 设置世界尺寸
     */
    setWorldSize(w, h) {
        this.worldWidth = w;
        this.worldHeight = h;
    }
}
