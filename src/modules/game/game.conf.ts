import Phaser from 'phaser';
import Game from 'modules/scenes/Game/Game';

const TILE_BASE_SIZE = 128;

const GAME_SIZE: { width: number, height: number } = {
  width: TILE_BASE_SIZE * 15,
  height: TILE_BASE_SIZE * 10,
};

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.CANVAS,
  width: GAME_SIZE.width,
  height: GAME_SIZE.height,
  physics: {
    default: 'arcade',
    arcade: {
      debug: true,
      debugVelocityColor: 0x7b00ff,
      debugBodyColor: 0x7b00ff,
      gravity: { y: 0 },
    },
  },
  scene: [Game],
  zoom: 0.5,
  antialias: false,
};

export default config;
