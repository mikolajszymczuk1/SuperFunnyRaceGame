import Phaser from 'phaser';

export default class Car extends Phaser.Physics.Arcade.Sprite {
  // Variable to acces delta in other functions without sendeing them as method argument
  private deltaTime: number;

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  // Turning speed fcator
  readonly TURN_SENSITIVITY = 1;

  // 15 degrees on steering wheel is 1 degree on tires
  readonly TURN_RATIO = 15;

  // Maximum steering wheel angle
  readonly MAX_STEERING_ANGLE = 1080;

  // Steering wheel angle, deg
  private steeringAngle = 0;

  // Only value, needs to be multiplied by direction
  private linearVelocity = 0;

  // Normalized direction veotor, combine it with linear velocity to get full speed vector
  private linearDirection = Phaser.Math.Vector2.RIGHT;

  // Horse power
  private enginePower = 900;

  // Mass of the car
  private carMass = 1000;

  // Distance between front and rear axle (L)
  private wheelbase = 1; // m

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
  }

  protected preUpdate(time: number, delta: number): void {
    this.deltaTime = delta / 1000;

    const leftKeyDown = this.cursors.left.isDown;
    const rightKeyDown = this.cursors.right.isDown;

    const changeBy = this.turnSteeringWheel(leftKeyDown, rightKeyDown, delta);
    if (changeBy === 0) {
      this.steeringAngle = 0;
    }

    this.steeringAngle += this.turnSteeringWheel(leftKeyDown, rightKeyDown, delta);
    this.steeringAngle = Phaser.Math.Clamp(
      this.steeringAngle,
      -this.MAX_STEERING_ANGLE,
      this.MAX_STEERING_ANGLE,
    );

    if (Phaser.Math.Within(this.steeringAngle, 0, 10)) {
      this.steeringAngle = 0;
    }

    this.linearDirection.rotate(Phaser.Math.DegToRad(this.angularVelocity()) * this.deltaTime);
    this.linearVelocity += this.accelerate() * this.deltaTime;
    const vel = this.velocity();
    this.setVelocity(vel.x, vel.y);
    this.setRotation(this.linearDirection.angle());
  }

  /** TODO: Add comment here */
  private turnSteeringWheel(posAction: boolean, negAction: boolean, dt: number): number {
    const LEFT = -1;
    const RIGHT = 1;

    let turnDirection = -Number(posAction) + Number(negAction);
    if (turnDirection === 0 && this.steeringAngle !== 0) {
      const sign = this.steeringAngle < 0 ? LEFT : RIGHT;
      turnDirection = sign * -1;
      turnDirection = 0;
    }
    const angleDelta = this.TURN_SENSITIVITY * turnDirection * dt;
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
    // const linearX = this.linearVelocity * this.linearDirection.x;
    // const linearY = this.linearVelocity * this.linearDirection.y;
    // let angularVelocity = new Phaser.Math.Vector2(linearX / turnRadius, linearY / turnRadius);

    if (turnRadius === 0) {
      angularVelocity = 0;
    }

    return angularVelocity;
  }

  /** Workd flawlessly */
  private accelerate(): number {
    const G = 9.81;
    const HP_TO_WATTS = 746;
    const airDensity = 1.225;
    const friction = 0.8;
    const dragCoefficient = 10;
    const absVelocity = Math.abs(this.linearVelocity);
    const velocitySquared = this.linearVelocity ** 2;

    let engineForce = 0;
    if (this.cursors.up.isDown) {
      engineForce = this.enginePower * HP_TO_WATTS;
    }
    const frictionForce = friction * this.carMass * G;
    const airResistance = (airDensity * dragCoefficient * velocitySquared) / 2;

    let brakingForce = 0;
    if (this.cursors.down.isDown && absVelocity > 0) {
      brakingForce = 10e4 * friction;
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
    const velocity = new Phaser.Math.Vector2(
      this.linearDirection.x * this.linearVelocity,
      this.linearDirection.y * this.linearVelocity,
    );
    return velocity;
  }
}
