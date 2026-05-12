// =====================================================
// OneColorGame - 关卡选择场景
// =====================================================

import { CANVAS_WIDTH, CANVAS_HEIGHT, EVENTS, STORAGE_KEYS } from '../core/Config.js';
import { UIRenderer } from '../rendering/UIRenderer.js';
import { LEVELS } from '../levels/LevelData.js';

export class LevelSelectScene {
    /**
     * @param {import('../core/Game.js').Game} game
     */
    constructor(game) {
        this.game = game;
        this.isOverlay = false;

        // 进度数据
        this.progress = this._loadProgress();

        // 关卡卡片布局: 2行 x 5列
        this.cardWidth = 120;
        this.cardHeight = 100;
        this.cardSpacingX = 16;
        this.cardSpacingY = 20;
        this.cols = 5;
        this.rows = 2;

        // 计算起始位置使整体居中
        const totalW = this.cols * this.cardWidth + (this.cols - 1) * this.cardSpacingX;
        const totalH = this.rows * this.cardHeight + (this.rows - 1) * this.cardSpacingY;
        this.startX = (CANVAS_WIDTH - totalW) / 2;
        this.startY = (CANVAS_HEIGHT - totalH) / 2 + 30;

        // 返回按钮
        this._backBtn = { x: 30, y: 540, w: 120, h: 40 };

        // 动画
        this._timer = 0;
        this._cardAnimOffsets = [];
        for (let i = 0; i < LEVELS.length; i++) {
            this._cardAnimOffsets.push({
                delay: i * 0.08,
                y: 30 // 初始下沉
            });
        }
    }

    _loadProgress() {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.PROGRESS);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) { /* ignore */ }
        return {
            unlockedLevel: 0, // 已解锁的最高关卡索引 (0-based)
            stars: new Array(LEVELS.length).fill(0),
            bestTimes: new Array(LEVELS.length).fill(0)
        };
    }

    enter() {
        this._timer = 0;
        this.progress = this._loadProgress();
        // 重置卡片动画
        for (let i = 0; i < this._cardAnimOffsets.length; i++) {
            this._cardAnimOffsets[i].y = 30;
        }
    }

    exit() {}

    update(dt) {
        this._timer += dt;

        // 卡片入场动画
        for (let i = 0; i < this._cardAnimOffsets.length; i++) {
            const anim = this._cardAnimOffsets[i];
            if (this._timer > anim.delay) {
                anim.y *= Math.exp(-10 * dt); // 指数衰减归零
                if (Math.abs(anim.y) < 0.5) anim.y = 0;
            }
        }
    }

    handleInput(inputManager) {
        const { game } = this;
        const im = inputManager;

        // 返回主菜单
        if (im.isClickInRect(this._backBtn.x, this._backBtn.y, this._backBtn.w, this._backBtn.h) ||
            im.isKeyJustPressed('Escape')) {
            im.consumeClick();
            game.eventBus.emit(EVENTS.PLAY_SOUND, 'click');

            const { MenuScene } = game._sceneClasses;
            game.transitionSystem.start('fade', 0.4, () => {
                game.sceneManager.replace(new MenuScene(game));
            });
            return;
        }

        // 点击关卡卡片
        for (let i = 0; i < LEVELS.length; i++) {
            const pos = this._getCardPosition(i);
            const locked = i > this.progress.unlockedLevel;

            if (!locked && im.isClickInRect(pos.x, pos.y, this.cardWidth, this.cardHeight)) {
                im.consumeClick();
                game.eventBus.emit(EVENTS.PLAY_SOUND, 'click');

                const { GameScene } = game._sceneClasses;
                game.transitionSystem.start('fade', 0.5, () => {
                    const scene = new GameScene(game);
                    game.sceneManager.replace(scene, { levelIndex: i });
                });
                return;
            }
        }
    }

    _getCardPosition(index) {
        const row = Math.floor(index / this.cols);
        const col = index % this.cols;
        return {
            x: this.startX + col * (this.cardWidth + this.cardSpacingX),
            y: this.startY + row * (this.cardHeight + this.cardSpacingY)
        };
    }

    render(renderer) {
        const ctx = renderer.getContext();

        // 背景
        renderer.clear('#0a0a1a');
        renderer.drawGrid(40, '#165DFF', 0.03);

        // 标题
        UIRenderer.drawTitle(ctx, '选择关卡', 60, 32, '#ffffff', 0.9);

        // 总星星数
        const totalStars = this.progress.stars.reduce((a, b) => a + b, 0);
        const maxStars = LEVELS.length * 3;
        ctx.save();
        ctx.font = '14px "Microsoft YaHei"';
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.textAlign = 'center';
        ctx.fillText(`已收集 ${totalStars} / ${maxStars} 颗星`, CANVAS_WIDTH / 2, 95);
        ctx.restore();

        // 关卡卡片
        const im = this.game.inputManager;
        for (let i = 0; i < LEVELS.length; i++) {
            const level = LEVELS[i];
            const pos = this._getCardPosition(i);
            const locked = i > this.progress.unlockedLevel;
            const animY = this._cardAnimOffsets[i]?.y || 0;

            UIRenderer.drawLevelCard(ctx, {
                index: i,
                x: pos.x,
                y: pos.y + animY,
                w: this.cardWidth,
                h: this.cardHeight,
                themeColor: level.theme.primary,
                stars: this.progress.stars[i] || 0,
                locked: locked,
                isHovered: !locked && im.isMouseInRect(pos.x, pos.y, this.cardWidth, this.cardHeight),
                name: level.name
            });
        }

        // 返回按钮
        UIRenderer.drawButton(ctx, {
            text: '← 返回',
            ...this._backBtn,
            color: 'rgba(100,100,120,0.8)',
            isHovered: im.isMouseInRect(this._backBtn.x, this._backBtn.y, this._backBtn.w, this._backBtn.h)
        });

        // 底部提示
        UIRenderer.drawHint(ctx, '点击关卡开始挑战 · 完成当前关卡解锁下一关', 520);
    }
}
