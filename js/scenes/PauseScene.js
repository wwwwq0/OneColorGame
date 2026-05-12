// =====================================================
// OneColorGame - 暂停场景 (叠加层)
// =====================================================

import { CANVAS_WIDTH, CANVAS_HEIGHT, EVENTS } from '../core/Config.js';
import { UIRenderer } from '../rendering/UIRenderer.js';

export class PauseScene {
    /**
     * @param {import('../core/Game.js').Game} game
     * @param {import('./GameScene.js').GameScene} gameScene - 底下的游戏场景
     */
    constructor(game, gameScene) {
        this.game = game;
        this.gameScene = gameScene;
        this.isOverlay = true; // 标记为覆盖层，底层场景仍渲染

        // 按钮
        this._resumeBtn = { x: 300, y: 240, w: 200, h: 45 };
        this._retryBtn = { x: 300, y: 300, w: 200, h: 45 };
        this._settingsBtn = { x: 300, y: 360, w: 200, h: 45 };
        this._menuBtn = { x: 300, y: 420, w: 200, h: 45 };

        // 动画
        this._fadeIn = 0;
    }

    enter() {
        this._fadeIn = 0;
    }

    exit() {}

    update(dt) {
        // 淡入动画
        if (this._fadeIn < 1) {
            this._fadeIn = Math.min(1, this._fadeIn + dt * 4);
        }
    }

    handleInput(inputManager) {
        const im = inputManager;
        const { game } = this;

        // ESC 或 点击继续 → 恢复游戏
        if (im.isKeyJustPressed('Escape') ||
            im.isClickInRect(this._resumeBtn.x, this._resumeBtn.y, this._resumeBtn.w, this._resumeBtn.h)) {
            im.consumeClick();
            game.eventBus.emit(EVENTS.PLAY_SOUND, 'click');
            game.sceneManager.pop();
            return;
        }

        // 重新开始 (按钮点击或 R 键)
        if (im.isClickInRect(this._retryBtn.x, this._retryBtn.y, this._retryBtn.w, this._retryBtn.h) ||
            im.isKeyJustPressed('r') || im.isKeyJustPressed('R')) {
            im.consumeClick();
            game.eventBus.emit(EVENTS.PLAY_SOUND, 'click');
            game.sceneManager.pop(); // 先弹出暂停
            game.transitionSystem.start('fade', 0.4, () => {
                const { GameScene } = game._sceneClasses;
                const retry = new GameScene(game);
                game.sceneManager.replace(retry, { levelIndex: this.gameScene.levelIndex });
            });
            return;
        }

        // 设置
        if (im.isClickInRect(this._settingsBtn.x, this._settingsBtn.y, this._settingsBtn.w, this._settingsBtn.h)) {
            im.consumeClick();
            game.eventBus.emit(EVENTS.PLAY_SOUND, 'click');
            const { SettingsScene } = game._sceneClasses;
            game.sceneManager.push(new SettingsScene(game));
            return;
        }

        // 返回主菜单
        if (im.isClickInRect(this._menuBtn.x, this._menuBtn.y, this._menuBtn.w, this._menuBtn.h)) {
            im.consumeClick();
            game.eventBus.emit(EVENTS.PLAY_SOUND, 'click');
            game.sceneManager.pop(); // 弹出暂停
            game.transitionSystem.start('fade', 0.5, () => {
                const { MenuScene } = game._sceneClasses;
                game.sceneManager.replace(new MenuScene(game));
            });
            return;
        }
    }

    render(renderer) {
        const ctx = renderer.getContext();
        const alpha = this._fadeIn;

        // 半透明黑色遮罩
        ctx.save();
        ctx.globalAlpha = 0.65 * alpha;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = alpha;

        // 标题
        UIRenderer.drawTitle(ctx, '暂停', 170, 36, '#ffffff', alpha);

        const im = this.game.inputManager;
        const themeColor = this.gameScene?.theme?.primary || '#165DFF';

        // 继续按钮
        UIRenderer.drawButton(ctx, {
            text: '继续游戏',
            ...this._resumeBtn,
            color: themeColor,
            isHovered: im.isMouseInRect(this._resumeBtn.x, this._resumeBtn.y, this._resumeBtn.w, this._resumeBtn.h)
        });

        // 重新开始
        UIRenderer.drawButton(ctx, {
            text: '重新开始',
            ...this._retryBtn,
            color: 'rgba(100,100,120,0.8)',
            isHovered: im.isMouseInRect(this._retryBtn.x, this._retryBtn.y, this._retryBtn.w, this._retryBtn.h)
        });

        // 设置
        UIRenderer.drawButton(ctx, {
            text: '设 置',
            ...this._settingsBtn,
            color: 'rgba(80,80,100,0.7)',
            isHovered: im.isMouseInRect(this._settingsBtn.x, this._settingsBtn.y, this._settingsBtn.w, this._settingsBtn.h)
        });

        // 返回主菜单
        UIRenderer.drawButton(ctx, {
            text: '返回主菜单',
            ...this._menuBtn,
            color: 'rgba(180,60,60,0.7)',
            isHovered: im.isMouseInRect(this._menuBtn.x, this._menuBtn.y, this._menuBtn.w, this._menuBtn.h)
        });

        // 提示
        UIRenderer.drawHint(ctx, 'ESC 继续 · R 重试', 500, `rgba(255,255,255,${0.4 * alpha})`);

        ctx.restore();
    }
}
