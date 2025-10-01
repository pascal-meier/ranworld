export class RanChessPreloadScene extends Phaser.Scene {
    constructor() {
        super("RanChessPreloadScene");
    }

    preload() {
        this.load.image("board", "/public/assets/ranchess/board.png");
        this.load.image("bFigure", "/public/assets/ranchess/figures_black.png");
        this.load.image("wFigure", "/public/assets/ranchess/figures_white.png");
    }

    create() {
        this.scene.start("RanChessGameScene");
    }
}
