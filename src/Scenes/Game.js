class Game extends Phaser.Scene {
    constructor() {

        super("gameScene");
        this.my = {sprite: {}};  // Create an object to hold sprite bindings

        // where sprites are loaded on page
        this.playerX = 480;
        this.playerY = 435;

        // Array to hold active projectiles
        this.projectiles = [];
    }

    preload() {
        this.load.setPath("./assets/");

        // load in map background
        this.load.image("tiny_town_tiles", "kenny-tiny-town-tilemap-packed.png");
        this.load.tilemapTiledJSON("map", "ZooMap.json");   

        // load in player character
        this.load.image("defaultFace", "head.png");
        this.load.image("hair", "headBack.png");
        this.load.image("hurtFace", "headShock.png");

        // load in food profectiles
        this.load.image("projectile", "projectile.png");
    }

    create() {
        let my = this.my;
        // add in tile map
        this.map = this.add.tilemap("map", 16, 16, 62, 37);
        this.tileset = this.map.addTilesetImage("tiny-town-packed", "tiny_town_tiles");

        this.grassLayer = this.map.createLayer("Grass-n-Paths", this.tileset, 0, 0);
        this.plantsLayer = this.map.createLayer("Plants-n-Stones", this.tileset, 0, 0);
        this.treesLayer = this.map.createLayer("Trees", this.tileset, 0, 0);
        this.grassLayer.setScale(2.0);
        this.plantsLayer.setScale(2.0);
        this.treesLayer.setScale(2.0);

        // add in player character
        this.defaultFace = this.add.sprite(0, 0, "defaultFace");
        this.hair = this.add.sprite(0, 0, "hair");
        this.hurtFace = this.add.sprite(0, 0, "hurtFace");

        // container to hold sprite together at position
        this.playerContainer = this.add.container(this.playerX, this.playerY, [
            this.hair,
            this.defaultFace,
            this.hurtFace
        ]);
        this.hurtFace.visible = false;



        // player character
        // my.playerContainer = this.add.sprite(this.bodyX, this.bodyY, "character");

        /* projectile sprite
        my.sprite.projectile = this.add.sprite(this.bodyX, this.bodyY, "projectile");
        my.sprite.projectile.scale = 2;
        my.sprite.projectile.visible = false;
        */

        // key objects for inputs
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update() {
        let my = this.my;

        // player movement : left
        if(this.aKey.isDown) {
            this.playerContainer.x -= 16;
        }

        // player movement : right
        if(this.dKey.isDown) {
            this.playerContainer.x += 16;
        }

        // keep player from going off screen
        const characterWidth = this.defaultFace.width * this.playerContainer.scaleX;
        console.log(characterWidth);
        this.playerContainer.x = Phaser.Math.Clamp(
            this.playerContainer.x, 
            characterWidth / 2, 
            960 - characterWidth / 2
        );

        // shoot projectiles
        if(Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            let proj = this.add.sprite(this.playerContainer.x, this.playerContainer.y, "projectile")
            proj.scale = 2;
            this.projectiles.push(proj);
        }

        // move all active projectiles
        for(let i = this.projectiles.length - 1; i >= 0; i--) {
            let p = this.projectiles[i];
            p.y -= 2;

            if(p.y < -p.height){
                p.destroy();
                this.projectiles.splice(i, 1);
            }
        }
    }

}