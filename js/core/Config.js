// =====================================================
// OneColorGame - 全局配置与常量
// =====================================================

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

// 玩家配置
export const PLAYER_SIZE = 24;
export const PLAYER_ACCEL = 1800;       // 像素/秒²
export const PLAYER_FRICTION = 8;        // 摩擦减速系数
export const PLAYER_MAX_SPEED = 300;     // 像素/秒
export const PLAYER_BORDER_WIDTH = 3;
export const PLAYER_TRAIL_INTERVAL = 0.03; // 拖尾粒子间隔(秒)
export const PLAYER_RESPAWN_DELAY = 0.8;   // 死亡到重生延迟(秒)
export const PLAYER_INVINCIBLE_TIME = 0.5; // 重生后无敌时间(秒)

// 粒子系统
export const PARTICLE_POOL_SIZE = 500;
export const PARTICLE_PRESETS = {
    trail: {
        count: 2,
        speed: 30,
        life: 0.35,
        size: 4,
        sizeDecay: true,
        alphaDecay: true
    },
    death: {
        count: 35,
        speed: 250,
        life: 0.8,
        size: 6,
        sizeDecay: true,
        alphaDecay: true
    },
    victory: {
        count: 50,
        speed: 200,
        life: 1.5,
        size: 5,
        gravity: 150,
        sizeDecay: false,
        alphaDecay: true
    },
    ambient: {
        count: 1,
        speed: 20,
        life: 3.0,
        size: 3,
        alphaDecay: true,
        sizeDecay: false
    },
    checkpoint: {
        count: 15,
        speed: 120,
        life: 0.6,
        size: 4,
        sizeDecay: true,
        alphaDecay: true
    }
};

// 相机配置
export const CAMERA_LERP_SPEED = 5;
export const CAMERA_SHAKE_DEFAULT_INTENSITY = 8;
export const CAMERA_SHAKE_DEFAULT_DURATION = 0.3;

// 过渡动画
export const TRANSITION_FADE_DURATION = 0.5;
export const TRANSITION_CIRCLE_DURATION = 0.6;

// 星级评定
export const STAR_THRESHOLDS = {
    three: 1.0,   // <= parTime
    two: 1.5,     // <= parTime * 1.5
    one: Infinity  // 完成即得1星
};

// 事件名称
export const EVENTS = {
    PLAYER_DIED: 'player:died',
    PLAYER_WON: 'player:won',
    LEVEL_LOADED: 'level:loaded',
    CHECKPOINT_REACHED: 'checkpoint:reached',
    SCENE_CHANGE: 'scene:change',
    PAUSE_TOGGLE: 'pause:toggle',
    SHAKE_CAMERA: 'camera:shake',
    PLAY_SOUND: 'audio:play',
    SETTING_CHANGED: 'setting:changed',
    EMIT_PARTICLES: 'particles:emit'
};

// 默认设置
export const DEFAULT_SETTINGS = {
    sfxVolume: 0.7,
    showParticles: true
};

// 颜色工具 - 将十六进制颜色转为 rgba
export function hexToRgba(hex, alpha = 1) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// 将十六进制颜色变亮
export function lightenColor(hex, amount = 0.3) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    r = Math.min(255, Math.floor(r + (255 - r) * amount));
    g = Math.min(255, Math.floor(g + (255 - g) * amount));
    b = Math.min(255, Math.floor(b + (255 - b) * amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// 将十六进制颜色变暗
export function darkenColor(hex, amount = 0.3) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    r = Math.max(0, Math.floor(r * (1 - amount)));
    g = Math.max(0, Math.floor(g * (1 - amount)));
    b = Math.max(0, Math.floor(b * (1 - amount)));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// localStorage 键
export const STORAGE_KEYS = {
    PROGRESS: 'onecolor_progress',
    SETTINGS: 'onecolor_settings'
};
