import Phaser from 'phaser';

export default class Rect extends Phaser.GameObjects.Container {
  public scene: Phaser.Scene;

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  private rectSprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

  readonly SPEED = 400;

  readonly ROTATION_SPEED = 4;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
  ) {
    super(scene, x, y);
    this.scene = scene;
    this.rectSprite = scene.physics.add.sprite(x, y, 'car');
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.scene.add.existing(this);
  }

  /** Return sprite object */
  get sprite(): Phaser.Types.Physics.Arcade.SpriteWithDynamicBody {
    return this.rectSprite;
  }

  preUpdate(): void {
    this.detectInput();
  }

  /**
   * Update rect position on user input
   */
  detectInput(): void {
    this.rectSprite.setVelocity(0, 0);

    if (this.cursors.left.isDown) {
      this.rectSprite.setAngle(this.rectSprite.angle - this.ROTATION_SPEED);
    }

    if (this.cursors.right.isDown) {
      this.rectSprite.setAngle(this.rectSprite.angle + this.ROTATION_SPEED);
    }

    if (this.cursors.up.isDown) {
      const { vx, vy } = this.calculateNewVelocity();
      this.rectSprite.setVelocity(vx, vy);
    }

    if (this.cursors.down.isDown) {
      const { vx, vy } = this.calculateNewVelocity();
      this.rectSprite.setVelocity(-vx, -vy);
    }
  }

  /**
   * Check if rect doesn't go out of board (X position)
   * @returns true if rect is inside board (X position)
   */
  checkBoardEdgesX(newXVal: number): boolean {
    const { width } = this.scene.sys.canvas;
    return (newXVal - this.width / 2) > 0 && (newXVal + this.width / 2) < width;
  }

  /**
   * Check if rect doesn't go out of board (Y position)
   * @returns true if rect is inside board (Y position)
   */
  checkBoardEdgesY(newYVal: number): boolean {
    const { height } = this.scene.sys.canvas;
    return (newYVal - this.height / 2) > 0 && (newYVal + this.height / 2) < height;
  }

  /**
   * Return velocity based on sprite angle
   * @returns new velocity --> (vx, vy)
   */
  calculateNewVelocity(): { vx: number, vy: number } {
    const vec = this.scene.physics.velocityFromAngle(this.rectSprite.angle, 1);
    const newVx = vec.x * this.SPEED;
    const newVy = vec.y * this.SPEED;
    return { vx: newVx, vy: newVy };
  }
}
