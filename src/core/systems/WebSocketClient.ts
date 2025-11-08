const WS_URL = "wss://2mb2glerma.execute-api.eu-central-1.amazonaws.com/production";

// 💬 Definiere, welche Nachrichten vom Server kommen können
export interface ServerMessage {
  count?: number;
  message?: string;
  [key: string]: any; // fallback für unerwartete Felder
}

// 📤 und was du senden darfst
export interface ClientMessage {
  action: string;
  [key: string]: any;
}

type ConnectOptions =
  | {
      onOpen?: () => void;
      onMessage?: (msg: ServerMessage) => void;
      onClose?: () => void;
      onError?: (error: Event) => void;
    }
  | ((msg: ServerMessage) => void);

export default class WebSocketClient {
  private url: string;
  private ws: WebSocket | null = null;
  private isConnected = false;
  private reconnectTimeout: number | null = null;

  constructor(url: string = WS_URL) {
    this.url = url;
  }

  /**
   * Verbindet sich mit dem WebSocket-Server
   * @param options Entweder Callback für Nachrichten oder Options-Objekt
   */
  connect(options?: ConnectOptions): void {
    const opts =
      typeof options === "function" ? { onMessage: options } : options || {};

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log("✅ Verbunden mit WebSocket");
      this.isConnected = true;
      opts.onOpen?.();
    };

    this.ws.onmessage = (event: MessageEvent<string>) => {
      console.log("📩 Nachricht vom Server:", event.data);
      try {
        const data: ServerMessage = JSON.parse(event.data);
        opts.onMessage?.(data);
      } catch (err) {
        console.warn("⚠️ Konnte Nachricht nicht parsen:", event.data);
      }
    };

    this.ws.onclose = () => {
      console.log("❌ Verbindung geschlossen – versuche Reconnect in 30s");
      this.isConnected = false;
      opts.onClose?.();

      // Reconnect nur, wenn nicht schon geplant
      if (!this.reconnectTimeout) {
        this.reconnectTimeout = window.setTimeout(() => {
          this.reconnectTimeout = null;
          this.connect(opts);
        }, 30000);
      }
    };

    this.ws.onerror = (error) => {
      console.error("⚠️ WebSocket-Fehler:", error);
      opts.onError?.(error as unknown as Event);
    };
  }

  /**
   * Sendet eine Nachricht an den Server
   */
  send(action: string, payload: Record<string, any> = {}): void {
    if (this.isConnected && this.ws) {
      const message: ClientMessage = { action, ...payload };
      console.log("📤 Sende Nachricht:", message);
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn("⚠️ Noch nicht verbunden");
    }
  }

  /**
   * Trennt die Verbindung sauber
   */
  disconnect(): void {
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
