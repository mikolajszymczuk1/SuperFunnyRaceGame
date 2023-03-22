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
   * Direction at which car is heading, determines diirections of all other forces
   */
  public carDirection: Phaser.Math.Vector2;

  /**
   * Velocity at which tire s traveling
   */
  private tireVelocity: Phaser.Math.Vector2;

  /**
   * Velocity at which car traveling
   */
  private carVelocity: Phaser.Math.Vector2;

  /**
   * Net velocity
   */
  private netVelocity: Phaser.Math.Vector2;

  constructor(
    upVector: Phaser.Math.Vector2,
    carEngine: CarEngine,
    carSteering: CarSteering,
    inputController: CarInputController,
  ) {
    this.carDirection = upVector;

    this.carVelocity = new Phaser.Math.Vector2(0, 0);
    this.tireVelocity = new Phaser.Math.Vector2(0, 0);

    this.inputController = inputController;
    this.carEngine = carEngine;
    this.carSteering = carSteering;
  }

  public getCarDirection(): Phaser.Math.Vector2 {
    return this.carDirection;
  }

  public getVelocity(): Phaser.Math.Vector2 {
    // return this.netVelocity;
    return this.carVelocity;
  }

  public update(deltaTime: number) {
    // this.tireVelocity.add(this.netForce().scale(deltaTime));
    // this.carVelocity = this.tireVelocity.clone().add(this.carVelocity);
    // this.carDirection = Phaser.Math.Vector2.RIGHT;
    if (this.angularForce().length() !== 0) {
      this.carDirection.rotate(this.angularForce()
        .angle() * deltaTime * this.inputController.getAxis());
    }

    this.carVelocity.add(this.netForce().scale(deltaTime));

    // console.log(this.carDirection);
    // console.log(this.carVelocity.length());
    // console.log(this.angularForce().angle());
  }

  public netForce(): Phaser.Math.Vector2 {
    const netForce = this.appliedForce()
      .add(this.frictionForce())
      .add(this.dragForce());

    const velocity = this.carVelocity.clone().add(netForce.scale(1 / CarConfigEnum.CAR_MASS));
    return velocity;
  }

  /**
   * Car is accelerating correspondingly to tire direction
   * @returns Acceleration force
   */
  private appliedForce(): Phaser.Math.Vector2 {
    const direction = this.carDirection.clone();
    // this.carDirection.clone().rotate(
    //   this.carSteering.getTireAngleRad(),
    // );
    let factor = 0;

    if (this.inputController.isAccelerating()) {
      factor = this.carEngine.getEngineForce();
    } else if (this.inputController.isIdling()) {
      factor = 0;
    } else if (this.inputController.isBraking()) {
      factor = -10e3;
    }

    const appliedVector = direction.scale(factor);
    return appliedVector;
  }

  private frictionForce(): Phaser.Math.Vector2 {
    const direction = this.carVelocity.clone().rotate(
      Math.PI,
    );

    const normalForce = CarPhysics.normalForce();

    const frictionVector = direction.scale(normalForce * EnvironmentEnum.ROAD_FRICTION);
    return frictionVector;
  }

  private dragForce(): Phaser.Math.Vector2 {
    const direction = this.carVelocity.clone().rotate(
      Math.PI,
    );

    const rho = EnvironmentEnum.AIR_DENSITY;
    const vSquared = this.carVelocity.clone().dot(this.carVelocity);
    const cr = CarConfigEnum.DRAG_COEFFICIENT;

    const factor = (rho * vSquared * cr) / 2;
    const dragVector = direction.scale(factor);
    return dragVector;
  }

  private centripetalForce(): Phaser.Math.Vector2 {
    const direction = this.carVelocity.clone()
      .rotate((Math.PI / 2) * this.inputController.getAxis());
    const vSquared = this.carVelocity.clone().dot(this.carVelocity);
    const turnRadius = this.turnRadius();

    if (turnRadius === Infinity) {
      return direction.scale(0);
    }
    const factor = (CarConfigEnum.CAR_MASS * vSquared) / turnRadius;
    const centripetalVector = direction.scale(factor);
    return centripetalVector;
  }

  private centrifugalForce(): Phaser.Math.Vector2 {
    const centrifugalVector = this.centripetalForce().clone().rotate(Math.PI);
    return centrifugalVector;
  }

  private lateralForce(): Phaser.Math.Vector2 {
    const direction = this.carVelocity.clone()
      .rotate((Math.PI / 2) * this.inputController.getAxis());
    const normalForce = CarPhysics.normalForce();
    const theta = Math.atan2(this.carVelocity.y, this.carVelocity.x);
    return direction.scale(EnvironmentEnum.ROAD_FRICTION * normalForce * Math.tan(theta));
  }

  private angularForce(): Phaser.Math.Vector2 {
    const direction = this.carVelocity.clone()
      .rotate((Math.PI / 2) * this.inputController.getAxis());
    let factor = this.carVelocity.clone().length() / this.turnRadius();

    if (this.turnRadius() === Infinity) {
      factor = 0;
    }

    const angularVector = direction.scale(factor);
    return angularVector;
  }

  private turnRadius(): number {
    const vSquared = this.carVelocity.dot(this.carVelocity);
    const lateralAcceleration = this.lateralForce().length() / CarConfigEnum.CAR_MASS;
    const turnRadius = vSquared / lateralAcceleration;
    // if (turnRadius < CarConfigEnum.WHEELBASE || this.inputController.getAxis() === 0) {
    //   turnRadius = Infinity;
    // }
    return turnRadius;
    // const theta = this.carSteering.getTireAngleRad();
    // const turnRadius = 1 / Math.sin(theta);
    // console.log(turnRadius);
    // return turnRadius;
  }

  static normalForce(): number {
    return CarConfigEnum.CAR_MASS * EnvironmentEnum.G;
  }
}
