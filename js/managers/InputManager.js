// =====================================================
// OneColorGame - 输入管理器 (键盘 + 触摸 + 鼠标)
// =====================================================

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../core/Config.js';

export class InputManager {
    /**
     * @param {HTMLCanvasElement} canvas
     */
    constructor(canvas) {
        this.canvas = canvas;

        // 键盘状态
        this._keysDown = new Set();
        this._keysJustPressed = new Set();
        this._keysJustReleased = new Set();

        // 方向向量 (归一化, -1 到 1)
        this.direction = { x: 0, y: 0 };

        // 鼠标/触摸状态
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseDown = false;
        this.mouseJustClicked = false;
        this._mouseClickConsumed = false;

        // 触摸虚拟摇杆
        this.touchActive = false;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchCurrentX = 0;
        this.touchCurrentY = 0;
        this.touchDirection = { x: 0, y: 0 };
        this._joystickRadius = 60;

        // 画布缩放比
        this._scaleX = 1;
        this._scaleY = 1;

        this._bindEvents();
    }

    _bindEvents() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
                 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D',
                 'Escape', 'Enter', ' '].includes(e.key)) {
                e.preventDefault();
            }
            if (!this._keysDown.has(e.key)) {
                this._keysJustPressed.add(e.key);
            }
            this._keysDown.add(e.key);
        });

        document.addEventListener('keyup', (e) => {
            this._keysDown.delete(e.key);
            this._keysJustReleased.add(e.key);
        });

        // 鼠标事件
        this.canvas.addEventListener('mousemove', (e) => {
            this._updateMousePos(e.clientX, e.clientY);
        });

        this.canvas.addEventListener('mousedown', (e) => {
            this.mouseDown = true;
            this.mouseJustClicked = true;
            this._mouseClickConsumed = false;
            this._updateMousePos(e.clientX, e.clientY);
        });

        this.canvas.addEventListener('mouseup', () => {
            this.mouseDown = false;
        });

        // 触摸事件
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this._updateMousePos(touch.clientX, touch.clientY);
            this.mouseJustClicked = true;
            this._mouseClickConsumed = false;

            // 虚拟摇杆 - 左半屏触摸启动
            const canvasPos = this._getCanvasPos(touch.clientX, touch.clientY);
            if (canvasPos.x < CANVAS_WIDTH / 2) {
                this.touchActive = true;
                this.touchStartX = canvasPos.x;
                this.touchStartY = canvasPos.y;
                this.touchCurrentX = canvasPos.x;
                this.touchCurrentY = canvasPos.y;
            }
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this._updateMousePos(touch.clientX, touch.clientY);

            if (this.touchActive) {
                const canvasPos = this._getCanvasPos(touch.clientX, touch.clientY);
                this.touchCurrentX = canvasPos.x;
                this.touchCurrentY = canvasPos.y;

                // 计算摇杆方向
                const dx = this.touchCurrentX - this.touchStartX;
                const dy = this.touchCurrentY - this.touchStartY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > 10) {
                    const clampedDist = Math.min(dist, this._joystickRadius);
                    this.touchDirection.x = (dx / dist) * (clampedDist / this._joystickRadius);
                    this.touchDirection.y = (dy / dist) * (clampedDist / this._joystickRadius);
                } else {
                    this.touchDirection.x = 0;
                    this.touchDirection.y = 0;
                }
            }
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touchActive = false;
            this.touchDirection.x = 0;
            this.touchDirection.y = 0;
            this.mouseDown = false;
        }, { passive: false });

        // 窗口大小变化时更新缩放比
        this._updateScale();
        window.addEventListener('resize', () => this._updateScale());
    }

    _updateScale() {
        const rect = this.canvas.getBoundingClientRect();
        this._scaleX = CANVAS_WIDTH / rect.width;
        this._scaleY = CANVAS_HEIGHT / rect.height;
    }

    _updateMousePos(clientX, clientY) {
        const pos = this._getCanvasPos(clientX, clientY);
        this.mouseX = pos.x;
        this.mouseY = pos.y;
    }

    _getCanvasPos(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (clientX - rect.left) * this._scaleX,
            y: (clientY - rect.top) * this._scaleY
        };
    }

    /**
     * 每帧开始时更新方向向量
     */
    update() {
        // 从键盘计算方向
        let kx = 0, ky = 0;

        if (this._keysDown.has('ArrowLeft') || this._keysDown.has('a') || this._keysDown.has('A')) kx -= 1;
        if (this._keysDown.has('ArrowRight') || this._keysDown.has('d') || this._keysDown.has('D')) kx += 1;
        if (this._keysDown.has('ArrowUp') || this._keysDown.has('w') || this._keysDown.has('W')) ky -= 1;
        if (this._keysDown.has('ArrowDown') || this._keysDown.has('s') || this._keysDown.has('S')) ky += 1;

        // 归一化对角线移动
        if (kx !== 0 && ky !== 0) {
            const inv = 1 / Math.SQRT2;
            kx *= inv;
            ky *= inv;
        }

        // 合并触摸方向
        if (this.touchActive) {
            this.direction.x = this.touchDirection.x;
            this.direction.y = this.touchDirection.y;
        } else {
            this.direction.x = kx;
            this.direction.y = ky;
        }
    }

    /**
     * 获取归一化方向向量
     * @returns {{x: number, y: number}}
     */
    getDirection() {
        return this.direction;
    }

    /**
     * 检查某键是否在本帧刚被按下
     * @param {string} key
     * @returns {boolean}
     */
    isKeyJustPressed(key) {
        return this._keysJustPressed.has(key);
    }

    /**
     * 检查某键是否持续按住
     * @param {string} key
     * @returns {boolean}
     */
    isKeyDown(key) {
        return this._keysDown.has(key);
    }

    /**
     * 消费一次点击事件（防止多个 UI 元素响应同一次点击）
     * @returns {boolean} 是否有未消费的点击
     */
    consumeClick() {
        if (this.mouseJustClicked && !this._mouseClickConsumed) {
            this._mouseClickConsumed = true;
            return true;
        }
        return false;
    }

    /**
     * 检测矩形区域内的点击
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @returns {boolean}
     */
    isClickInRect(x, y, w, h) {
        if (!this.mouseJustClicked || this._mouseClickConsumed) return false;
        return this.mouseX >= x && this.mouseX <= x + w &&
               this.mouseY >= y && this.mouseY <= y + h;
    }

    /**
     * 检测鼠标是否在矩形区域内（用于 hover 效果）
     */
    isMouseInRect(x, y, w, h) {
        return this.mouseX >= x && this.mouseX <= x + w &&
               this.mouseY >= y && this.mouseY <= y + h;
    }

    /**
     * 每帧结束时清除单帧状态
     */
    endFrame() {
        this._keysJustPressed.clear();
        this._keysJustReleased.clear();
        this.mouseJustClicked = false;
        this._mouseClickConsumed = false;
    }

    /** 获取虚拟摇杆信息（用于渲染） */
    getJoystickInfo() {
        if (!this.touchActive) return null;
        return {
            centerX: this.touchStartX,
            centerY: this.touchStartY,
            knobX: this.touchCurrentX,
            knobY: this.touchCurrentY,
            radius: this._joystickRadius
        };
    }
}
