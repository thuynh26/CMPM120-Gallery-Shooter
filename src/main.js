"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    backgroundColor: '#bbbbbb',

    // 62 x 37 tiles, each 16px
    width: 992,
    height: 592,
    scene: [Game],
    fps: {
        forceSetTimeOut: true, 
        target: 30 
    }
}

const game = new Phaser.Game(config);