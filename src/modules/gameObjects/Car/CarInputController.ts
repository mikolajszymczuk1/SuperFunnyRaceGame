import Phaser from 'phaser';
import ICarInputController from 'modules/Interfaces/ICarInputController';

export default class CarInputController implements ICarInputController {
  constructor(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
    this.controls = cursors;
  }

  readonly controls: Phaser.Types.Input.Keyboard.CursorKeys;

  public getAxis(): number {
    const isRightDown = this.controls.right.isDown;
    const isLeftDown = this.controls.left.isDown;
    return Number(isRightDown) - Number(isLeftDown);
  }

  public isAccelerating(): boolean {
    return this.controls.up.isDown;
  }

  public isBraking(): boolean {
    return this.controls.down.isDown;
  }

  public isIdling(): boolean {
    return !(this.isAccelerating() || this.isBraking());
  }
}
