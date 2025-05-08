class TitleScene extends Phaser.Scene {
    constructor() {
        super("titleScene");
    }

    create() {
        this.add.text(480, 200, "🐼 Zookeeper 🐍", {
            fontFamily: "Titan One",
            fontSize: "48px",
            color: "#ffffff"
            
        }).setOrigin(0.5);

        this.add.text(480, 280, "Press SPACE to Start", {
            fontFamily: "Titan One",
            fontSize: "24px",
            color: "#eeeeee"
        }).setOrigin(0.5);

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start("gameScene");
        });
    }
}
