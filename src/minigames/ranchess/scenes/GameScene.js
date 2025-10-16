import {Button} from "../../../common/ui/Button.js";
import {qS} from "../../../config/constants.js";
import {testChessInstance} from "../objects/chessJS.js";

export class RanChessGameScene extends Phaser.Scene {
    constructor() {
        super("RanChessGameScene");
    }

    create() {
        const { width, height } = this.scale;

        // Hintergrund
        const baseBG = this.add.image(width/2, height/2, "base-bg");
        baseBG.displayWidth=innerWidth;

        //Chessboard
        const chessBoard = this.add.image(width/2, height/2, "board");
        chessBoard.setDisplaySize(qS,qS);

        // TEST -black figure
        const bFigure = this.add.image(width/2 - qS/4, height/2 - qS/4, "bFigure");
        bFigure.setDisplaySize(qS/4,qS/4);
        // TEST -white figure
        const wFigure = this.add.image(width/2+ + qS/4, height/2 + qS/4, "wFigure");
        wFigure.setDisplaySize(qS/4,qS/4);

        // Backbutton
        const backButton = new Button (this, width / 4, height*0.1, "Back", () => {
            this.scene.start("MainMenuScene");
        });

        //testchess
        testChessInstance();
    }
}
