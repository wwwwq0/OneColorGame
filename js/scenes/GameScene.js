// =====================================================
// OneColorGame - 核心游戏场景
// =====================================================

import {
    CANVAS_WIDTH, CANVAS_HEIGHT, EVENTS,
    STAR_THRESHOLDS, STORAGE_KEYS, PLAYER_SIZE,
    CAMERA_SHAKE_DEFAULT_INTENSITY, CAMERA_SHAKE_DEFAULT_DURATION,
    hexToRgba
} from '../core/Config.js';
import { rectIntersect, rectIntersectRotated } from '../systems/PhysicsSystem.js';
import { LevelLoader } from '../levels/LevelLoader.js';
import { getLevelData, getLevelCount } from '../levels/LevelData.js';
import { UIRenderer } from '../rendering/UIRenderer.js';
import { ObstacleType } from '../entities/Obstacle.js';

export class GameScene {
    /**
     * @param {import('../core/Game.js').Game} game
     */
    constructor(game) {
        this.game = game;
        this.isOverlay = false;

        // 关卡数据
        this.levelIndex = 0;
        this.levelData = null;
        this.theme = null;

        // 游戏实体
        this.player = null;
        this.obstacles = [];
        this.safeZones = [];
        this.goal = null;
        this.checkpoints = [];

        // 状态
        this.timer = 0;
        this.deathCount = 0;
        this.isPlaying = false;
        this.isVictory = false;
        this.victoryStars = 0;

        // 胜利面板按钮
        this._nextBtn = { x: 220, y: 430, w: 160, h: 45 };
        this._retryBtn = { x: 420, y: 430, w: 160, h: 45 };
        this._backBtn = { x: 320, y: 490, w: 160, h: 40 };

        // 环境粒子
        this._ambientTimer = 0;

        // 倒计时动画
        this._startCountdown = 0;
        this._countdownPhase = 0;
    }

    /**
     * 进入场景
     * @param {Object} params - { levelIndex }
     */
    enter(params = {}) {
        this.levelIndex = params.levelIndex || 0;
        this.levelData = getLevelData(this.levelIndex);

        if (!this.levelData) {
            console.error('Invalid level index:', this.levelIndex);
            return;
        }

        // 加载关卡
        const loaded = LevelLoader.load(this.levelData);
        this.player = loaded.player;
        this.obstacles = loaded.obstacles;
        this.safeZones = loaded.safeZones;
        this.goal = loaded.goal;
        this.checkpoints = loaded.checkpoints;
        this.theme = loaded.theme;

        // 重置状态
        this.timer = 0;
        this.deathCount = 0;
        this.isPlaying = true;
        this.isVictory = false;
        this.victoryStars = 0;

        // 重置相机
        this.game.cameraSystem.reset();

        // 清除粒子
        this.game.particleSystem.clear();

        // 小延迟后开始
        this._startCountdown = 0.5;
        this._countdownPhase = 0;
        this.isPlaying = false;
    }

    exit() {
        this.game.particleSystem.clear();
    }

    /**
     * 每帧更新
     * @param {number} dt
     */
    update(dt) {
        // 开局倒计时
        if (this._startCountdown > 0) {
            this._startCountdown -= dt;
            if (this._startCountdown <= 0) {
                this.isPlaying = true;
            }
            this.game.particleSystem.update(dt);
            return;
        }

        // 胜利状态只更新粒子和动画
        if (this.isVictory) {
            this.game.particleSystem.update(dt);
            if (this.goal) this.goal.update(dt);
            return;
        }

        if (!this.isPlaying) return;

        // 计时
        this.timer += dt;

        // 玩家更新
        if (this.player && !this.player.isDead) {
            const dir = this.game.inputManager.getDirection();
            this.player.applyInput(dir, dt);
        }
        if (this.player) this.player.update(dt);

        // 障碍物更新
        for (const obs of this.obstacles) {
            obs.update(dt);
        }

        // 终点更新
        if (this.goal) this.goal.update(dt);

        // 检查点更新
        for (const cp of this.checkpoints) {
            cp.update(dt);
        }

        // 碰撞检测
        if (this.player && !this.player.isDead && !this.player.isInvincible) {
            this._checkCollisions();
        }

        // 检查点检测
        if (this.player && !this.player.isDead) {
            this._checkCheckpoints();
        }

        // 终点检测
        if (this.player && !this.player.isDead && this.goal) {
            this._checkGoal();
        }

        // 拖尾粒子
        if (this.player && this.player.shouldEmitTrail()) {
            const center = this.player.getCenter();
            this.game.particleSystem.emit('trail', center.x, center.y, this.theme.particle);
        }

        // 环境粒子
        this._ambientTimer += dt;
        if (this._ambientTimer > 1.5) {
            this._ambientTimer = 0;
            this.game.particleSystem.emit('ambient', 0, 0, this.theme.particle);
        }

        // 更新系统
        this.game.particleSystem.update(dt);
        this.game.cameraSystem.update(dt);

        // 相机跟随（当前世界等于视口，跟随效果为零，但震动仍生效）
        if (this.player) {
            this.game.cameraSystem.follow(this.player, dt);
        }
    }

