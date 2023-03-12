import Phaser from 'phaser';
import Rect from 'modules/gameObjects/Rect/Rect';
import BoardLoader from 'modules/gameObjects/BoardLoader/BoardLoader';
import roads from 'assets/Roads/roadsSpritesheet.png';
import roadsData from 'assets/Roads/SuperFunnyRaceGameMap.json';

export default class Game extends Phaser.Scene {
  readonly TILEMAP_NAME = 'SuperFunnyRaceGameMap';

  private rect: Rect;

  private board: BoardLoader;

  constructor() {
    super('game');
  }

  preload(): void {
    this.load.image('roads', roads);
    this.load.tilemapTiledJSON('roadsMap', roadsData);
  }

  create(): void {
    this.board = new BoardLoader(this, 'roads', 'SuperFunnyRaceGameMap', 'roadsMap', ['Grass', 'Main']);
    this.rect = new Rect(this, 16, 16, 32, 32, 0xff0000);
  }
}
