// =====================================================
// OneColorGame - 10个关卡数据定义
// =====================================================

/**
 * 每个关卡的数据结构:
 * {
 *   id: number,
 *   name: string,
 *   subtitle: string,
 *   theme: { primary, background, safe, danger, goal, particle },
 *   playerStart: { x, y },
 *   parTime: number (秒),
 *   entities: [
 *     { type: 'safe', x, y, w, h },
 *     { type: 'danger', x, y, w, h, movement?, speed?, range?, moveOffset?,
 *       rotation?, rotationSpeed?, angle? },
 *     { type: 'goal', x, y, w, h },
 *     { type: 'checkpoint', x, y }
 *   ]
 * }
 */

export const LEVELS = [
    // ==================== 第1关: 启程 ====================
    {
        id: 1,
        name: '启程',
        subtitle: '学会移动，到达终点',
        theme: {
            primary: '#165DFF',
            background: '#0a1a3a',
            safe: '#165DFF',
            danger: 'rgba(22, 93, 255, 0.35)',
            goal: '#165DFF',
            particle: '#4d8bff'
        },
        playerStart: { x: 50, y: 285 },
        parTime: 8,
        entities: [
            // 上下安全区
            { type: 'safe', x: 0, y: 0, w: 800, h: 40 },
            { type: 'safe', x: 0, y: 560, w: 800, h: 40 },
            // 两面障碍墙
            { type: 'danger', x: 200, y: 80, w: 60, h: 440 },
            { type: 'danger', x: 500, y: 80, w: 60, h: 440 },
            // 中间辅助安全区
            { type: 'safe', x: 200, y: 270, w: 60, h: 60 },
            { type: 'safe', x: 500, y: 270, w: 60, h: 60 },
            // 终点
            { type: 'goal', x: 720, y: 270, w: 50, h: 50 }
        ]
    },

    // ==================== 第2关: 迷径 ====================
    {
        id: 2,
        name: '迷径',
        subtitle: '寻找安全的通道',
        theme: {
            primary: '#00B2A9',
            background: '#0a2a2a',
            safe: '#00B2A9',
            danger: 'rgba(0, 178, 169, 0.35)',
            goal: '#00B2A9',
            particle: '#33d4cc'
        },
        playerStart: { x: 50, y: 285 },
        parTime: 12,
        entities: [
            // 左侧安全走廊
            { type: 'safe', x: 0, y: 0, w: 80, h: 600 },
            // 右侧安全走廊
            { type: 'safe', x: 720, y: 0, w: 80, h: 600 },
            // 上方封顶
            { type: 'safe', x: 0, y: 0, w: 800, h: 30 },
            { type: 'safe', x: 0, y: 570, w: 800, h: 30 },
            // 迷宫障碍
            { type: 'danger', x: 130, y: 0, w: 50, h: 230 },
            { type: 'danger', x: 130, y: 320, w: 50, h: 280 },
            { type: 'danger', x: 260, y: 100, w: 50, h: 280 },
            { type: 'danger', x: 260, y: 470, w: 50, h: 130 },
            { type: 'danger', x: 390, y: 0, w: 50, h: 180 },
            { type: 'danger', x: 390, y: 280, w: 50, h: 320 },
            { type: 'danger', x: 520, y: 100, w: 50, h: 320 },
            { type: 'danger', x: 520, y: 510, w: 50, h: 90 },
            { type: 'danger', x: 650, y: 0, w: 50, h: 250 },
            { type: 'danger', x: 650, y: 350, w: 50, h: 250 },
            // 终点(右侧走廊中部)
            { type: 'goal', x: 740, y: 275, w: 40, h: 40 }
        ]
    },

    // ==================== 第3关: 横流 ====================
    {
        id: 3,
        name: '横流',
        subtitle: '观察节奏，穿越移动障碍',
        theme: {
            primary: '#00A854',
            background: '#0a2a15',
            safe: '#00A854',
            danger: 'rgba(0, 168, 84, 0.4)',
            goal: '#00A854',
            particle: '#33cc77'
        },
        playerStart: { x: 50, y: 285 },
        parTime: 15,
        entities: [
            // 安全区
            { type: 'safe', x: 0, y: 0, w: 120, h: 600 },
            { type: 'safe', x: 680, y: 0, w: 120, h: 600 },
            // 三条水平移动障碍
            { type: 'danger', x: 200, y: 50, w: 100, h: 80,
              movement: 'horizontal', speed: 60, range: 150, moveOffset: 0 },
            { type: 'danger', x: 350, y: 250, w: 120, h: 80,
              movement: 'horizontal', speed: 80, range: 120, moveOffset: 1.5 },
            { type: 'danger', x: 200, y: 450, w: 100, h: 80,
              movement: 'horizontal', speed: 70, range: 160, moveOffset: 3.0 },
            // 小型静态障碍增加难度
            { type: 'danger', x: 450, y: 140, w: 40, h: 100 },
            { type: 'danger', x: 300, y: 340, w: 40, h: 100 },
            // 终点
            { type: 'goal', x: 710, y: 270, w: 50, h: 50 }
        ]
    },

    // ==================== 第4关: 纵波 ====================
    {
        id: 4,
        name: '纵波',
        subtitle: '垂直移动的危险之门',
        theme: {
            primary: '#7B61FF',
            background: '#1a0a3a',
            safe: '#7B61FF',
            danger: 'rgba(123, 97, 255, 0.4)',
            goal: '#7B61FF',
            particle: '#a38bff'
        },
        playerStart: { x: 50, y: 285 },
        parTime: 18,
        entities: [
            // 顶底安全区
            { type: 'safe', x: 0, y: 0, w: 800, h: 30 },
            { type: 'safe', x: 0, y: 570, w: 800, h: 30 },
            // 垂直移动障碍门 (上下移动形成活门)
            { type: 'danger', x: 160, y: 30, w: 50, h: 200,
              movement: 'vertical', speed: 50, range: 140, moveOffset: 0 },
            { type: 'danger', x: 160, y: 370, w: 50, h: 200,
              movement: 'vertical', speed: 50, range: -140, moveOffset: 0 },
            { type: 'danger', x: 340, y: 30, w: 50, h: 200,
              movement: 'vertical', speed: 65, range: 130, moveOffset: 2 },
            { type: 'danger', x: 340, y: 370, w: 50, h: 200,
              movement: 'vertical', speed: 65, range: -130, moveOffset: 2 },
            { type: 'danger', x: 520, y: 30, w: 50, h: 200,
              movement: 'vertical', speed: 55, range: 150, moveOffset: 4 },
            { type: 'danger', x: 520, y: 370, w: 50, h: 200,
              movement: 'vertical', speed: 55, range: -150, moveOffset: 4 },
            // 检查点
            { type: 'checkpoint', x: 430, y: 300 },
            // 终点
            { type: 'goal', x: 720, y: 270, w: 50, h: 50 }
        ]
    },

    // ==================== 第5关: 旋涡 ====================
    {
        id: 5,
        name: '旋涡',
        subtitle: '避开旋转的危险守卫',
        theme: {
            primary: '#FF7D00',
            background: '#2a1a0a',
            safe: '#FF7D00',
            danger: 'rgba(255, 125, 0, 0.4)',
            goal: '#FF7D00',
            particle: '#ffaa44'
        },
        playerStart: { x: 50, y: 285 },
        parTime: 20,
        entities: [
            // 上下安全区
            { type: 'safe', x: 0, y: 0, w: 800, h: 25 },
            { type: 'safe', x: 0, y: 575, w: 800, h: 25 },
            // 三个旋转守卫
            { type: 'danger', x: 180, y: 280, w: 160, h: 25,
              rotation: true, rotationSpeed: 1.2 },
            { type: 'danger', x: 380, y: 280, w: 140, h: 25,
              rotation: true, rotationSpeed: -1.6 },
            { type: 'danger', x: 580, y: 280, w: 180, h: 25,
              rotation: true, rotationSpeed: 1.0 },
            // 静态障碍通道
            { type: 'danger', x: 120, y: 100, w: 30, h: 160 },
            { type: 'danger', x: 120, y: 340, w: 30, h: 160 },
            { type: 'danger', x: 320, y: 80, w: 30, h: 170 },
            { type: 'danger', x: 320, y: 350, w: 30, h: 170 },
            { type: 'danger', x: 500, y: 100, w: 30, h: 150 },
            { type: 'danger', x: 500, y: 350, w: 30, h: 150 },
            // 终点
            { type: 'goal', x: 720, y: 270, w: 50, h: 50 }
        ]
    },

    // ==================== 第6关: 交织 ====================
    {
        id: 6,
        name: '交织',
        subtitle: '纵横交错的移动网格',
        theme: {
            primary: '#F53F3F',
            background: '#2a0a0a',
            safe: '#F53F3F',
            danger: 'rgba(245, 63, 63, 0.4)',
            goal: '#F53F3F',
            particle: '#ff7777'
        },
        playerStart: { x: 50, y: 50 },
        parTime: 22,
        entities: [
            // 水平移动障碍
            { type: 'danger', x: 150, y: 80, w: 130, h: 35,
              movement: 'horizontal', speed: 55, range: 180, moveOffset: 0 },
            { type: 'danger', x: 300, y: 230, w: 130, h: 35,
              movement: 'horizontal', speed: 70, range: 150, moveOffset: 1.8 },
            { type: 'danger', x: 150, y: 380, w: 130, h: 35,
              movement: 'horizontal', speed: 60, range: 170, moveOffset: 3.5 },
            { type: 'danger', x: 300, y: 520, w: 130, h: 35,
              movement: 'horizontal', speed: 65, range: 140, moveOffset: 5.0 },
            // 垂直移动障碍
            { type: 'danger', x: 200, y: 120, w: 35, h: 100,
              movement: 'vertical', speed: 50, range: 120, moveOffset: 0.5 },
            { type: 'danger', x: 400, y: 50, w: 35, h: 100,
              movement: 'vertical', speed: 60, range: 150, moveOffset: 2.5 },
            { type: 'danger', x: 550, y: 150, w: 35, h: 100,
              movement: 'vertical', speed: 55, range: 130, moveOffset: 4.0 },
            // 检查点
            { type: 'checkpoint', x: 350, y: 170 },
            { type: 'checkpoint', x: 550, y: 460 },
            // 终点
            { type: 'goal', x: 720, y: 530, w: 50, h: 50 }
        ]
    },

    // ==================== 第7关: 风暴 ====================
    {
        id: 7,
        name: '风暴',
        subtitle: '旋转与移动的双重威胁',
        theme: {
            primary: '#D91AD9',
            background: '#2a0a2a',
            safe: '#D91AD9',
            danger: 'rgba(217, 26, 217, 0.4)',
            goal: '#D91AD9',
            particle: '#ee66ee'
        },
        playerStart: { x: 50, y: 285 },
        parTime: 25,
        entities: [
            // 安全区
            { type: 'safe', x: 0, y: 0, w: 110, h: 600 },
            { type: 'safe', x: 690, y: 0, w: 110, h: 600 },
            // 旋转障碍
            { type: 'danger', x: 200, y: 150, w: 120, h: 20,
              rotation: true, rotationSpeed: 1.8 },
            { type: 'danger', x: 400, y: 300, w: 140, h: 20,
              rotation: true, rotationSpeed: -1.4 },
            { type: 'danger', x: 550, y: 150, w: 100, h: 20,
              rotation: true, rotationSpeed: 2.0 },
            // 移动障碍
            { type: 'danger', x: 200, y: 400, w: 80, h: 50,
              movement: 'horizontal', speed: 70, range: 120, moveOffset: 0 },
            { type: 'danger', x: 400, y: 50, w: 50, h: 80,
              movement: 'vertical', speed: 60, range: 100, moveOffset: 1.5 },
            { type: 'danger', x: 550, y: 400, w: 80, h: 50,
              movement: 'horizontal', speed: 75, range: 80, moveOffset: 3 },
            // 静态墙
            { type: 'danger', x: 300, y: 220, w: 20, h: 160 },
            // 检查点
            { type: 'checkpoint', x: 350, y: 300 },
            // 终点
            { type: 'goal', x: 710, y: 270, w: 50, h: 50 }
        ]
    },

    // ==================== 第8关: 窄隙 ====================
    {
        id: 8,
        name: '窄隙',
        subtitle: '精密操控，穿越狭窄通道',
        theme: {
            primary: '#FAAD14',
            background: '#2a2a0a',
            safe: '#FAAD14',
            danger: 'rgba(250, 173, 20, 0.4)',
            goal: '#FAAD14',
            particle: '#ffcc55'
        },
        playerStart: { x: 30, y: 30 },
        parTime: 28,
        entities: [
            // 复杂的窄通道迷宫 - 通道宽度约30-40px
            // 第一段: 向下
            { type: 'danger', x: 60, y: 0, w: 690, h: 20 },
            { type: 'danger', x: 0, y: 60, w: 60, h: 120 },
            { type: 'danger', x: 100, y: 60, w: 700, h: 120 },
            // 第二段: 向右
            { type: 'danger', x: 0, y: 220, w: 200, h: 100 },
            { type: 'danger', x: 0, y: 360, w: 200, h: 240 },
            // 第三段
            { type: 'danger', x: 240, y: 180, w: 100, h: 100 },
            { type: 'danger', x: 240, y: 320, w: 100, h: 280 },
            // 第四段
            { type: 'danger', x: 380, y: 180, w: 100, h: 240 },
            { type: 'danger', x: 380, y: 460, w: 100, h: 140 },
            // 第五段
            { type: 'danger', x: 520, y: 180, w: 280, h: 100 },
            { type: 'danger', x: 520, y: 320, w: 180, h: 100 },
            // 最后通道
            { type: 'danger', x: 520, y: 460, w: 100, h: 140 },
            { type: 'danger', x: 660, y: 320, w: 140, h: 180 },
            // 检查点
            { type: 'checkpoint', x: 170, y: 290 },
            { type: 'checkpoint', x: 450, y: 430 },
            { type: 'checkpoint', x: 640, y: 290 },
            // 终点
            { type: 'goal', x: 740, y: 540, w: 40, h: 40 }
        ]
    },

    // ==================== 第9关: 乱序 ====================
    {
        id: 9,
        name: '乱序',
        subtitle: '所有障碍类型的混合挑战',
        theme: {
            primary: '#1D39C4',
            background: '#0a0a2a',
            safe: '#1D39C4',
            danger: 'rgba(29, 57, 196, 0.4)',
            goal: '#1D39C4',
            particle: '#5577ff'
        },
        playerStart: { x: 50, y: 50 },
        parTime: 35,
        entities: [
            // 区域1: 静态迷宫入口
            { type: 'danger', x: 100, y: 0, w: 40, h: 120 },
            { type: 'danger', x: 100, y: 170, w: 40, h: 180 },
            { type: 'danger', x: 100, y: 400, w: 40, h: 200 },
            // 区域2: 水平移动障碍
            { type: 'danger', x: 200, y: 80, w: 100, h: 40,
              movement: 'horizontal', speed: 60, range: 80, moveOffset: 0 },
            { type: 'danger', x: 200, y: 220, w: 100, h: 40,
              movement: 'horizontal', speed: 70, range: 100, moveOffset: 2 },
            { type: 'danger', x: 200, y: 380, w: 100, h: 40,
              movement: 'horizontal', speed: 50, range: 90, moveOffset: 4 },
            // 区域3: 旋转守卫
            { type: 'danger', x: 420, y: 150, w: 120, h: 20,
              rotation: true, rotationSpeed: 1.5 },
            { type: 'danger', x: 420, y: 400, w: 120, h: 20,
              rotation: true, rotationSpeed: -1.8 },
            // 区域4: 垂直移动+静态混合
            { type: 'danger', x: 550, y: 50, w: 40, h: 120,
              movement: 'vertical', speed: 55, range: 100, moveOffset: 1 },
            { type: 'danger', x: 550, y: 350, w: 40, h: 120,
              movement: 'vertical', speed: 55, range: -100, moveOffset: 1 },
            { type: 'danger', x: 620, y: 150, w: 40, h: 120 },
            { type: 'danger', x: 620, y: 350, w: 40, h: 120 },
            // 最终旋转门
            { type: 'danger', x: 700, y: 300, w: 140, h: 18,
              rotation: true, rotationSpeed: 1.2 },
            // 检查点
            { type: 'checkpoint', x: 180, y: 300 },
            { type: 'checkpoint', x: 480, y: 300 },
            { type: 'checkpoint', x: 650, y: 300 },
            // 终点
            { type: 'goal', x: 740, y: 540, w: 50, h: 50 }
        ]
    },

    // ==================== 第10关: 终章 ====================
    {
        id: 10,
        name: '终章',
        subtitle: '最终挑战，证明你的实力',
        theme: {
            primary: '#333333',
            background: '#f0f0f0',
            safe: '#333333',
            danger: 'rgba(50, 50, 50, 0.35)',
            goal: '#333333',
            particle: '#666666'
        },
        playerStart: { x: 50, y: 50 },
        parTime: 45,
        entities: [
            // 反色主题 - 深色元素浅色背景
            // 入口迷宫
            { type: 'danger', x: 100, y: 0, w: 30, h: 130 },
            { type: 'danger', x: 100, y: 180, w: 30, h: 120 },
            { type: 'danger', x: 100, y: 350, w: 30, h: 250 },
            // 水平移动区
            { type: 'danger', x: 160, y: 50, w: 80, h: 30,
              movement: 'horizontal', speed: 70, range: 80, moveOffset: 0 },
            { type: 'danger', x: 160, y: 180, w: 80, h: 30,
              movement: 'horizontal', speed: 80, range: 100, moveOffset: 1.5 },
            { type: 'danger', x: 160, y: 320, w: 80, h: 30,
              movement: 'horizontal', speed: 60, range: 90, moveOffset: 3 },
            { type: 'danger', x: 160, y: 470, w: 80, h: 30,
              movement: 'horizontal', speed: 75, range: 110, moveOffset: 4.5 },
            // 垂直移动区
            { type: 'danger', x: 320, y: 80, w: 30, h: 100,
              movement: 'vertical', speed: 65, range: 120, moveOffset: 0 },
            { type: 'danger', x: 320, y: 350, w: 30, h: 100,
              movement: 'vertical', speed: 65, range: -120, moveOffset: 0 },
            // 旋转守卫区
            { type: 'danger', x: 420, y: 120, w: 100, h: 18,
              rotation: true, rotationSpeed: 2.0 },
            { type: 'danger', x: 420, y: 350, w: 100, h: 18,
              rotation: true, rotationSpeed: -1.6 },
            { type: 'danger', x: 420, y: 500, w: 80, h: 18,
              rotation: true, rotationSpeed: 1.8 },
            // 最终冲刺
            { type: 'danger', x: 560, y: 50, w: 30, h: 200 },
            { type: 'danger', x: 560, y: 350, w: 30, h: 250 },
            { type: 'danger', x: 630, y: 100, w: 80, h: 30,
              movement: 'horizontal', speed: 90, range: 60, moveOffset: 0.5 },
            { type: 'danger', x: 630, y: 300, w: 80, h: 30,
              movement: 'horizontal', speed: 85, range: 70, moveOffset: 2.5 },
            { type: 'danger', x: 630, y: 480, w: 80, h: 30,
              movement: 'horizontal', speed: 95, range: 50, moveOffset: 4 },
            { type: 'danger', x: 730, y: 200, w: 30, h: 120,
              movement: 'vertical', speed: 70, range: 80, moveOffset: 1 },
            // 检查点
            { type: 'checkpoint', x: 270, y: 300 },
            { type: 'checkpoint', x: 490, y: 250 },
            { type: 'checkpoint', x: 610, y: 280 },
            { type: 'checkpoint', x: 750, y: 400 },
            // 终点
            { type: 'goal', x: 740, y: 540, w: 50, h: 50 }
        ]
    }
];

/**
 * 获取关卡总数
 */
export function getLevelCount() {
    return LEVELS.length;
}

/**
 * 获取指定关卡数据
 * @param {number} index - 0-based 索引
 * @returns {Object|null}
 */
export function getLevelData(index) {
    if (index < 0 || index >= LEVELS.length) return null;
    return LEVELS[index];
}
