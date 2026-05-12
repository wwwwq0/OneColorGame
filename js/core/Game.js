// =====================================================
// OneColorGame - 游戏主循环
// =====================================================

import { CANVAS_WIDTH, CANVAS_HEIGHT, EVENTS } from './Config.js';
import { EventBus } from './EventBus.js';
import { Renderer } from '../rendering/Renderer.js';
import { SceneManager } from '../scenes/SceneManager.js';
import { InputManager } from '../managers/InputManager.js';
import { AudioManager } from '../managers/AudioManager.js';
import { ParticleSystem } from '../systems/ParticleSystem.js';
import { CameraSystem } from '../systems/CameraSystem.js';
import { TransitionSystem } from '../systems/TransitionSystem.js';

// 场景类（延迟导入，避免循环依赖）
import { MenuScene } from '../scenes/MenuScene.js';
import { LevelSelectScene } from '../scenes/LevelSelectScene.js';
import { GameScene } from '../scenes/GameScene.js';
import { PauseScene } from '../scenes/PauseScene.js';
import { SettingsScene } from '../scenes/SettingsScene.js';

export class Game {
    /**
     * @param {HTMLCanvasElement} canvas
     */
    constructor(canvas) {
        this.canvas = canvas;

        // 核心系统
        this.eventBus = new EventBus();
        this.renderer = new Renderer(canvas);
        this.sceneManager = new SceneManager(this);
        this.inputManager = new InputManager(canvas);
        this.audioManager = new AudioManager(this.eventBus);
        this.particleSystem = new ParticleSystem();
        this.cameraSystem = new CameraSystem();
        this.transitionSystem = new TransitionSystem();

        // 场景类引用（供场景之间互相创建）
        this._sceneClasses = {
            MenuScene,
            LevelSelectScene,
            GameScene,
            PauseScene,
            SettingsScene
        };

        // 帧率管理
        this._lastTimestamp = 0;
        this._running = false;
        this._frameId = null;

        // FPS 统计
        this._fpsTimer = 0;
        this._frameCount = 0;
        this._fps = 0;
    }

    /**
     * 初始化并启动游戏
     */
    init() {
        // 初始化场景为主菜单
        const menuScene = new MenuScene(this);
        this.sceneManager.push(menuScene);

        // 首次用户交互时初始化音频
        const initAudio = () => {
            this.audioManager.init();
            document.removeEventListener('click', initAudio);
            document.removeEventListener('keydown', initAudio);
            document.removeEventListener('touchstart', initAudio);
        };
        document.addEventListener('click', initAudio);
        document.addEventListener('keydown', initAudio);
        document.addEventListener('touchstart', initAudio);

        // 启动主循环
        this._running = true;
        this._lastTimestamp = performance.now();
        this._loop(this._lastTimestamp);
    }

    /**
     * 主循环
     * @param {number} timestamp
     */
    _loop(timestamp) {
        if (!this._running) return;

        // 计算 deltaTime（秒），钳位防跳帧
        let dt = (timestamp - this._lastTimestamp) / 1000;
        this._lastTimestamp = timestamp;
        dt = Math.min(dt, 0.05); // 最大 50ms (防止切标签后的大步进)

        // FPS 统计
        this._fpsTimer += dt;
        this._frameCount++;
        if (this._fpsTimer >= 1) {
            this._fps = this._frameCount;
            this._frameCount = 0;
            this._fpsTimer = 0;
        }

        // 1. 更新输入
        this.inputManager.update();

        // 2. 处理输入
        if (!this.transitionSystem.isActive()) {
            this.sceneManager.handleInput(this.inputManager);
        }

        // 3. 更新场景
        this.sceneManager.update(dt);

        // 4. 更新过渡
        this.transitionSystem.update(dt);

        // 5. 渲染
        this._render();

        // 6. 清除单帧输入状态
        this.inputManager.endFrame();

        // 请求下一帧
        this._frameId = requestAnimationFrame((ts) => this._loop(ts));
    }

    /**
     * 渲染
     */
    _render() {
        // 渲染场景栈
        this.sceneManager.render(this.renderer);

        // 渲染过渡效果（最顶层）
        this.transitionSystem.render(this.renderer.getContext());
    }

    /**
     * 停止游戏
     */
    stop() {
        this._running = false;
        if (this._frameId) {
            cancelAnimationFrame(this._frameId);
        }
    }

    /**
     * 获取当前 FPS
     */
    getFPS() {
        return this._fps;
    }
}
