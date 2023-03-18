import Phaser from 'phaser';
// import EnvironmentEnum from 'modules/enums/EnvironmentEnum';
// import CarConfigEnum from 'modules/enums/CarConfigEnum';
import CarInputController from './CarInputController';
import CarSteering from './CarSteering';
import CarEngine from './CarEngine';
import CarPhysics from './CarPhysics';

export default class Car extends Phaser.Physics.Arcade.Sprite {
  // Variable to acces delta in other functions without sendeing them as method argument
  private deltaTime: number;

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  private carSteeringController: CarInputController;

  private carSteering: CarSteering;

  private carEngine: CarEngine;

  private carPhysics: CarPhysics;

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

    this.carSteeringController = new CarInputController(this.cursors);
    this.carEngine = new CarEngine(240);
    this.carSteering = new CarSteering(0.016, this.carSteeringController);
    this.carPhysics = new CarPhysics(
      Phaser.Math.Vector2.RIGHT,
      this.carEngine,
      this.carSteering,
      this.carSteeringController,
    );
    this.setCollideWorldBounds(true);
  }

  protected preUpdate(time: number, delta: number): void {
    this.deltaTime = delta / 1000;

    this.carSteering.update(this.deltaTime);
    const velocity = this.carPhysics.updateVelocity(this.deltaTime);
    this.setVelocity(velocity.x, velocity.y);
    this.setAngle(Phaser.Math.RadToDeg(this.carPhysics.getCarDirection().angle()));
  }
}
