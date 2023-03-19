import Phaser from 'phaser';
import TilesetConf from 'modules/types/TilesetConf';

export default class BoardLoader {
  private map: Phaser.Tilemaps.Tilemap;

  private layers: string[] = [];

  private tilesets: Phaser.Tilemaps.Tileset[] = [];

  constructor(scene: Phaser.Scene, tilesets: TilesetConf[], mapKey: string, layers: string[]) {
    this.map = scene.make.tilemap({ key: mapKey });
    this.layers = layers;

    // Generate tileset based on tilests array
    tilesets.forEach((singleTileset) => {
      this.tilesets.push(this.map.addTilesetImage(singleTileset.tilesetName, singleTileset.spritesheetKey));
    });
  }

  loadLayers(): Phaser.Tilemaps.TilemapLayer[] {
    const tileLayers: Phaser.Tilemaps.TilemapLayer[] = [];

    // Load base layers
    for (let i = 0; i < this.layers.length; i += 1) {
      const layer = this.map.createLayer(this.layers[i], this.tilesets, 0, 0);
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
