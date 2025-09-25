//braucht scene + sting text
// gibt textbox in der szene aus

export function textbox(scene, text) {


    const boxWidth = scene.game.canvas.width/2;
    const boxHeight = scene.game.canvas.height/2;
    const tsize = Math.round(scene.game.canvas.width / 10);

    const style = {
                    //backgroundColor: "rgba(3,19,72,0.34)",
                    font: `${tsize}px PokemonG3`,
                    fill: "#ffffff",
                    wordWrap: { width: boxWidth*1.8, useAdvancedWrap: true },
                    align: "center",
                    padding: { x: 10, y: 10 },

    };
    scene.add.text(boxWidth, boxHeight, text, style).setOrigin(0.5);

    console.log("--- iHandleTextbox.js loaded", scene.text);
}