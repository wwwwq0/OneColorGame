// =====================================================
// OneColorGame - 主菜单场景
// =====================================================

import { CANVAS_WIDTH, CANVAS_HEIGHT, EVENTS } from '../core/Config.js';
import { UIRenderer } from '../rendering/UIRenderer.js';

export class MenuScene {
    /**
     * @param {import('../core/Game.js').Game} game
     */
    constructor(game) {
        this.game = game;
        this.isOverlay = false;

        // 动画计时器
        this._timer = 0;
        this._titleScale = 1;

        // 按钮区域
        this._startBtn = { x: 300, y: 320, w: 200, h: 50 };
        this._settingsBtn = { x: 300, y: 390, w: 200, h: 50 };

        // 背景粒子
        this._ambientTimer = 0;

        // 动画颜色
        this._colors = ['#165DFF', '#00B2A9', '#00A854', '#7B61FF', '#FF7D00', '#F53F3F', '#D91AD9', '#FAAD14'];
        this._colorIndex = 0;
        this._colorTimer = 0;
        this._currentColor = '#165DFF';
    }

    enter() {
        this._timer = 0;
        this._colorIndex = 0;
        this._currentColor = this._colors[0];
    }

    exit() {}

    update(dt) {
        this._timer += dt;

        // 标题呼吸动画
        this._titleScale = 1 + Math.sin(this._timer * 2) * 0.05;

        // 颜色循环
        this._colorTimer += dt;
        if (this._colorTimer > 3) {
            this._colorTimer = 0;
            this._colorIndex = (this._colorIndex + 1) % this._colors.length;
            this._currentColor = this._colors[this._colorIndex];
        }

        // 发射环境粒子
        this._ambientTimer += dt;
        if (this._ambientTimer > 0.3) {
            this._ambientTimer = 0;
            this.game.particleSystem.emit('ambient', 0, 0, this._currentColor);
        }

        // 更新粒子
        this.game.particleSystem.update(dt);
    }

    handleInput(inputManager) {
        const { game } = this;
        const im = inputManager;

        // 开始游戏
        if (im.isClickInRect(this._startBtn.x, this._startBtn.y, this._startBtn.w, this._startBtn.h)) {
            im.consumeClick();
            game.eventBus.emit(EVENTS.PLAY_SOUND, 'click');
            game.audioManager.init();

            const { LevelSelectScene } = game._sceneClasses;
            game.transitionSystem.start('fade', 0.5, () => {
                game.sceneManager.replace(new LevelSelectScene(game));
            });
            return;
        }

        // 设置
        if (im.isClickInRect(this._settingsBtn.x, this._settingsBtn.y, this._settingsBtn.w, this._settingsBtn.h)) {
            im.consumeClick();
            game.eventBus.emit(EVENTS.PLAY_SOUND, 'click');
            game.audioManager.init();

            const { SettingsScene } = game._sceneClasses;
            game.sceneManager.push(new SettingsScene(game));
            return;
        }

        // 任意键也可以开始
        if (im.isKeyJustPressed('Enter') || im.isKeyJustPressed(' ')) {
            game.eventBus.emit(EVENTS.PLAY_SOUND, 'click');
            game.audioManager.init();

            const { LevelSelectScene } = game._sceneClasses;
            game.transitionSystem.start('fade', 0.5, () => {
                game.sceneManager.replace(new LevelSelectScene(game));
            });
        }
    }

    render(renderer) {
        const ctx = renderer.getContext();
        const color = this._currentColor;

        // 背景
        renderer.clear('#0a0a1a');

        // 网格背景
        renderer.drawGrid(40, color, 0.05);

        // 粒子
        this.game.particleSystem.renderWithGlow(ctx);

        // 标题
        ctx.save();
        ctx.translate(CANVAS_WIDTH / 2, 180);
        ctx.scale(this._titleScale, this._titleScale);
        ctx.translate(-CANVAS_WIDTH / 2, -180);

        ctx.font = 'bold 48px "Microsoft YaHei"';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = color;
        ctx.shadowBlur = 30;
        ctx.fillText('单色闯关', CANVAS_WIDTH / 2, 170);

        // 副标题
        ctx.shadowBlur = 0;
        ctx.font = '16px "Microsoft YaHei"';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText('OneColorGame', CANVAS_WIDTH / 2, 220);

        ctx.restore();

        // 版本号
        ctx.save();
        ctx.font = '11px "Microsoft YaHei"';
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.textAlign = 'center';
        ctx.fillText('V2.0', CANVAS_WIDTH / 2, 250);
        ctx.restore();

        // 按钮
        const im = this.game.inputManager;
        UIRenderer.drawButton(ctx, {
            text: '开始游戏',
            ...this._startBtn,
            color: color,
            isHovered: im.isMouseInRect(this._startBtn.x, this._startBtn.y, this._startBtn.w, this._startBtn.h)
        });

        UIRenderer.drawButton(ctx, {
            text: '设 置',
            ...this._settingsBtn,
            color: 'rgba(100,100,120,0.8)',
            isHovered: im.isMouseInRect(this._settingsBtn.x, this._settingsBtn.y, this._settingsBtn.w, this._settingsBtn.h)
        });

        // 底部提示
        const hintAlpha = 0.3 + Math.sin(this._timer * 3) * 0.1;
        ctx.save();
        ctx.globalAlpha = hintAlpha;
        ctx.font = '13px "Microsoft YaHei"';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('按 Enter 或 点击开始', CANVAS_WIDTH / 2, 480);
        ctx.font = '12px "Microsoft YaHei"';
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillText('方向键/WASD移动 · ESC暂停 · 支持触屏', CANVAS_WIDTH / 2, 510);
        ctx.restore();
    }
}
