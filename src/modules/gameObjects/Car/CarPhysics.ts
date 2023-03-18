import Phaser from 'phaser';
import CarConfigEnum from 'modules/enums/CarConfigEnum';
import EnvironmentEnum from 'modules/enums/EnvironmentEnum';
import CarInputController from './CarInputController';
import CarSteering from './CarSteering';
import CarEngine from './CarEngine';

export default class CarPhysics {
  private inputController: CarInputController;

  private carEngine: CarEngine;

  private carSteering: CarSteering;

  /**
   * Directtion the car is heading, same as acceleration direction
   */
  public carDirection: Phaser.Math.Vector2;

  private velocity: Phaser.Math.Vector2;

  /**
   * Acceleration direction
   */
  private accelerationDir: Phaser.Math.Vector2;

  /**
   * Acceleration length in SI
   */
  private accelerationFactor: number;

  /**
   * Force of friction
   */
  private frictionDir: Phaser.Math.Vector2;

  /**
   * Friction factor
   */
  private frictionFactor: number;

  /**
   * Drag Force
   */
  private dragDir: Phaser.Math.Vector2;

  /**
   * Drag factor
   */
  private dragFactor: number;

  /**
   * Centripetal force
   */
  private centripetalDir: Phaser.Math.Vector2;

  /**
   * Centripetal factor
   */
  private centripetalFactor: number;

  /**
   * lateral slip force
   */
  private lateralDir: Phaser.Math.Vector2;

  private lateralFactor: number;

  constructor(
    upVector: Phaser.Math.Vector2,
    carEngine: CarEngine,
    carSteering: CarSteering,
    inputController: CarInputController,
  ) {
    this.carDirection = upVector;
    this.accelerationDir = this.carDirection.clone().rotate(0);
    this.frictionDir = this.carDirection.clone().rotate(Math.PI);
    this.dragDir = this.carDirection.clone().rotate(Math.PI);
    this.centripetalDir = this.carDirection.clone().rotate(Math.PI / 2);
    this.lateralDir = this.carDirection.clone().rotate(-Math.PI / 2);

    this.velocity = Phaser.Math.Vector2.ZERO.clone();

    this.carEngine = carEngine;
    this.carSteering = carSteering;

    this.inputController = inputController;
  }

  public getCarDirection(): Phaser.Math.Vector2 {
    return this.carDirection;
  }

  public updateVelocity(dt: number): Phaser.Math.Vector2 {
    this.updateCarRotattion();

    const velocity = this.netForce().scale(1 / CarConfigEnum.CAR_MASS);
    this.velocity = velocity;

    return this.velocity;
  }

  public netForce(): Phaser.Math.Vector2 {
    const accelerationForce = this.accelerationForce();
    const frictionForce = this.frictionForce();
    const dragForce = this.dragForce();
    const centripetalForce = this.centripetalForce();
    const lateralForce = this.lateralForce();

    let netForce = new Phaser.Math.Vector2(0, 0);
    if (this.inputController.isAccelerating()) {
      netForce.add(accelerationForce);
      netForce.add(frictionForce);
      netForce.add(dragForce);
      netForce.add(centripetalForce);
      netForce.add(lateralForce);
    } else if (this.inputController.isIdling()) {
      netForce.add(frictionForce);
      netForce.add(dragForce);
      netForce.add(centripetalForce);
      netForce.add(lateralForce);
      if (Phaser.Math.Fuzzy.Equal(this.velocity.angle(), this.dragDir.angle(), 0.5)
      || this.velocity.length() === 0) {
        this.velocity = Phaser.Math.Vector2.ZERO;
        netForce = Phaser.Math.Vector2.ZERO;
      }
    }
    return netForce;
  }

  private updateCarRotattion(): void {
    this.carDirection.rotate(this.carSteering.getTireAngleRad());
  }

  /**
   * Combines direciton with factor to get acceleration vector,
   * also updates directional and factor params
   * @returns Acceleration force
   */
  private accelerationForce(): Phaser.Math.Vector2 {
    this.accelerationDir.setAngle(this.carDirection.angle());
    this.accelerationFactor = this.carEngine.getEngineForce();

    const accelerationForce = this.accelerationDir.clone().scale(this.accelerationFactor);
    return accelerationForce;
  }

  private frictionForce(): Phaser.Math.Vector2 {
    this.frictionDir.setAngle(this.carDirection.angle() + Math.PI);
    this.frictionFactor = EnvironmentEnum.ROAD_FRICTION * CarPhysics.normalForce();

    const frictionForce = this.frictionDir.clone().scale(this.frictionFactor);
    return frictionForce;
  }

  private dragForce(): Phaser.Math.Vector2 {
    this.dragDir.setAngle(this.carDirection.angle() + Math.PI);
    const rho = EnvironmentEnum.AIR_DENSITY;
    const vSquared = this.velocity.dot(this.velocity);
    const cDrag = CarConfigEnum.DRAG_COEFFICIENT;
    this.dragFactor = (rho * vSquared * cDrag) / 2;

    const dragForce = this.dragDir.clone().scale(this.dragFactor);
    return dragForce;
  }

  private centripetalForce(): Phaser.Math.Vector2 {
    this.centripetalDir.setAngle(this.carDirection.angle() + Math.PI / 2);
    const vSquared = this.velocity.dot(this.velocity);
    const turnRadius = this.turnRadius();
    this.centripetalFactor = (CarConfigEnum.CAR_MASS * vSquared) / turnRadius;
    if (turnRadius === Infinity || turnRadius === -Infinity) {
      this.centripetalFactor = 0;
    }

    const centripetalForce = this.centripetalDir.clone().scale(this.centripetalFactor);
    return centripetalForce;
  }

  private lateralForce(): Phaser.Math.Vector2 {
    this.lateralDir.setAngle(this.carDirection.angle() - Math.PI / 2);
    const normalForce = CarPhysics.normalForce();
    const theta = Math.atan2(this.velocity.y, this.velocity.x);
    this.lateralFactor = EnvironmentEnum.ROAD_FRICTION * normalForce * Math.tan(theta);

    const lateralForce = this.lateralDir.clone().scale(this.lateralFactor);
    return lateralForce;
  }

  private turnRadius(): number {
    const vSquared = this.velocity.dot(this.velocity);
    const lateralAcceleration = this.lateralForce().length() / CarConfigEnum.CAR_MASS;

    const turnRadius = vSquared / lateralAcceleration;
    return turnRadius;
    // return CarConfigEnum.WHEELBASE / Math.sin(this.carSteering.getTireAngleRad());
  }

  static normalForce(): number {
    return CarConfigEnum.CAR_MASS * EnvironmentEnum.G;
  }
}