    /**
     * 碰撞检测
     */
    _checkCollisions() {
        const playerBounds = this.player.getBounds();

        for (const obs of this.obstacles) {
            let collided = false;

            if (obs.type === ObstacleType.ROTATING) {
                // 旋转障碍使用 SAT 碰撞
                const rotated = obs.getRotatedBounds();
                if (rotated) {
                    collided = rectIntersectRotated(playerBounds, rotated);
                }
            } else {
                // 标准 AABB 碰撞
                collided = rectIntersect(playerBounds, obs.getBounds());
            }

            if (collided) {
                // 检查是否在安全区域内（安全区覆盖危险区）
                if (this._isInSafeZone(playerBounds)) {
                    continue;
                }
                this._onPlayerDeath();
                return;
            }
        }
    }

    /**
     * 检查玩家是否在安全区域内
     */
    _isInSafeZone(playerBounds) {
        // 检测玩家中心点是否在安全区内
        const cx = playerBounds.x + playerBounds.w / 2;
        const cy = playerBounds.y + playerBounds.h / 2;

        for (const safe of this.safeZones) {
            const sb = safe.getBounds();
            if (cx >= sb.x && cx <= sb.x + sb.w && cy >= sb.y && cy <= sb.y + sb.h) {
                return true;
            }
        }
        return false;
    }

    /**
     * 检查点检测
     */
    _checkCheckpoints() {
        const playerBounds = this.player.getBounds();

        for (const cp of this.checkpoints) {
            if (cp.activated) continue;

            if (rectIntersect(playerBounds, cp.getBounds())) {
                if (cp.activate()) {
                    // 首次激活
                    this.player.setCheckpoint(cp.centerX - PLAYER_SIZE / 2, cp.centerY - PLAYER_SIZE / 2);
                    this.game.eventBus.emit(EVENTS.PLAY_SOUND, 'checkpoint');
                    this.game.particleSystem.emit('checkpoint', cp.centerX, cp.centerY, this.theme.particle);
                }
            }
        }
    }

    /**
     * 终点检测
     */
    _checkGoal() {
        const playerBounds = this.player.getBounds();
        const goalBounds = this.goal.getBounds();

        if (rectIntersect(playerBounds, goalBounds)) {
            this._onVictory();
        }
    }

    /**
     * 玩家死亡处理
     */
    _onPlayerDeath() {
        if (!this.player.die()) return; // 如果无敌则忽略

        this.deathCount++;

        // 粒子爆炸
        const center = this.player.getCenter();
        this.game.particleSystem.emit('death', center.x, center.y, this.theme.particle);

        // 相机震动
        this.game.cameraSystem.shake(
            CAMERA_SHAKE_DEFAULT_INTENSITY,
            CAMERA_SHAKE_DEFAULT_DURATION
        );

        // 音效
        this.game.eventBus.emit(EVENTS.PLAY_SOUND, 'death');
    }

