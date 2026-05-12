// =====================================================
// OneColorGame - 关卡加载器 (数据 → 实体实例)
// =====================================================

import { Player } from '../entities/Player.js';
import { Obstacle, ObstacleType } from '../entities/Obstacle.js';
import { Goal } from '../entities/Goal.js';
import { SafeZone } from '../entities/SafeZone.js';
import { Checkpoint } from '../entities/Checkpoint.js';

export class LevelLoader {
    /**
     * 将关卡数据转换为实体对象
     * @param {Object} levelData - 来自 LevelData.js 的关卡定义
     * @returns {Object} { player, obstacles, safeZones, goal, checkpoints, theme }
     */
    static load(levelData) {
        const result = {
            player: null,
            obstacles: [],
            safeZones: [],
            goal: null,
            checkpoints: [],
            theme: levelData.theme
        };

        // 创建玩家
        result.player = new Player(
            levelData.playerStart.x,
            levelData.playerStart.y
        );

        // 解析实体
        for (const entity of levelData.entities) {
            switch (entity.type) {
                case 'safe':
                    result.safeZones.push(
                        new SafeZone(entity.x, entity.y, entity.w, entity.h)
                    );
                    break;

                case 'danger':
                    result.obstacles.push(
                        LevelLoader._createObstacle(entity)
                    );
                    break;

                case 'goal':
                    result.goal = new Goal(
                        entity.x, entity.y, entity.w, entity.h
                    );
                    break;

                case 'checkpoint':
                    result.checkpoints.push(
                        new Checkpoint(entity.x, entity.y)
                    );
                    break;

                default:
                    console.warn(`Unknown entity type: ${entity.type}`);
            }
        }

        return result;
    }

    /**
     * 创建障碍物实例
     * @param {Object} entityData
     * @returns {Obstacle}
     */
    static _createObstacle(entityData) {
        const config = {
            alpha: entityData.alpha || 0.35
        };

        // 确定障碍物类型
        if (entityData.rotation) {
            config.type = ObstacleType.ROTATING;
            config.rotationSpeed = entityData.rotationSpeed || 1.5;
            config.angle = entityData.angle || 0;
        } else if (entityData.movement === 'horizontal') {
            config.type = ObstacleType.MOVING_H;
            config.speed = entityData.speed || 80;
            config.range = entityData.range || 100;
            config.moveOffset = entityData.moveOffset || 0;
        } else if (entityData.movement === 'vertical') {
            config.type = ObstacleType.MOVING_V;
            config.speed = entityData.speed || 80;
            config.range = entityData.range || 100;
            config.moveOffset = entityData.moveOffset || 0;
        } else {
            config.type = ObstacleType.STATIC;
        }

        return new Obstacle(
            entityData.x, entityData.y,
            entityData.w, entityData.h,
            config
        );
    }

    /**
     * 计算关卡中的实体数量（用于调试信息）
     */
    static getEntityCount(levelData) {
        return {
            total: levelData.entities.length,
            dangers: levelData.entities.filter(e => e.type === 'danger').length,
            safes: levelData.entities.filter(e => e.type === 'safe').length,
            checkpoints: levelData.entities.filter(e => e.type === 'checkpoint').length,
            goals: levelData.entities.filter(e => e.type === 'goal').length,
            moving: levelData.entities.filter(e => e.movement).length,
            rotating: levelData.entities.filter(e => e.rotation).length
        };
    }
}
