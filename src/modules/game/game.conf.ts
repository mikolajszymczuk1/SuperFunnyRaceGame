import Phaser from 'phaser';
import Game from 'modules/scenes/Game/Game';

const TILE_BASE_SIZE = 64;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.CANVAS,
  width: TILE_BASE_SIZE * 15,
  height: TILE_BASE_SIZE * 10,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
    },
  },
  scene: [Game],
};

export default config;
