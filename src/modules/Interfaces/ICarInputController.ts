import Phaser from 'phaser';

export default interface ICarInputController {
  readonly controls: Phaser.Types.Input.Keyboard.CursorKeys;

  /**
   * Get axis input.
   */
  getAxis(): number;

  /**
   * Returns true if acceleration key is being pressed
   */
  isAccelerating(): boolean;

  /**
   * Returns true if breaking key is being pressed
   */
  isBraking(): boolean;

  /**
   * Return true if none of steering keys is being pressed
   */
  isIdling(): boolean;
}
