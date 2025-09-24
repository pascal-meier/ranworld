// Konfiguration des Spiels
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create
    }
};

// Erstelle eine neue Phaser-Spielinstanz
const game = new Phaser.Game(config);

// Die Preload-Funktion wird vor dem Spielstart ausgeführt
function preload() {
    // Hier kannst du Bilder, Sound etc. laden
}

// Die Create-Funktion wird nach dem Laden der Assets ausgeführt
function create() {
    // Füge einen Text in der Mitte des Bildschirms hinzu
    this.add.text(400, 300, 'Hello Phaser!', {
        fontSize: '32px',
        color: '#ffffff'
    }).setOrigin(0.5); // Zentriert den Text
}