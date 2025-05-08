class Game extends Phaser.Scene {
    constructor() {

        super("gameScene");

        // hold sprite and bitmap text bindings
        this.my = {sprite: {}, text: {}};


        // where sprites are loaded on page
        this.playerX = 480;
        this.playerY = 435;


        // array to hold food projectiles player emmits 
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
        this.load.image("monkey", "monkey.png");
        this.load.image("rabbit", "rabbit.png");
        this.load.image("snake", "snake.png");


        // load in player character
        this.load.image("defaultFace", "head.png");
        this.load.image("hair", "headBack.png");
        this.load.image("hurtFace", "headShock.png");


        // load in profectiles
            // food - player emitted
        this.load.image("sushi", "Lsushi.png");
            // stick - animal emitted
        this.load.image("stick", "stick.png");

        // record player score
        this.playerScore = 0;

        // wave level
        this.waveLevel = 1;
        this.maxWaves = 2;
    
    }



    create() {
        let my = this.my;

        // Set movement speeds (in pixels/tick), player health, and animal path positions (rows)
        this.playerSpeed = 10;
        this.foodSpeed = 15;
        this.playerHealth = 3;;

        const rowOne = 100;
        const rowTwo = 200;
        const rowThree = 300;


        // reference to html text element
        // game mechanic states will displayed outside of the game canvas
        this.ui = {
            health: document.getElementById("health"),
            score: document.getElementById("score"),
            wave: document.getElementById("wave")
        };


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


        // container to hold player sprite together at position
        this.playerContainer = this.add.container(this.playerX, this.playerY, [
            this.hair,
            this.defaultFace,
            this.hurtFace
        ]);
        this.hurtFace.visible = false;


        // add in animals + score value
        // array to hold animals / enemies sprites
        this.my.sprite.animals = [];

        this.spawnRow("panda", rowOne, 3, "panda", 4, 25);
        this.spawnRow("monkey", rowTwo, 2, "monkey", 10.5, 25);
        this.spawnRow("rabbit", rowThree, 4, "rabbit", 8, 25);

        // array to hold animal projectiles
        // pandas will throw sticks at intervals
        this.my.sprite.sticks = [];
        this.stickThrowInterval = 2000

        this.time.addEvent({
            delay: this.stickThrowInterval,
            callback: this.throwStick,
            callbackScope: this,
            loop: true
        });


        // key input objects
        this.left = this.input.keyboard.addKey("A");
        this.right = this.input.keyboard.addKey("D");
        this.nextScene = this.input.keyboard.addKey("S");
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);


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


        // animal movement 
        for (let animal of my.sprite.animals) {
            animal.x += animal.speed * animal.direction;
        
            let halfWidth = animal.displayWidth / 2;
            if (animal.x >= (game.config.width - halfWidth) || animal.x <= halfWidth) {
                animal.direction *= -1;  // bounce
            }
        }  


        // player action : shooting food
        if(Phaser.Input.Keyboard.JustDown(this.space)) {
            if(my.sprite.food.length < this.maxFood) {
                my.sprite.food.push(  this.add.sprite(this.playerContainer.x, this.playerContainer.y - (this.playerContainer.displayHeight / 2), "sushi").setScale(1.2));
            }
        }


        // move all active food projectiles
        for(let food of my.sprite.food) {
            food.y -= this.foodSpeed;
        }


        // remove all offscreen projectiles 
        my.sprite.food = my.sprite.food.filter((food) => food.y > -(food.displayHeight/2));


        // check for food collision with animals
        for (let food of my.sprite.food) {
            for (let animal of my.sprite.animals) {
                if (this.collides(animal, food)) {
                    food.y = -100;
                    animal.x = -100;
                    animal.visible = false;
                    this.playerScore += animal.scorePoints;
                    this.updateScore();
                }
            }
        }


        // panda thrown stick with player collison detection
        for (let i = this.my.sprite.sticks.length - 1; i >= 0; i--) {
            let stick = this.my.sprite.sticks[i];
            stick.y += stick.speed;
        
            // off screen cleanup
            if (stick.y > game.config.height + stick.displayHeight / 2) {
                stick.destroy();
                this.my.sprite.sticks.splice(i, 1);
                continue;
            }
        
            // Collision with player
            if (this.collides(stick, this.playerContainer)) {
                stick.destroy();
                this.my.sprite.sticks.splice(i, 1);
                this.handlePlayerHit();
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
        this.ui.score.textContent = "Score : " + this.playerScore;
    }    
    

    // function to spawn multiple animals per row
    spawnRow(animalType, rowPos, count, spriteKey, speed, score) {
        for (let i = 0; i < count; i++) {
            let x = Phaser.Math.Between(50, game.config.width - 50);
            let animal = this.add.sprite(x, rowPos, spriteKey)
                              .setScale(0.4)
                              .setOrigin(0.5);
            animal.type = animalType;
            animal.scorePoints = score;
            animal.speed = speed;
            animal.direction = Phaser.Math.Between(0, 1) ? 1 : -1;
            this.my.sprite.animals.push(animal);
        }
    }


    // function to emitt sticks for pandas
    throwStick() {
        for (let animal of this.my.sprite.animals) {
            if (animal.type === "panda" && animal.visible) {
                let stick = this.add.sprite(animal.x, animal.y + animal.displayHeight / 2, "stick")
                                 .setScale(0.3);
                stick.speed = 8;
                this.my.sprite.sticks.push(stick);
            }
        }
    }


    // 
    handlePlayerHit() {
        if (this.playerHealth > 0) {
            this.playerHealth -= 1;
            this.updateHealthDisplay();
    
            // briefly show hurt player face
            this.defaultFace.visible = false;
            this.hurtFace.visible = true;
            this.time.delayedCall(1000, () => {
                this.defaultFace.visible = true;
                this.hurtFace.visible = false;
            });
        }
    
        if (this.playerHealth <= 0) {
            // this.gameOver(); 
        }
    }


    // update player health
    updateHealthDisplay() {
        let hearts = "";
        for (let i = 0; i < this.playerHealth; i++) {
            hearts += "❤️";
        }
        this.ui.health.textContent = hearts;
    }
    
    
}