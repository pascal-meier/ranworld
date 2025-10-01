const WS_URL = "wss://2mb2glerma.execute-api.eu-central-1.amazonaws.com/production";

export default class WebSocketClient {
    constructor() {
        this.url = WS_URL;
        this.ws = null;
        this.isConnected = false;
    }

    connect(onMessageCallback) {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
            console.log("✅ Verbunden mit WebSocket");
            this.isConnected = true;
        };

        this.ws.onmessage = (event) => {
            console.log("📩 Nachricht vom Server:", event.data);
            if (onMessageCallback) {
                try {
                    onMessageCallback(JSON.parse(event.data));
                } catch (err) {
                    console.warn("⚠️ Konnte Nachricht nicht parsen:", event.data);
                }
            }
        };

        this.ws.onclose = () => {
            console.log("❌ Verbindung geschlossen – versuche Reconnect in 30s");
            this.isConnected = false;
            setTimeout(() => this.connect(onMessageCallback), 30000);
        };

        this.ws.onerror = (error) => {
            console.error("⚠️ WebSocket-Fehler:", error);
        };
    }


    send(action, payload = {}) {
        if (this.isConnected) {
            console.log("📤 Sende Nachricht:", { action, ...payload });
            this.ws.send(JSON.stringify({ action, ...payload }));
        } else {
            console.warn("⚠️ Noch nicht verbunden");
        }
    }
}
