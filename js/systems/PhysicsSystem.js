// =====================================================
// OneColorGame - 物理系统 (纯函数式, 无状态)
// =====================================================

/**
 * 应用加速度到速度
 * @param {{x: number, y: number}} velocity - 当前速度
 * @param {{x: number, y: number}} direction - 输入方向 (-1 到 1)
 * @param {number} accel - 加速度 (像素/秒²)
 * @param {number} maxSpeed - 最大速度 (像素/秒)
 * @param {number} dt - 时间步 (秒)
 * @returns {{x: number, y: number}} 新速度
 */
export function applyAcceleration(velocity, direction, accel, maxSpeed, dt) {
    let vx = velocity.x + direction.x * accel * dt;
    let vy = velocity.y + direction.y * accel * dt;

    // 限制最大速度
    const speed = Math.sqrt(vx * vx + vy * vy);
    if (speed > maxSpeed) {
        const scale = maxSpeed / speed;
        vx *= scale;
        vy *= scale;
    }

    return { x: vx, y: vy };
}

/**
 * 应用摩擦力（指数衰减）
 * @param {{x: number, y: number}} velocity
 * @param {number} friction - 摩擦系数
 * @param {number} dt
 * @returns {{x: number, y: number}}
 */
export function applyFriction(velocity, friction, dt) {
    const factor = Math.exp(-friction * dt);
    let vx = velocity.x * factor;
    let vy = velocity.y * factor;

    // 极低速度归零
    if (Math.abs(vx) < 0.5) vx = 0;
    if (Math.abs(vy) < 0.5) vy = 0;

    return { x: vx, y: vy };
}

/**
 * 边界钳位
 * @param {{x: number, y: number}} pos - 位置
 * @param {number} entityW - 实体宽
 * @param {number} entityH - 实体高
 * @param {number} boundsW - 世界宽
 * @param {number} boundsH - 世界高
 * @returns {{x: number, y: number, hitX: boolean, hitY: boolean}}
 */
export function clampToBounds(pos, entityW, entityH, boundsW, boundsH) {
    let x = pos.x;
    let y = pos.y;
    let hitX = false;
    let hitY = false;

    if (x < 0) { x = 0; hitX = true; }
    if (y < 0) { y = 0; hitY = true; }
    if (x + entityW > boundsW) { x = boundsW - entityW; hitX = true; }
    if (y + entityH > boundsH) { y = boundsH - entityH; hitY = true; }

    return { x, y, hitX, hitY };
}

/**
 * AABB 矩形碰撞检测
 * @param {{x: number, y: number, w: number, h: number}} a
 * @param {{x: number, y: number, w: number, h: number}} b
 * @returns {boolean}
 */
export function rectIntersect(a, b) {
    return a.x < b.x + b.w &&
           a.x + a.w > b.x &&
           a.y < b.y + b.h &&
           a.y + a.h > b.y;
}

/**
 * 获取旋转矩形的四个顶点
 * @param {number} cx - 中心x
 * @param {number} cy - 中心y
 * @param {number} w - 宽
 * @param {number} h - 高
 * @param {number} angle - 弧度
 * @returns {Array<{x: number, y: number}>}
 */
export function getRotatedRectVertices(cx, cy, w, h, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const hw = w / 2;
    const hh = h / 2;

    return [
        { x: cx + (-hw * cos - (-hh) * sin), y: cy + (-hw * sin + (-hh) * cos) },
        { x: cx + (hw * cos - (-hh) * sin),  y: cy + (hw * sin + (-hh) * cos) },
        { x: cx + (hw * cos - hh * sin),     y: cy + (hw * sin + hh * cos) },
        { x: cx + (-hw * cos - hh * sin),    y: cy + (-hw * sin + hh * cos) }
    ];
}

/**
 * SAT (Separating Axis Theorem) 碰撞检测 - 用于旋转矩形
 * @param {{x: number, y: number, w: number, h: number}} aabb - 非旋转矩形
 * @param {{cx: number, cy: number, w: number, h: number, angle: number}} rotated - 旋转矩形
 * @returns {boolean}
 */
export function rectIntersectRotated(aabb, rotated) {
    // 获取 AABB 的四个顶点
    const aVerts = [
        { x: aabb.x, y: aabb.y },
        { x: aabb.x + aabb.w, y: aabb.y },
        { x: aabb.x + aabb.w, y: aabb.y + aabb.h },
        { x: aabb.x, y: aabb.y + aabb.h }
    ];

    // 获取旋转矩形的四个顶点
    const bVerts = getRotatedRectVertices(rotated.cx, rotated.cy, rotated.w, rotated.h, rotated.angle);

    // 获取四条分离轴（两个矩形各两条法线）
    const axes = [
        // AABB 的轴（始终是 x 和 y 轴）
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        // 旋转矩形的轴
        { x: Math.cos(rotated.angle), y: Math.sin(rotated.angle) },
        { x: -Math.sin(rotated.angle), y: Math.cos(rotated.angle) }
    ];

    for (const axis of axes) {
        let aMin = Infinity, aMax = -Infinity;
        let bMin = Infinity, bMax = -Infinity;

        for (const v of aVerts) {
            const proj = v.x * axis.x + v.y * axis.y;
            aMin = Math.min(aMin, proj);
            aMax = Math.max(aMax, proj);
        }

        for (const v of bVerts) {
            const proj = v.x * axis.x + v.y * axis.y;
            bMin = Math.min(bMin, proj);
            bMax = Math.max(bMax, proj);
        }

        // 检测投影是否分离
        if (aMax < bMin || bMax < aMin) {
            return false; // 存在分离轴，不碰撞
        }
    }

    return true; // 所有轴都有重叠，碰撞
}

/**
 * 点是否在矩形内
 */
export function pointInRect(px, py, rx, ry, rw, rh) {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}
