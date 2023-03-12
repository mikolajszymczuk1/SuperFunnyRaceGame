import Phaser from 'phaser';

export default class BoardLoader {
  private map: Phaser.Tilemaps.Tilemap;

  private layers: string[];

  private tileset: Phaser.Tilemaps.Tileset;

  constructor(
    scene: Phaser.Scene,
    spritesheetKey: string,
    tilesetName: string,
    mapKey: string,
    layers: string[],
  ) {
    this.map = scene.make.tilemap({ key: mapKey });
    this.layers = layers;
    this.tileset = this.map.addTilesetImage(tilesetName, spritesheetKey);
  }

  loadLayers(): Phaser.Tilemaps.TilemapLayer[] {
    const tileLayers: Phaser.Tilemaps.TilemapLayer[] = [];

    // Load base layers
    for (let i = 0; i < this.layers.length; i += 1) {
      const layer = this.map.createLayer(this.layers[i], this.tileset, 0, 0);
      tileLayers.push(layer);
    }

    return tileLayers;
  }

  loadSpawnPoint(): Phaser.Types.Tilemaps.TiledObject {
    // Create spawn object
    const [spawnPoints] = this.map.objects;
    const [mainSpawnPoint] = spawnPoints.objects;
    return mainSpawnPoint;
  }

  getMap(): Phaser.Tilemaps.Tilemap {
    return this.map;
  }
}
