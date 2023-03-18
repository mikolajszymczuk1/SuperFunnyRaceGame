import Phaser from 'phaser';
import EnvironmentEnum from 'modules/enums/EnvironmentEnum';

export default class Car extends Phaser.Physics.Arcade.Sprite {
  // Variable to acces delta in other functions without sendeing them as method argument
  private deltaTime: number;

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  // Turning speed fcator
  readonly TURN_SENSITIVITY = 10;

  // 15 degrees on steering wheel is 1 degree on tires
  readonly TURN_RATIO = 3;

  // Maximum steering wheel angle
  readonly MAX_STEERING_ANGLE = 180;

  // Angle that dont make efefct on steering
  readonly DEAD_ZONE = 0;

  // Left direction
  readonly LEFT = -1;

  // Right direction
  readonly RIGHT = 1;

  // Steering wheel angle, deg
  private steeringAngle = 0;

  // Only value, needs to be multiplied by direction
  private linearVelocity = 0;

  // Normalized direction veotor, combine it with linear velocity to get full speed vector
  private linearDirection = Phaser.Math.Vector2.RIGHT;

  private lateralDirection = Phaser.Math.Vector2.RIGHT;

  // Horse power
  private enginePower = 100;

  // Mass of the car
  private carMass = 1200;

  // Distance between front and rear axle (L)
  private wheelbase = 2;

  constructor(
    scene: Phaser.Scene,
    pos_x: number,
    pos_y: number,
    texture: string | Phaser.Textures.Texture,
    frame?: string | number,
  ) {
    super(scene, pos_x, pos_y, texture, frame);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.setCollideWorldBounds(true);
  }

  protected preUpdate(time: number, delta: number): void {
    this.deltaTime = delta / 1000;

    this.moveCar();
  }

  /** TODO: Add comment here */
  public moveCar(): void {
    const isSteerLeftDown = this.cursors.left.isDown;
    const isSteerRightDown = this.cursors.right.isDown;

    this.steeringAngle = Phaser.Math.Clamp(
      this.steeringAngle,
      -this.MAX_STEERING_ANGLE,
      this.MAX_STEERING_ANGLE,
    );

    this.steeringAngle += this.turnSteeringWheel(isSteerRightDown, isSteerLeftDown);
    const turnDirection = this.steeringAngle < 0 ? 1 : -1;

    this.linearDirection.rotate(Phaser.Math.DegToRad(this.angularVelocity()) * this.deltaTime);
    this.linearVelocity += this.accelerate() * this.deltaTime;

    this.lateralDirection = this.linearDirection.clone().rotate(
      Phaser.Math.DegToRad(-90 * turnDirection * this.lateralForce()),
    );

    const velocity = this.velocity();
    this.setVelocity(velocity.x, velocity.y);
    this.setRotation(this.linearDirection.angle());
  }

  /** TODO: Add comment here */
  private turnSteeringWheel(posAction: boolean, negAction: boolean): number {
    let sensitivity = this.TURN_SENSITIVITY;

    const turnDirection = Number(posAction) - Number(negAction);
    let angleDelta = sensitivity * turnDirection;

    if (turnDirection === 0 && this.steeringAngle !== 0) {
      sensitivity /= 1;
      angleDelta = Phaser.Math.Linear(-this.steeringAngle / sensitivity, 0, this.deltaTime);
    }
    return angleDelta;
  }

  /** Angular velocity methfos needs some rethink and better implementation */
  private turnRadius(): number {
    const theta = Phaser.Math.DegToRad(this.steeringAngle / this.TURN_RATIO);
    let radius = this.wheelbase / Math.sin(theta);
    if (radius === Infinity) {
      radius = 0;
    }

    return radius;
  }

  /** TODO: Add comment here */
  private angularVelocity(): number {
    const turnRadius = this.turnRadius();
    let angularVelocity = this.linearVelocity / turnRadius;

    if (turnRadius === 0) {
      angularVelocity = 0;
    }

    return angularVelocity;
  }

  /** TODO: Add comment here */
  private tireCornerringStiffness(): number {
    const B = 0.7;
    const C = 0.9;
    const D = 0.95;
    const E = 0.097;

    const a = this.tireSlipAngle();

    const stiffnes = D * Math.sin(
      C * Math.atan(
        B * a - E * (
          B * a - Math.atan(B * a)
        ),
      ),
    );
    return stiffnes;
  }

  /** TODO: Add comment here */
  private tireSlipAngle(): number {
    const angle = Math.atan(this.angularVelocity() / this.linearVelocity);
    return angle;
  }

  /** TODO: Add comment here */
  private lateralForce(): number {
    const tireStiffness = this.tireCornerringStiffness();
    const slipAngle = this.tireSlipAngle();

    const lateralForce = -tireStiffness * slipAngle;
    return lateralForce;
  }

  /** Works flawlessly */
  private accelerate(): number {
    const dragCoefficient = 0.45;
    const absVelocity = Math.abs(this.linearVelocity);
    const velocitySquared = this.linearVelocity ** 2;

    let engineForce = 0;
    if (this.cursors.up.isDown) {
      engineForce = this.enginePower * EnvironmentEnum.HP_TO_WATTS;
    }

    const frictionForce = EnvironmentEnum.ROAD_FRICTION * this.carMass * EnvironmentEnum.G;
    const airResistance = (EnvironmentEnum.AIR_DENSITY * dragCoefficient * velocitySquared) / 2;

    let brakingForce = 0;
    if (this.cursors.down.isDown && absVelocity > 0) {
      brakingForce = 10e5 * EnvironmentEnum.ROAD_FRICTION;
    }

    const forceApplied = engineForce - (frictionForce + airResistance + brakingForce);
    let acceleration = forceApplied / this.carMass;

    if (this.linearVelocity <= 0 && this.cursors.up.isUp) {
      this.linearVelocity = 0;
      acceleration = 0;
    }

    return acceleration;
  }

  /** Helper function */
  private velocity(): Phaser.Math.Vector2 {
    const linear = new Phaser.Math.Vector2(
      this.linearDirection.x,
      this.linearDirection.y,
    );

    const lateral = new Phaser.Math.Vector2(
      this.lateralDirection.x,
      this.lateralDirection.y,
    );

    const resultant = new Phaser.Math.Vector2(
      linear.x + lateral.x,
      linear.y + lateral.y,
    ).normalize();

    resultant.x *= this.linearVelocity;
    resultant.y *= this.linearVelocity;
    return resultant;
  }
}
