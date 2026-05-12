// =====================================================
// OneColorGame - 实体基类
// =====================================================

export class Entity {
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     * @param {string} [color='#ffffff']
     */
    constructor(x, y, width, height, color = '#ffffff') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.alpha = 1;
        this.active = true;
    }

    /**
     * 获取碰撞包围盒
     * @returns {{x: number, y: number, w: number, h: number}}
     */
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            w: this.width,
            h: this.height
        };
    }

    /**
     * 获取中心点
     * @returns {{x: number, y: number}}
     */
    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }

    /**
     * 每帧更新 (子类覆盖)
     * @param {number} dt
     */
    update(dt) {
        // 默认空实现
    }

    /**
     * 渲染 (子类覆盖)
     * @param {CanvasRenderingContext2D} ctx
     * @param {Object} theme - 当前颜色主题
     */
    render(ctx, theme) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }
}
