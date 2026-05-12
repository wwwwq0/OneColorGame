// =====================================================
// OneColorGame - 应用入口
// =====================================================

import { Game } from './core/Game.js';

/**
 * 应用初始化
 */
function bootstrap() {
    const canvas = document.getElementById('gameCanvas');

    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }

    // 创建游戏实例
    const game = new Game(canvas);

    // 隐藏加载画面
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }

    // 启动游戏
    game.init();

    // 开发调试：暴露到全局
    if (typeof window !== 'undefined') {
        window.__game = game;
    }

    console.log('OneColorGame V2.0 initialized');
}

// DOM 准备就绪后启动
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}
