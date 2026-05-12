// =====================================================
// OneColorGame - 事件总线 (发布/订阅模式)
// =====================================================

export class EventBus {
    constructor() {
        this._listeners = new Map();
    }

    /**
     * 注册事件监听
     * @param {string} event - 事件名
     * @param {Function} callback - 回调函数
     * @param {Object} [context] - 回调的 this 上下文
     * @returns {Function} 取消订阅函数
     */
    on(event, callback, context = null) {
        if (!this._listeners.has(event)) {
            this._listeners.set(event, new Set());
        }
        const entry = { callback, context };
        this._listeners.get(event).add(entry);

        // 返回取消订阅函数
        return () => {
            this._listeners.get(event)?.delete(entry);
        };
    }

    /**
     * 注册一次性事件监听
     * @param {string} event
     * @param {Function} callback
     * @param {Object} [context]
     */
    once(event, callback, context = null) {
        const unsubscribe = this.on(event, (...args) => {
            unsubscribe();
            callback.apply(context, args);
        }, context);
        return unsubscribe;
    }

    /**
     * 移除指定事件的指定回调
     * @param {string} event
     * @param {Function} callback
     */
    off(event, callback) {
        const listeners = this._listeners.get(event);
        if (!listeners) return;

        for (const entry of listeners) {
            if (entry.callback === callback) {
                listeners.delete(entry);
                break;
            }
        }
    }

    /**
     * 触发事件
     * @param {string} event - 事件名
     * @param {...*} args - 传递给回调的参数
     */
    emit(event, ...args) {
        const listeners = this._listeners.get(event);
        if (!listeners) return;

        for (const entry of listeners) {
            try {
                if (entry.context) {
                    entry.callback.apply(entry.context, args);
                } else {
                    entry.callback(...args);
                }
            } catch (err) {
                console.error(`EventBus error in "${event}":`, err);
            }
        }
    }

    /**
     * 清除某个事件的所有监听，或清除全部
     * @param {string} [event]
     */
    clear(event) {
        if (event) {
            this._listeners.delete(event);
        } else {
            this._listeners.clear();
        }
    }
}