    /**
     * 通关处理
     */
    _onVictory() {
        this.isVictory = true;
        this.isPlaying = false;

        // 计算星级
        const parTime = this.levelData.parTime;
        const ratio = this.timer / parTime;

        if (ratio <= STAR_THRESHOLDS.three) {
            this.victoryStars = 3;
        } else if (ratio <= STAR_THRESHOLDS.two) {
            this.victoryStars = 2;
        } else {
            this.victoryStars = 1;
        }

        // 胜利粒子
        const goalCenter = this.goal.getCenter();
        this.game.particleSystem.emit('victory', goalCenter.x, goalCenter.y, this.theme.particle);

        // 音效
        this.game.eventBus.emit(EVENTS.PLAY_SOUND, 'win');

        // 保存进度
        this._saveProgress();
    }

    /**
     * 保存进度到 localStorage
     */
    _saveProgress() {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.PROGRESS);
            const progress = stored ? JSON.parse(stored) : {
                unlockedLevel: 0,
                stars: new Array(getLevelCount()).fill(0),
                bestTimes: new Array(getLevelCount()).fill(0)
            };

            // 更新星星（取最好成绩）
            if (this.victoryStars > (progress.stars[this.levelIndex] || 0)) {
                progress.stars[this.levelIndex] = this.victoryStars;
            }

            // 更新最佳时间
            const prevBest = progress.bestTimes[this.levelIndex] || 0;
            if (prevBest === 0 || this.timer < prevBest) {
                progress.bestTimes[this.levelIndex] = this.timer;
            }

            // 解锁下一关
            if (this.levelIndex >= progress.unlockedLevel && this.levelIndex + 1 < getLevelCount()) {
                progress.unlockedLevel = this.levelIndex + 1;
            }

            localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
        } catch (e) {
            console.warn('Failed to save progress:', e);
        }
    }

    handleInput(inputManager) {
        const im = inputManager;
        const { game } = this;

        // ESC 暂停
        if (im.isKeyJustPressed('Escape') && this.isPlaying && !this.isVictory) {
            game.eventBus.emit(EVENTS.PLAY_SOUND, 'click');
            const { PauseScene } = game._sceneClasses;
            game.sceneManager.push(new PauseScene(game, this));
            return;
        }

        // 胜利状态下的按钮交互
        if (this.isVictory) {
            // 下一关
            if (im.isClickInRect(this._nextBtn.x, this._nextBtn.y, this._nextBtn.w, this._nextBtn.h) ||
                im.isKeyJustPressed('Enter')) {
                im.consumeClick();
                game.eventBus.emit(EVENTS.PLAY_SOUND, 'click');

                if (this.levelIndex + 1 < getLevelCount()) {
                    game.transitionSystem.start('fade', 0.5, () => {
                        const { GameScene: GS } = game._sceneClasses;
                        const nextScene = new GS(game);
                        game.sceneManager.replace(nextScene, { levelIndex: this.levelIndex + 1 });
                    });
                } else {
                    // 已是最后一关，返回选关
                    game.transitionSystem.start('fade', 0.5, () => {
                        const { LevelSelectScene } = game._sceneClasses;
                        game.sceneManager.replace(new LevelSelectScene(game));
                    });
                }
                return;
            }

            // 重试
            if (im.isClickInRect(this._retryBtn.x, this._retryBtn.y, this._retryBtn.w, this._retryBtn.h)) {
                im.consumeClick();
                game.eventBus.emit(EVENTS.PLAY_SOUND, 'click');

                game.transitionSystem.start('fade', 0.4, () => {
                    const { GameScene: GS } = game._sceneClasses;
                    const retry = new GS(game);
                    game.sceneManager.replace(retry, { levelIndex: this.levelIndex });
                });
                return;
            }

            // 返回选关
            if (im.isClickInRect(this._backBtn.x, this._backBtn.y, this._backBtn.w, this._backBtn.h)) {
                im.consumeClick();
                game.eventBus.emit(EVENTS.PLAY_SOUND, 'click');

                game.transitionSystem.start('fade', 0.5, () => {
                    const { LevelSelectScene } = game._sceneClasses;
                    game.sceneManager.replace(new LevelSelectScene(game));
                });
                return;
            }
        }

        // R 键快速重试
        if (im.isKeyJustPressed('r') || im.isKeyJustPressed('R')) {
            game.eventBus.emit(EVENTS.PLAY_SOUND, 'click');
            game.transitionSystem.start('circle', 0.4, () => {
                const { GameScene: GS } = game._sceneClasses;
                const retry = new GS(game);
                game.sceneManager.replace(retry, { levelIndex: this.levelIndex });
            }, null, {
                cx: this.player ? this.player.x + PLAYER_SIZE / 2 : CANVAS_WIDTH / 2,
                cy: this.player ? this.player.y + PLAYER_SIZE / 2 : CANVAS_HEIGHT / 2
            });
        }
    }

    /**
     * 渲染
     * @param {import('../rendering/Renderer.js').Renderer} renderer
     */
    render(renderer) {
        const ctx = renderer.getContext();
        const cam = this.game.cameraSystem;

        // 背景
        renderer.clear(this.theme.background);

        // 背景网格
        renderer.drawGrid(30, this.theme.primary, 0.04);

        // 应用相机变换
        cam.applyTransform(ctx);

        // 渲染层次: 安全区 → 障碍物 → 检查点 → 终点 → 玩家
        // 1. 安全区域
        for (const safe of this.safeZones) {
            safe.render(ctx, this.theme);
        }

        // 2. 障碍物
        for (const obs of this.obstacles) {
            obs.render(ctx, this.theme);
        }

        // 3. 检查点
        for (const cp of this.checkpoints) {
            cp.render(ctx, this.theme);
        }

        // 4. 终点
        if (this.goal) {
            this.goal.render(ctx, this.theme);
        }

        // 5. 玩家
        if (this.player) {
            this.player.render(ctx, this.theme);
        }

        // 6. 粒子（在实体上方）
        this.game.particleSystem.renderWithGlow(ctx);

        // 恢复相机变换
        cam.resetTransform(ctx);

        // 7. HUD
        UIRenderer.drawHUD(ctx, {
            levelName: this.levelData.name,
            levelIndex: this.levelIndex,
            timer: this.timer,
            themeColor: this.theme.primary,
            deathCount: this.deathCount
        });

        // 虚拟摇杆
        const joystick = this.game.inputManager.getJoystickInfo();
        if (joystick) {
            UIRenderer.drawVirtualJoystick(ctx, joystick);
        }

        // 8. 开局提示
        if (this._startCountdown > 0) {
            const alpha = Math.min(1, this._startCountdown * 3);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.font = 'bold 32px "Microsoft YaHei"';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = this.theme.primary;
            ctx.shadowBlur = 20;
            ctx.fillText(this.levelData.subtitle, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
            ctx.restore();
        }

        // 9. 胜利面板
        if (this.isVictory) {
            this._renderVictoryPanel(ctx);
        }
    }

    /**
     * 渲染胜利结算面板
     */
    _renderVictoryPanel(ctx) {
        UIRenderer.drawVictoryPanel(ctx, {
            levelName: this.levelData.name,
            levelIndex: this.levelIndex,
            time: this.timer,
            stars: this.victoryStars,
            parTime: this.levelData.parTime,
            themeColor: this.theme.primary
        });

        const im = this.game.inputManager;
        const color = this.theme.primary;

        // 按钮
        const isLastLevel = this.levelIndex + 1 >= getLevelCount();

        UIRenderer.drawButton(ctx, {
            text: isLastLevel ? '全部通关!' : '下一关 →',
            ...this._nextBtn,
            color: color,
            isHovered: im.isMouseInRect(this._nextBtn.x, this._nextBtn.y, this._nextBtn.w, this._nextBtn.h)
        });

        UIRenderer.drawButton(ctx, {
            text: '重新挑战',
            ...this._retryBtn,
            color: 'rgba(100,100,120,0.8)',
            isHovered: im.isMouseInRect(this._retryBtn.x, this._retryBtn.y, this._retryBtn.w, this._retryBtn.h)
        });

        UIRenderer.drawButton(ctx, {
            text: '返回选关',
            ...this._backBtn,
            color: 'rgba(80,80,100,0.6)',
            isHovered: im.isMouseInRect(this._backBtn.x, this._backBtn.y, this._backBtn.w, this._backBtn.h),
            alpha: 0.8
        });

        // 提示
        UIRenderer.drawHint(ctx, '按 Enter 继续 · R 重试', 545);
    }

    /**
     * 暂停恢复
     */
    onResume() {
        // 暂停弹出后恢复游戏
    }

    onPause() {
        // 被暂停
    }
}
