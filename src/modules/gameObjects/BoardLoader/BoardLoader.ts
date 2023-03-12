import Phaser from 'phaser';

export default class BoardLoader {
  private map: Phaser.Tilemaps.Tilemap;

  constructor(
    scene: Phaser.Scene,
    spritesheetKey: string,
    tilesetName: string,
    mapKey: string,
    layers: string[],
  ) {
    this.map = scene.make.tilemap({ key: mapKey });
    const tileset = this.map.addTilesetImage(tilesetName, spritesheetKey);

    let layer: Phaser.Tilemaps.TilemapLayer;

    for (let i = 0; i < layers.length; i += 1) {
      layer = this.map.createLayer(layers[i], tileset, 0, 0);
    }

    layer.scale = 0.5;
  }
}
