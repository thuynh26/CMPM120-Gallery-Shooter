class TitleScene extends Phaser.Scene {
    constructor() {
        super("titleScene");
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image("titleBackground", "background.png");
    }

    create() {
        this.add.image(480, 240, "titleBackground").setDisplaySize(960, 480);

        this.add.text(480, 200, "🐼 Zookeeper 🐣", {
            fontFamily: "Titan One",
            fontSize: "48px",
            color: "#ffffff",
            stroke: "#2E6F40",
            strokeThickness: 8,
            
        }).setOrigin(0.5);

        let startText = this.add.text(480, 280, "Press SPACE to Start!", {
            fontFamily: "Titan One",
            fontSize: "24px",
            color: "#eeeeee",
            stroke: "#2E6F40",
            strokeThickness: 6,
        }).setOrigin(0.5);

        this.tweens.add({
            targets: startText,
            alpha: { from: 1, to: 0.4 },
            duration: 800,
            yoyo: true,
            repeat: -1
          });

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start("gameScene");
        });
    }
}
