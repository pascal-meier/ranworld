export default class HitCounter {
    /**
     * @param {Phaser.Scene} scene - Die aktuelle Phaser-Szene
     * @param {number} x - X-Koordinate für den Text
     * @param {number} y - Y-Koordinate für den Text
     * @param {string} api_url - Die API Gateway Aufruf-URL
     */
    constructor(scene, x, y, api_url) {
        // **WICHTIG:** Ersetze diesen Platzhalter durch deine tatsächliche API Gateway URL!
        this.API_URL = api_url;

        // Erstelle das Phaser Text-Objekt
        this.counterText = scene.add.text(x, y, 'Lade Zähler...', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'PokemonG3'
        });

        // Starte die Zählerlogik sofort, wenn die Klasse instanziiert wird
        this.getCount();
    }

    /**
     * 1. Ruft den aktuellen Zählerstand über GET ab und zeigt ihn an.
     * (Wird in diesem Setup nur zur Initialisierung oder Fehlerbehebung benötigt,
     * da POST den neuen Wert zurückgibt.)
     */
    async getCount() {
        try {
            const response = await fetch(this.API_URL, { method: 'GET' });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const dataRAW = await response.json();
            const data = JSON.parse(dataRAW.body);
            const currentCount = data.currentCount;

            this.counterText.setText(`${currentCount}`);
            return currentCount;

        } catch (error) {
            console.error('Fehler beim Abrufen des Zählers:', error);
            this.counterText.setText('Fehler');
        }
    }

    /**
     * 2. Inkrementiert den Zählerstand über POST und aktualisiert die Anzeige.
     */
    async incrementAndDisplay() {
        try {
            this.counterText.setText('Zähle...');

            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const dataRAW = await response.json();
            const data = JSON.parse(dataRAW.body);
            const newCount = data.newCount;

            // Aktualisiere das Phaser Text-Objekt mit dem neuen Wert
            this.counterText.setText(`${newCount}`);

        } catch (error) {
            console.error('Fehler beim Inkrementieren des Zählers:', error);
            this.counterText.setText('Zähl-Fehler!');
        }
    }
}