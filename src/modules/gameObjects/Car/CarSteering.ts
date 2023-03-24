import CarConfigEnum from 'modules/enums/CarConfigEnum';
import Phaser from 'phaser';
import CarInputController from './CarInputController';

export default class CarSteering {
  readonly inputController: CarInputController;

  /** Wheel angle */
  private wheelAngle: number;

  /** Tire angle */
  private tireAngle: number;

  /** How fast will wheel return to natural position */
  private wheelReturnSpeed: number;

  constructor(wheelReturnSpeed: number, controler: CarInputController) {
    this.tireAngle = 0;
    this.wheelAngle = 0;

    this.inputController = controler;
    this.wheelReturnSpeed = Phaser.Math.Clamp(wheelReturnSpeed, 0, 1);
  }

  public getWheelAngle(): number {
    return this.wheelAngle;
  }

  public getTireAngle(): number {
    return this.tireAngle;
  }

  public getWheelAngleRad(): number {
    const wheelAngleRad = Phaser.Math.DegToRad(this.wheelAngle);
    return wheelAngleRad;
  }

  public getTireAngleRad(): number {
    const tireAngleRad = Phaser.Math.DegToRad(this.tireAngle);
    return tireAngleRad;
  }

  /**
   * updates all params in class
   * @param dt delta time
   */
  public update(dt: number): void {
    // this.wheelAngle += this.wheelInputDelta() * dt;
    this.wheelInputDelta(dt);
    this.clampWheelAngle();
    this.updateTireAngle();
  }

  /**
   * changed for testing purposes, will set to max possible amount
   * @returns by how much wheel angle will change with given input
   */
  private wheelInputDelta(deltaTime: number): number {
    // const axis = this.inputController.getAxis();
    // let angleDelta: number;
    // if (axis === 0 && this.wheelAngle !== CarConfigEnum.DEAD_ZONE) {
    //   const CENTER_ANGLE = 0;
    //   angleDelta = Phaser.Math.Linear(-this.wheelAngle, CENTER_ANGLE, this.wheelReturnSpeed);
    // } else {
    //   angleDelta = axis * CarConfigEnum.TURN_SENSITIVITY;
    // }
    // return angleDelta;

    const axis = this.inputController.getAxis();
    if (axis === 0) {
      this.wheelAngle = 0;
    } else if (axis === -1) {
      this.wheelAngle = -CarConfigEnum.MAX_WHEEL_ANGLE * deltaTime;
    } else if (axis === 1) {
      this.wheelAngle = CarConfigEnum.MAX_WHEEL_ANGLE * deltaTime;
    }
    return this.wheelAngle;
  }

  /**
   * sets and returns tire angle
   * @returns tire angle
   */
  private updateTireAngle(): number {
    this.tireAngle = this.wheelAngle / CarConfigEnum.TURN_RATIO;
    return this.tireAngle;
  }

  /**
   * Sets and returns clamped wheel angle
   * @returns clamped wheel angle
   */
  private clampWheelAngle(): number {
    this.wheelAngle = Phaser.Math.Clamp(
      this.wheelAngle,
      -CarConfigEnum.MAX_WHEEL_ANGLE,
      CarConfigEnum.MAX_WHEEL_ANGLE,
    );
    return this.wheelAngle;
  }
}
