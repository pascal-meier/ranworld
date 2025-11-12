const DEFAULT_WS_URL = "wss://2mb2glerma.execute-api.eu-central-1.amazonaws.com/production";
const RECONNECT_DELAY_MS = 30_000;
export default class WebSocketClient {
    url;
    createSocket;
    reconnectDelayMs;
    ws = null;
    isConnected = false;
    reconnectTimeout = null;
    constructor(url = DEFAULT_WS_URL, socketFactory = (target) => new WebSocket(target), reconnectDelayMs = RECONNECT_DELAY_MS) {
        this.url = url;
        this.createSocket = socketFactory;
        this.reconnectDelayMs = reconnectDelayMs;
    }
    connect(options) {
        const normalizedOptions = this.normalizeOptions(options);
        this.ws = this.createSocket(this.url);
        this.ws.onopen = () => {
            console.log("[WebSocket] Connected");
            this.isConnected = true;
            normalizedOptions.onOpen?.();
        };
        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                normalizedOptions.onMessage?.(data);
            }
            catch {
                console.warn("[WebSocket] Failed to parse message:", event.data);
            }
        };
        this.ws.onclose = () => {
            console.log("[WebSocket] Disconnected, scheduling reconnect");
            this.isConnected = false;
            normalizedOptions.onClose?.();
            this.scheduleReconnect(normalizedOptions);
        };
        this.ws.onerror = (error) => {
            console.error("[WebSocket] Error", error);
            normalizedOptions.onError?.(error);
        };
    }
    send(action, payload = {}) {
        if (!this.isConnected || !this.ws) {
            console.warn("[WebSocket] Attempted to send before connecting");
            return;
        }
        const message = { action, ...payload };
        this.ws.send(JSON.stringify(message));
    }
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.isConnected = false;
        this.clearReconnectTimer();
    }
    normalizeOptions(options) {
        if (typeof options === "function") {
            return { onMessage: options };
        }
        return options ?? {};
    }
    scheduleReconnect(options) {
        if (this.reconnectTimeout) {
            return;
        }
        this.reconnectTimeout = window.setTimeout(() => {
            this.reconnectTimeout = null;
            this.connect(options);
        }, this.reconnectDelayMs);
    }
    clearReconnectTimer() {
        if (!this.reconnectTimeout) {
            return;
        }
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
    }
}
