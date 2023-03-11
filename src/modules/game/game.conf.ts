import Phaser from 'phaser';
import Game from '../scenes/Game/Game';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.CANVAS,
  width: 800,
  height: 640,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
    },
  },
  scene: [Game],
};

export default config;
