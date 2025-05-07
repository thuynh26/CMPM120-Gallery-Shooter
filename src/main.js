"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    backgroundColor: '#bbbbbb',

    // 30 x 14 tiles, each 16px, scaled 2x
    width: 960,
    height: 480,
    scene: [Game],
    fps: {
        forceSetTimeOut: true, 
        target: 30 
    }
}

const game = new Phaser.Game(config);