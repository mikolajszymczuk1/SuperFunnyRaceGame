import Phaser from 'phaser';
import Car from 'modules/gameObjects/Car/Car';
import BoardLoader from 'modules/gameObjects/BoardLoader/BoardLoader';
import roads from 'assets/Roads/roadsSpritesheet.png';
import car from 'assets/Cars/carRed.png';
import roadsData from 'assets/Roads/SuperFunnyRaceGameMap.json';

export default class Game extends Phaser.Scene {
  readonly TILEMAP_NAME = 'SuperFunnyRaceGameMap';

  private car: Car;

  private board: BoardLoader;

  constructor() {
    super('game');
  }

  preload(): void {
    this.load.image('roads', roads);
    this.load.image('car', car);
    this.load.tilemapTiledJSON('roadsMap', roadsData);
  }

  create(): void {
    // Create board and load layers
    this.board = new BoardLoader(this, 'roads', 'SuperFunnyRaceGameMap', 'roadsMap', ['Grass', 'Walls', 'Roads']);
    const [grass, walls, main] = this.board.loadLayers();
    walls.setCollisionByExclusion([-1]);

    // Load car span point
    const {
      width, height, x, y,
    } = this.board.loadSpawnPoint();

    this.car = new Car(this, x + width / 2, y + height / 2, 'car');
    this.physics.add.collider(this.car, walls);
  }
}
