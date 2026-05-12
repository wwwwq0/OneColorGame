// =====================================================
// OneColorGame - 场景管理器 (场景栈)
// =====================================================

export class SceneManager {
    /**
     * @param {import('../core/Game.js').Game} game
     */
    constructor(game) {
        this.game = game;
        this._stack = [];
    }

    /** 获取当前栈顶场景 */
    get currentScene() {
        return this._stack.length > 0 ? this._stack[this._stack.length - 1] : null;
    }

    /** 获取场景栈深度 */
    get depth() {
        return this._stack.length;
    }

    /**
     * 推入新场景（不移除当前场景，用于叠加如暂停）
     * @param {Object} scene - 场景对象
     * @param {Object} [params] - 传递给 enter 的参数
     */
    push(scene, params = {}) {
        const current = this.currentScene;
        if (current && current.onPause) {
            current.onPause();
        }
        this._stack.push(scene);
        if (scene.enter) {
            scene.enter(params);
        }
    }

    /**
     * 弹出栈顶场景
     * @returns {Object|null} 被弹出的场景
     */
    pop() {
        const removed = this._stack.pop();
        if (removed && removed.exit) {
            removed.exit();
        }
        const current = this.currentScene;
        if (current && current.onResume) {
            current.onResume();
        }
        return removed;
    }

    /**
     * 替换栈顶场景
     * @param {Object} scene
     * @param {Object} [params]
     */
    replace(scene, params = {}) {
        const removed = this._stack.pop();
        if (removed && removed.exit) {
            removed.exit();
        }
        this._stack.push(scene);
        if (scene.enter) {
            scene.enter(params);
        }
    }

    /**
     * 清空场景栈并推入新场景
     * @param {Object} scene
     * @param {Object} [params]
     */
    reset(scene, params = {}) {
        while (this._stack.length > 0) {
            const removed = this._stack.pop();
            if (removed && removed.exit) {
                removed.exit();
            }
        }
        this._stack.push(scene);
        if (scene.enter) {
            scene.enter(params);
        }
    }

    /**
     * 更新当前场景（仅栈顶）
     * @param {number} dt - 秒
     */
    update(dt) {
        const scene = this.currentScene;
        if (scene && scene.update) {
            scene.update(dt);
        }
    }

    /**
     * 渲染场景 - 从栈底到栈顶依次渲染
     * 允许暂停场景叠加在游戏场景之上
     * @param {import('../rendering/Renderer.js').Renderer} renderer
     */
    render(renderer) {
        // 找到最底层需要渲染的不透明场景
        let startIndex = 0;
        for (let i = this._stack.length - 1; i >= 0; i--) {
            if (!this._stack[i].isOverlay) {
                startIndex = i;
                break;
            }
        }
        // 从该层开始往上渲染
        for (let i = startIndex; i < this._stack.length; i++) {
            const scene = this._stack[i];
            if (scene && scene.render) {
                scene.render(renderer);
            }
        }
    }

    /**
     * 向栈顶场景传递输入
     * @param {import('../managers/InputManager.js').InputManager} inputManager
     */
    handleInput(inputManager) {
        const scene = this.currentScene;
        if (scene && scene.handleInput) {
            scene.handleInput(inputManager);
        }
    }
}
