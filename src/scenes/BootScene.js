export class BootScene extends Phaser.Scene {

    constructor() {
        super('BootScene');
    }

    preload() {
        // тайлы для карты
        this.load.image('tiles', 'assets/spritesheet.png');
        // карта json формате
        this.load.tilemapTiledJSON('map', 'assets/map.json');
        // наши два персонажа
        this.load.spritesheet('player', 'assets/RPG_assets.png', {frameWidth: 16, frameHeight: 16});
        this.load.image('dragonblue', 'assets/dragonblue.png');
        this.load.image('dragonorrange', 'assets/dragonorrange.png');
    }

    create() {
        var map = this.make.tilemap({key: 'map'});
        //this.scene.start('WorldScene');
        this.scene.start('WorldScene');
    }

    update() {
        
    }
    
}
