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

  private isOnTrack: boolean;

  private isOnTrackText: Phaser.GameObjects.Text;

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
    const tilesets = [{ tilesetName: 'roadsSpritesheet', spritesheetKey: 'roads' }];
    const layers = ['Grass', 'Roads'];
    this.board = new BoardLoader(this, tilesets, 'roadsMap', layers);
    const [grassLayer, roadsLayer] = this.board.loadLayers();

    // Debug texts
    this.isOnTrackText = this.add.text(25, 25, '', { fontFamily: 'Arial', color: '#000000', fontSize: '35px' });

    // Load car span point
    const {
      width, height, x, y,
    } = this.board.loadSpawnPoint();

    this.car = new Car(this, x + width / 2, y + height / 2, 'car');
    this.physics.add.overlap(this.car, roadsLayer, (carPlayer, roadTile) => this.checkIfOffRoad(carPlayer, roadTile));
  }

  checkIfOffRoad(carPlayer: any, roadTile: any): void {
    if (roadTile.index !== -1) {
      this.isOnTrackText.text = 'Is on track: true';
    } else {
      this.isOnTrackText.text = 'Is on track: false';
    }
  }
}
