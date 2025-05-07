class Game extends Phaser.Scene {
    constructor() {

        super("gameScene");

        // hold sprite and bitmap text bindings
        this.my = {sprite: {}, text: {}};


        // where sprites are loaded on page
        this.playerX = 480;
        this.playerY = 435;


        // Array to hold active projectiles 
        this.projectiles = [];


        // Array to hold food projectiles player emmits 
        this.my.sprite.food = [];
        this.maxFood = 10;
    }

    preload() {
        this.load.setPath("./assets/");


        // load in map background
        this.load.image("tiny_town_tiles", "kenny-tiny-town-tilemap-packed.png");
        this.load.tilemapTiledJSON("map", "ZooMap.json");
        

        // load in animal characters
        this.load.image("panda", "panda.png");
        // this.load.image("monkey", "monkey.png");
        // this.load.image("rabbit", "rabbit.png");
        // this.load.image("snake", "snake.png");


        // load in player character
        this.load.image("defaultFace", "head.png");
        this.load.image("hair", "headBack.png");
        this.load.image("hurtFace", "headShock.png");


        // load in food profectiles
        this.load.image("sushi", "Lsushi.png");


        // record player score
        this.playerScore = 0;


        // load font for score 
        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");
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


        // add in animals + score value
        my.sprite.panda = this.add.sprite(game.config.width/2, game.config.height - 400, "panda");
        my.sprite.panda.setScale(0.40);
        my.sprite.panda.scorePoints = 25;


        // container to hold player sprite together at position
        this.playerContainer = this.add.container(this.playerX, this.playerY, [
            this.hair,
            this.defaultFace,
            this.hurtFace
        ]);
        this.hurtFace.visible = false;


        // key input objects
        this.left = this.input.keyboard.addKey("A");
        this.right = this.input.keyboard.addKey("D");
        this.nextScene = this.input.keyboard.addKey("S");
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);


        // Set movement speeds (in pixels/tick)
        this.playerSpeed = 10;
        this.foodSpeed = 8;


        // Put score on screen
        my.text.score = this.add.bitmapText(750, 0, "rocketSquare", "Score " + this.playerScore);

        // HTML controls description
        // document.getElementById('description').innerHTML = '<h2>CONTROLS</h2><br>A: left // D: right // Space: fire/emit food'
    }

    update() {
        let my = this.my;

        // player movement : left
        if(this.left.isDown) {
            if(this.playerContainer.x > (this.playerContainer.displayWidth / 2)) {
                this.playerContainer.x -= this.playerSpeed;
            }
        }


        // player movement : right
        if(this.right.isDown) {
            if(this.playerContainer.x < (game.config.width - (this.playerContainer.displayWidth / 2))) {
                this.playerContainer.x += this.playerSpeed;
            }
        }


        // player action : shooting food
        if(Phaser.Input.Keyboard.JustDown(this.space)) {
            if(my.sprite.food.length < this.maxFood) {
                my.sprite.food.push(this.add.sprite(this.playerContainer.x, this.playerContainer.y - (this.playerContainer.displayHeight / 2), "sushi"));
            }
        }


        // move all active food projectiles
        for(let food of my.sprite.food) {
            food.y -= this.foodSpeed;
        }


        // remove all offscreen projectiles 
        my.sprite.food = my.sprite.food.filter((food) => food.y > -(food.displayHeight/2));


        // check for food collision with animals
        for(let food of my.sprite.food) {
            if(this.collides(my.sprite.panda, food)) {
                food.y = -100;
                my.sprite.panda.x = -100;
                my.sprite.panda.visible = false;
                this.playerScore += my.sprite.panda.scorePoints;
                this.updateScore();
            }
        }

    }


    // collision detection function
    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }


    // update player score function
    updateScore() {
        let my = this.my;
        my.text.score.setText("Score " + this.playerScore);
    }

}