import Phaser from 'phaser';
import Rect from 'modules/gameObjects/Rect/Rect';

export default class Game extends Phaser.Scene {
  private rect: Rect;

  constructor() {
    super('game');
  }

  create(): void {
    const rect = new Rect(this, 50, 50, 100, 100, 0xff0000);
  }
}
