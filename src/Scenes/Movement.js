class Movement extends Phaser.Scene {
    constructor() {
        super("movementScene");
        this.my = {sprite: {}};  // Create an object to hold sprite bindings

        this.bodyX = 400;
        this.bodyY = 500;

        // Array to hold active projectiles
        this.projectiles = [];
    }

    preload() {
        this.load.setPath("./assets/");

        this.load.image("character", "panda.png");

        this.load.image("projectile", "projectile.png");
    }

    create() {
        let my = this.my;

        // player character
        my.sprite.character = this.add.sprite(this.bodyX, this.bodyY, "character");

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

        // movement : left
        if(this.aKey.isDown) {
            my.sprite.character.x -= 10;
        }

        // movement : right
        if(this.dKey.isDown) {
            my.sprite.character.x += 10;
        }

        // keep player from going off screen
        my.sprite.character.x = Phaser.Math.Clamp(
            my.sprite.character.x, 
            my.sprite.character.width/2, 
            800 - my.sprite.character.width/2
        );

        // shoot projectile
        if(Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            let proj = this.add.sprite(my.sprite.character.x, my.sprite.character.y, "projectile")
            proj.scale = 2;
            this.projectiles.push(proj);
        }

        // move all active projectiles
        for(let i = this.projectiles.length  - 1; i >= 0; i--) {
            let p = this.projectiles[i];
            p.y -= 2;

            if(p.y < -p.height){
                p.destroy();
                this.projectiles.splice(i, 1);
            }
        }
    }

}