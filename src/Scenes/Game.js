class Game extends Phaser.Scene {
    constructor() {

        super("gameScene");

        // hold sprite and bitmap text bindings
        this.my = {sprite: {}, text: {}};


        // where sprites are loaded on page
        this.playerX = 480;
        this.playerY = 435;


        // array to hold food projectiles player emmits 
        this.maxFood = 10;

        this.waveLevel = 1;
        this.waveStarting = false;

    }


    /////////////////////////// PRELOAD ///////////////////////////


    preload() {
        this.load.setPath("./assets/");
        

        // load in map background
        this.load.image("tiny_town_tiles", "kenny-tiny-town-tilemap-packed.png");
        this.load.tilemapTiledJSON("map", "ZooMap.json");
        

        // load in animal / enemies characters
        this.load.image("panda", "panda.png");
        this.load.image("monkey", "monkey.png");
        this.load.image("rabbit", "rabbit.png");
        this.load.image("snake", "snake.png");
        this.load.image("chick", "chick.png")


        // load in player character
        this.load.image("defaultFace", "head.png");
        this.load.image("hair", "headBack.png");
        this.load.image("hurtFace", "headShock.png");


        // load in profectiles
            // food - player emitted
        this.load.image("sushi", "Lsushi.png");
            // stick - animal emitted
        this.load.image("stick", "stick.png");
    
    }


    /////////////////////////// CREATE ///////////////////////////


    create() {
        let my = this.my;

        // reference to html text element
        // game mechanic states will displayed outside of the game canvas
        this.ui = {
            health: document.getElementById("health"),
            score: document.getElementById("score"),
            wave: document.getElementById("wave")
        };

        
        // array to holder player projectiles 
        this.my.sprite.food = [];
        // array to hold animals / enemies sprites
        this.my.sprite.animals = [];
           // array to hold animal projectiles
        this.my.sprite.sticks = [];

        // Set movement speeds (in pixels/tick), player health
        this.playerSpeed = 10;
        this.foodSpeed = 15;


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

        // player hitbox
        this.playerHitbox = this.add.rectangle(this.playerX, this.playerY, 50, 50, 0xff0000, 0);


        // key input objects
        this.left = this.input.keyboard.addKey("A");
        this.right = this.input.keyboard.addKey("D");
        this.nextScene = this.input.keyboard.addKey("S");
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.waveChange = this.input.keyboard.addKeys({
            one : Phaser.Input.Keyboard.KeyCodes.ONE,
            two : Phaser.Input.Keyboard.KeyCodes.TWO,
            three : Phaser.Input.Keyboard.KeyCodes.THREE
        });


        // create path for chick animal
        this.chickPath = this.add.path(0, 0);

        this.chick = this.add.follower(this.chickPath, 0, 0, "chick").setScale(0.4);
        this.chick.visible = false;  // hide unless wave requires it


        
        this.time.addEvent({
            delay: 2000,
            callback: this.throwStick,
            callbackScope: this,
            loop: true
        });


        this.waves = [
            {
                number: 1,
                enemies: [
                    { type: "panda", count: 3, row: 100, speed: 4, score: 25 },
                    { type: "monkey", count: 2, row: 200, speed: 10.5, score: 25 },
                    { type: "rabbit", count: 4, row: 300, speed: 8, score: 25 },
                ],
                isChasing: false
            },
            {
                number: 2,
                enemies: [
                    { type: "snake", count: 8, row: -50, speed: 3, score: 50 },
                ],
                isChasing: true,
                includesChick: true
            }
        ];

        this.init_game();
    }


    /////////////////////////// UPDATE ///////////////////////////


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

        // make hitbox follow player
        this.playerHitbox.x = this.playerContainer.x;
        this.playerHitbox.y = this.playerContainer.y;



        // animal movement s
        for (let animal of my.sprite.animals) {
            // handle snack movement
            if (animal.isChasing) {
                // Move snake toward player
                let dx = this.playerContainer.x - animal.x;
                let dy = this.playerContainer.y - animal.y;
                let dist = Math.sqrt(dx * dx + dy * dy);
        
                if (dist !== 0) {
                    animal.x += (dx / dist) * animal.speed;
                    animal.y += (dy / dist) * animal.speed;
                }
        
                // Check if snake collides with player
                if (this.collides(animal, this.playerHitbox)) {
                    animal.destroy();
                    this.my.sprite.animals = this.my.sprite.animals.filter(a => a !== animal);
                    this.handlePlayerHit();
                }

            } else {
                // Regular side-to-side movement for wave 1 animals
                animal.x += animal.speed * animal.direction;
                let halfWidth = animal.displayWidth / 2;
                if (animal.x >= (game.config.width - halfWidth) || animal.x <= halfWidth) {
                    animal.direction *= -1;
                }
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

                    animal.destroy();
                    animal.visible = false;
                    this.my.sprite.animals = this.my.sprite.animals.filter(a => a !== animal); 

                    this.playerScore += animal.scorePoints;
                    this.updateScore();
                }
            }

            // Check if chick gets hit by food
            if (this.chick && this.chick.visible) {
                for (let food of my.sprite.food) {
                    if (this.collides(this.chick, food)) {
                        food.y = -100;
                        this.chick.stopFollow();
                        this.chick.visible = false;
                        this.playerScore += 100;
                        this.updateScore();
                    }
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
            if (this.collides(stick, this.playerHitbox)) {
                stick.destroy();
                this.my.sprite.sticks.splice(i, 1);
                this.handlePlayerHit();
            }
        }        


        // keyboard shortcut to change waves without having to clear
        for (let i = 1; i <= 3; i++) {
            const keyName = ["one", "two", "three"][i - 1];
            if (Phaser.Input.Keyboard.JustDown(this.waveChange[keyName])) {
                if (i <= this.waves.length) {
                    console.log(`Jumping to Wave ${i}`);
                    this.startWave(i);
                }
            }
        }
        

        // If all enemies gone -> move onto next wave 
        if (
            this.my.sprite.animals.length === 0 &&
            !this.waveStarting &&
            this.waveLevel < this.waves.length
        ) {
            this.waveStarting = true;
            this.time.delayedCall(1000, () => this.startWave(this.waveLevel + 1));
        }
    

    }


/////////////////////////// Other functions ///////////////////////////

    // wave 1 handling + initialize game function
    init_game() {
        this.playerHealth = 3;
        this.playerScore = 0;
        this.waveLevel = 1;
        this.waveStarting = false;

        this.ui.health.textContent = "❤️❤️❤️";
        this.ui.score.textContent = "Score: 0";
        this.ui.wave.textContent = "Wave: 1";

        ["food", "animals", "sticks"].forEach(key => {
            if (this.my.sprite[key]) this.my.sprite[key].forEach(o => o.destroy());
            this.my.sprite[key] = [];
        });

        this.startWave(1);
    }

    
    startWave(waveNumber) {
        const wave = this.waves.find(w => w.number === waveNumber);
        if (!wave) return;

        this.ui.wave.textContent = `Wave: ${wave.number}`;
        this.waveLevel = wave.number;
        this.waveStarting = false;

        // clear all current enemies, food, and sticks
        // for wave switching 
        ["food", "animals", "sticks"].forEach(key => {
            if (this.my.sprite[key]) this.my.sprite[key].forEach(o => o.destroy());
            this.my.sprite[key] = [];
        });


        for (let enemy of wave.enemies) {
            for (let i = 0; i < enemy.count; i++) {
                let x = Phaser.Math.Between(50, game.config.width - 50);
                let sprite = this.add.sprite(x, enemy.row, enemy.type).setScale(0.4).setOrigin(0.5);
                sprite.type = enemy.type;
                sprite.scorePoints = enemy.score;
                sprite.direction = Phaser.Math.Between(0, 1) ? 1 : -1;

                // give snakes random speed
                if (enemy.type === "snake") {
                    sprite.speed = Phaser.Math.FloatBetween(2, 8);
                } else {
                    sprite.speed = enemy.speed;
                }
                

                sprite.isChasing = wave.isChasing;
                this.my.sprite.animals.push(sprite);
            }

            // If the wave includes chick, activate its path
            if (wave.includesChick) {
                if (!this.chick) {
                    this.chick = this.add.follower(this.chickPath, 0, 0, "chick").setScale(0.4);
                }
                this.randomChickPath(); 
                this.chick.visible = true;
            } else {
                if (this.chick) {
                    this.chick.stopFollow();
                    this.chick.visible = false;
                }
            }
        }
    }


    // collision detection function
    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
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


    // create random path for chick function
    randomChickPath() {
        const startX = Phaser.Math.Between(0, 960);
        const startY = Phaser.Math.Between(0, 380);
        const endX = Phaser.Math.Between(0, 960);
        const endY = Phaser.Math.Between(0, 380);
    
        if (this.chickPath) this.chickPath.destroy(); 
        this.chickPath = this.add.path(startX, startY);
        this.chickPath.lineTo(endX, endY);
    
        // Update path follower to follow new path
        this.chick.setPath(this.chickPath);
        this.chick.setPosition(startX, startY);
        this.chick.visible = true;
    
        this.chick.startFollow({
            duration: Phaser.Math.Between(1500, 1000),
            onComplete: () => {
                this.randomChickPath();  // recurse to follow a new random line
            },
            rotateToPath: true,
            rotationOffset: -90
        });
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


    // functin to change health and player face when hit and check game over condition
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
            this.gameOver(); 
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


    // update player score function
    updateScore() {
        let my = this.my;
        this.ui.score.textContent = "Score : " + this.playerScore;
    }  
    

    // game over function - shows a message and lets player go back to title
    gameOver() {
        this.add.text(480, 240, "GAME OVER", {
            fontFamily: "Titan One",
            fontSize: "48px",
            color: "#ff0000"
        }).setOrigin(0.5);
    
        this.add.text(480, 300, "Press R to Restart", {
            fontFamily: "Titan One",
            fontSize: "24px",
            color: "#ffffff"
        }).setOrigin(0.5);
    
        this.input.keyboard.once('keydown-R', () => {
            this.scene.start("titleScene");  // back to title
        });
    }
    
}