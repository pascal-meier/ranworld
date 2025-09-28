export function drawGPTButton(scene) {
    // Hintergrund für den Button
    let buttonBg = scene.add.rectangle(
        scene.scale.width / 2,
        scene.scale.height / 2,
        200, 60,
        0x4CAF50, 1
    ).setOrigin(0.5);

    // Text drauf
    let buttonText = scene.add.text(
        scene.scale.width / 2,
        scene.scale.height / 2,
        "Play",
        {
            fontFamily: 'PokemonG1',
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        }
    ).setOrigin(0.5);

    // Container bauen
    let playButton = scene.add.container(0, 0, [buttonBg, buttonText]);

    // Interaktiv machen
    buttonBg.setInteractive({ useHandCursor: true })
        .on('pointerover', () => buttonBg.setFillStyle(0x45A049))  // Hover
        .on('pointerout', () => buttonBg.setFillStyle(0x4CAF50))   // Normal
        .on('pointerdown', () => {
            scene.scene.start('Menu');  // zur nächsten Szene wechseln
        });

    return playButton;
}
