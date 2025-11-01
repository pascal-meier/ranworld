const WS_URL = "wss://2mb2glerma.execute-api.eu-central-1.amazonaws.com/production";
export default class WebSocketClient {
    url;
    ws = null;
    isConnected = false;
    reconnectTimeout = null;
    constructor(url = WS_URL) {
        this.url = url;
    }
    /**
     * Verbindet sich mit dem WebSocket-Server
     * @param onMessageCallback Callback für eingehende Nachrichten
     */
    connect(onMessageCallback) {
        this.ws = new WebSocket(this.url);
        this.ws.onopen = () => {
            console.log("✅ Verbunden mit WebSocket");
            this.isConnected = true;
        };
        this.ws.onmessage = (event) => {
            console.log("📩 Nachricht vom Server:", event.data);
            try {
                const data = JSON.parse(event.data);
                onMessageCallback?.(data);
            }
            catch (err) {
                console.warn("⚠️ Konnte Nachricht nicht parsen:", event.data);
            }
        };
        this.ws.onclose = () => {
            console.log("❌ Verbindung geschlossen – versuche Reconnect in 30s");
            this.isConnected = false;
            // Reconnect nur, wenn nicht schon geplant
            if (!this.reconnectTimeout) {
                this.reconnectTimeout = window.setTimeout(() => {
                    this.reconnectTimeout = null;
                    this.connect(onMessageCallback);
                }, 30000);
            }
        };
        this.ws.onerror = (error) => {
            console.error("⚠️ WebSocket-Fehler:", error);
        };
    }
    /**
     * Sendet eine Nachricht an den Server
     */
    send(action, payload = {}) {
        if (this.isConnected && this.ws) {
            const message = { action, ...payload };
            console.log("📤 Sende Nachricht:", message);
            this.ws.send(JSON.stringify(message));
        }
        else {
            console.warn("⚠️ Noch nicht verbunden");
        }
    }
    /**
     * Trennt die Verbindung sauber
     */
    disconnect() {
        if (this.ws) {
            console.log("🔌 Verbindung manuell getrennt");
            this.ws.close();
            this.isConnected = false;
        }
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
    }
}
