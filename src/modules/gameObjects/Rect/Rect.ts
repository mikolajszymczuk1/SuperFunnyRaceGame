import Phaser from 'phaser';

export default class Rect extends Phaser.GameObjects.Rectangle {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  private speed = 200;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    fillColor: number,
  ) {
    super(scene, x, y, width, height, fillColor);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.cursors = scene.input.keyboard.createCursorKeys();
  }

  preUpdate(time: number, delta: number): void {
    const d = delta / 1000;

    if (this.cursors.up.isDown) {
      this.setY(this.y - (this.speed * d));
    }

    if (this.cursors.down.isDown) {
      this.setY(this.y + (this.speed * d));
    }

    if (this.cursors.left.isDown) {
      this.setX(this.x - (this.speed * d));
    }

    if (this.cursors.right.isDown) {
      this.setX(this.x + (this.speed * d));
    }
  }
}
