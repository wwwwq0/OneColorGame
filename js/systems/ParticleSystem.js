// =====================================================
// OneColorGame - 粒子系统 (对象池模式)
// =====================================================

import { PARTICLE_POOL_SIZE, PARTICLE_PRESETS } from '../core/Config.js';

export class ParticleSystem {
    constructor() {
        this.pool = [];
        this.activeCount = 0;
        this._enabled = true;

        // 预分配对象池
        for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
            this.pool.push({
                active: false,
                x: 0, y: 0,
                vx: 0, vy: 0,
                life: 0,
                maxLife: 0,
                size: 0,
                startSize: 0,
                color: '#ffffff',
                alpha: 1,
                sizeDecay: true,
                alphaDecay: true,
                gravity: 0,
                type: 'generic'
            });
        }
    }

    /** 启用/禁用粒子 */
    setEnabled(enabled) {
        this._enabled = enabled;
        if (!enabled) {
            this.clear();
        }
    }

    /**
     * 从对象池获取一个空闲粒子
     * @returns {Object|null}
     */
    _getParticle() {
        for (let i = 0; i < this.pool.length; i++) {
            if (!this.pool[i].active) {
                return this.pool[i];
            }
        }
        return null;
    }

    /**
     * 发射一组粒子
     * @param {string} presetName - 预设名称 (trail/death/victory/ambient/checkpoint)
     * @param {number} x - 发射位置 x
     * @param {number} y - 发射位置 y
     * @param {string} color - 粒子颜色
     * @param {Object} [overrides] - 覆盖预设参数
     */
    emit(presetName, x, y, color, overrides = {}) {
        if (!this._enabled) return;

        const preset = PARTICLE_PRESETS[presetName];
        if (!preset) return;

        const count = overrides.count || preset.count;

        for (let i = 0; i < count; i++) {
            const p = this._getParticle();
            if (!p) break; // 池满

            p.active = true;
            p.x = x + (Math.random() - 0.5) * 6;
            p.y = y + (Math.random() - 0.5) * 6;

            // 根据类型设置速度方向
            const angle = Math.random() * Math.PI * 2;
            const speed = (preset.speed || 50) * (0.5 + Math.random() * 0.5);

            if (presetName === 'trail') {
                // 拖尾粒子向后散开
                p.vx = (Math.random() - 0.5) * speed;
                p.vy = (Math.random() - 0.5) * speed;
            } else if (presetName === 'victory') {
                // 胜利粒子向上喷射
                p.vx = Math.cos(angle) * speed * 0.6;
                p.vy = -Math.abs(Math.sin(angle)) * speed;
            } else if (presetName === 'ambient') {
                // 环境粒子缓慢上升
                p.vx = (Math.random() - 0.5) * speed * 0.5;
                p.vy = -Math.random() * speed;
                p.x = Math.random() * 800;
                p.y = Math.random() * 600;
            } else {
                // 径向散射（死亡、检查点等）
                p.vx = Math.cos(angle) * speed;
                p.vy = Math.sin(angle) * speed;
            }

            p.life = preset.life * (0.8 + Math.random() * 0.4);
            p.maxLife = p.life;
            p.size = preset.size * (0.8 + Math.random() * 0.4);
            p.startSize = p.size;
            p.color = color;
            p.alpha = 1;
            p.sizeDecay = preset.sizeDecay !== false;
            p.alphaDecay = preset.alphaDecay !== false;
            p.gravity = preset.gravity || 0;
            p.type = presetName;

            this.activeCount++;
        }
    }

    /**
     * 发射单个自定义粒子
     */
    emitOne(x, y, vx, vy, life, size, color, gravity = 0) {
        if (!this._enabled) return;
        const p = this._getParticle();
        if (!p) return;

        p.active = true;
        p.x = x;
        p.y = y;
        p.vx = vx;
        p.vy = vy;
        p.life = life;
        p.maxLife = life;
        p.size = size;
        p.startSize = size;
        p.color = color;
        p.alpha = 1;
        p.sizeDecay = true;
        p.alphaDecay = true;
        p.gravity = gravity;
        p.type = 'custom';

        this.activeCount++;
    }

    /**
     * 更新所有活跃粒子
     * @param {number} dt - 秒
     */
    update(dt) {
        this.activeCount = 0;

        for (let i = 0; i < this.pool.length; i++) {
            const p = this.pool[i];
            if (!p.active) continue;

            // 生命衰减
            p.life -= dt;
            if (p.life <= 0) {
                p.active = false;
                continue;
            }

            // 位置更新
            p.x += p.vx * dt;
            p.y += p.vy * dt;

            // 重力
            if (p.gravity !== 0) {
                p.vy += p.gravity * dt;
            }

            // 速度衰减（轻微空气阻力）
            p.vx *= 0.99;
            p.vy *= 0.99;

            // 生命比例
            const lifeRatio = p.life / p.maxLife;

            // 透明度衰减
            if (p.alphaDecay) {
                p.alpha = lifeRatio;
            }

            // 尺寸衰减
            if (p.sizeDecay) {
                p.size = p.startSize * lifeRatio;
            }

            this.activeCount++;
        }
    }

    /**
     * 渲染所有活跃粒子
     * @param {CanvasRenderingContext2D} ctx
     */
    render(ctx) {
        for (let i = 0; i < this.pool.length; i++) {
            const p = this.pool[i];
            if (!p.active) continue;

            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillStyle = p.color;

            // 圆形粒子
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }

    /**
     * 渲染带发光效果的粒子
     */
    renderWithGlow(ctx) {
        ctx.save();

        // 添加发光混合模式
        ctx.globalCompositeOperation = 'lighter';

        for (let i = 0; i < this.pool.length; i++) {
            const p = this.pool[i];
            if (!p.active) continue;

            const alpha = Math.max(0, p.alpha);
            const size = Math.max(0.5, p.size);

            // 外发光
            ctx.globalAlpha = alpha * 0.3;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, size * 2, 0, Math.PI * 2);
            ctx.fill();

            // 内核
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    /** 清除所有粒子 */
    clear() {
        for (let i = 0; i < this.pool.length; i++) {
            this.pool[i].active = false;
        }
        this.activeCount = 0;
    }

    /** 获取活跃粒子数 */
    getActiveCount() {
        return this.activeCount;
    }
}
