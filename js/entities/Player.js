// =====================================================
// OneColorGame - 玩家实体
// =====================================================

import { Entity } from './Entity.js';
import {
    PLAYER_SIZE, PLAYER_ACCEL, PLAYER_FRICTION, PLAYER_MAX_SPEED,
    PLAYER_BORDER_WIDTH, PLAYER_TRAIL_INTERVAL, PLAYER_RESPAWN_DELAY,
    PLAYER_INVINCIBLE_TIME, CANVAS_WIDTH, CANVAS_HEIGHT,
    hexToRgba
} from '../core/Config.js';
import { applyAcceleration, applyFriction, clampToBounds } from '../systems/PhysicsSystem.js';

export class Player extends Entity {
    /**
     * @param {number} x - 起始位置 x
     * @param {number} y - 起始位置 y
     */
    constructor(x, y) {
        super(x, y, PLAYER_SIZE, PLAYER_SIZE);

        // 速度
        this.vx = 0;
        this.vy = 0;

        // 出生点/检查点位置
        this.spawnX = x;
        this.spawnY = y;

        // 状态
        this.isDead = false;
        this.deathTimer = 0;
        this.invincibleTimer = 0;
        this.isInvincible = false;

        // 拖尾粒子计时
        this.trailTimer = 0;

        // 动画
        this._breathTimer = 0;
        this._moveTimer = 0;
    }

    /**
     * 应用输入方向进行移动
     * @param {{x: number, y: number}} direction - 输入方向
     * @param {number} dt - 秒
     */
    applyInput(direction, dt) {
        if (this.isDead) return;

        const vel = { x: this.vx, y: this.vy };

        // 有输入时加速
        if (direction.x !== 0 || direction.y !== 0) {
            const newVel = applyAcceleration(vel, direction, PLAYER_ACCEL, PLAYER_MAX_SPEED, dt);
            this.vx = newVel.x;
            this.vy = newVel.y;
        }

        // 始终应用摩擦
        const frictionVel = applyFriction({ x: this.vx, y: this.vy }, PLAYER_FRICTION, dt);
        this.vx = frictionVel.x;
        this.vy = frictionVel.y;

        // 更新位置
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // 边界限制
        const clamped = clampToBounds(
            { x: this.x, y: this.y },
            this.width, this.height,
            CANVAS_WIDTH, CANVAS_HEIGHT
        );
        this.x = clamped.x;
        this.y = clamped.y;

        // 碰到边界时清零对应速度
        if (clamped.hitX) this.vx = 0;
        if (clamped.hitY) this.vy = 0;
    }

    /**
     * 每帧更新
     * @param {number} dt
     */
    update(dt) {
        // 死亡计时
        if (this.isDead) {
            this.deathTimer -= dt;
            if (this.deathTimer <= 0) {
                this.respawn();
            }
            return;
        }

        // 无敌计时
        if (this.isInvincible) {
            this.invincibleTimer -= dt;
            if (this.invincibleTimer <= 0) {
                this.isInvincible = false;
                this.invincibleTimer = 0;
            }
        }

        // 拖尾粒子计时
        this.trailTimer -= dt;

        // 呼吸动画
        this._breathTimer += dt;

        // 移动动画
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 10) {
            this._moveTimer += dt * speed * 0.01;
        }
    }

    /**
     * 检查是否应该发射拖尾粒子
     * @returns {boolean}
     */
    shouldEmitTrail() {
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 30 && this.trailTimer <= 0 && !this.isDead) {
            this.trailTimer = PLAYER_TRAIL_INTERVAL;
            return true;
        }
        return false;
    }

    /**
     * 玩家死亡
     */
    die() {
        if (this.isDead || this.isInvincible) return false;
        this.isDead = true;
        this.deathTimer = PLAYER_RESPAWN_DELAY;
        this.vx = 0;
        this.vy = 0;
        return true;
    }

    /**
     * 重生到检查点/出生点
     */
    respawn() {
        this.x = this.spawnX;
        this.y = this.spawnY;
        this.vx = 0;
        this.vy = 0;
        this.isDead = false;
        this.deathTimer = 0;
        this.isInvincible = true;
        this.invincibleTimer = PLAYER_INVINCIBLE_TIME;
    }

    /**
     * 设置检查点（更新重生位置）
     */
    setCheckpoint(x, y) {
        this.spawnX = x;
        this.spawnY = y;
    }

    /**
     * 渲染玩家
     * @param {CanvasRenderingContext2D} ctx
     * @param {Object} theme
     */
    render(ctx, theme) {
        if (this.isDead) return;

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        // 无敌时闪烁
        if (this.isInvincible) {
            const flash = Math.sin(this.invincibleTimer * 20) > 0;
            if (!flash) return;
        }

        ctx.save();

        // 呼吸效果 - 微弱缩放脉冲
        const breathScale = 1 + Math.sin(this._breathTimer * 3) * 0.03;
        ctx.translate(cx, cy);
        ctx.scale(breathScale, breathScale);
        ctx.translate(-cx, -cy);

        // 移动时的轻微倾斜
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 50) {
            const tiltAngle = Math.sin(this._moveTimer) * 0.05;
            ctx.translate(cx, cy);
            ctx.rotate(tiltAngle);
            ctx.translate(-cx, -cy);
        }

        // 外发光
        ctx.shadowColor = theme.primary;
        ctx.shadowBlur = 12;

        // 填充主体
        ctx.fillStyle = theme.primary;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // 白色边框
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = PLAYER_BORDER_WIDTH;
        ctx.strokeRect(
            this.x + PLAYER_BORDER_WIDTH / 2,
            this.y + PLAYER_BORDER_WIDTH / 2,
            this.width - PLAYER_BORDER_WIDTH,
            this.height - PLAYER_BORDER_WIDTH
        );

        // 内部小菱形装饰
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.4;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(Math.PI / 4);
        const innerSize = this.width * 0.2;
        ctx.fillRect(-innerSize / 2, -innerSize / 2, innerSize, innerSize);
        ctx.restore();

        ctx.restore();
    }

    /**
     * 获取当前速度大小
     */
    getSpeed() {
        return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    }

    /**
     * 重置到初始状态
     */
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.spawnX = x;
        this.spawnY = y;
        this.vx = 0;
        this.vy = 0;
        this.isDead = false;
        this.deathTimer = 0;
        this.isInvincible = false;
        this.invincibleTimer = 0;
        this.trailTimer = 0;
        this._breathTimer = 0;
        this._moveTimer = 0;
    }
}
