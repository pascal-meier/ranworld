const DEFAULT_WS_URL = "wss://2mb2glerma.execute-api.eu-central-1.amazonaws.com/production";
const RECONNECT_DELAY_MS = 30_000;

export interface ServerMessage {
  count?: number;
  message?: string;
  [key: string]: any;
}

export interface ClientMessage {
  action: string;
  [key: string]: any;
}

type SocketFactory = (url: string) => WebSocket;

type ConnectOptionsObject = {
  onOpen?: () => void;
  onMessage?: (msg: ServerMessage) => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
};

type ConnectOptions = ConnectOptionsObject | ((msg: ServerMessage) => void);

export default class WebSocketClient {
  private readonly url: string;
  private readonly createSocket: SocketFactory;
  private readonly reconnectDelayMs: number;
  private ws: WebSocket | null = null;
  private isConnected = false;
  private reconnectTimeout: number | null = null;

  constructor(
    url: string = DEFAULT_WS_URL,
    socketFactory: SocketFactory = (target) => new WebSocket(target),
    reconnectDelayMs: number = RECONNECT_DELAY_MS
  ) {
    this.url = url;
    this.createSocket = socketFactory;
    this.reconnectDelayMs = reconnectDelayMs;
  }

  connect(options?: ConnectOptions): void {
    const normalizedOptions = this.normalizeOptions(options);
    this.ws = this.createSocket(this.url);

    this.ws.onopen = () => {
      console.log("[WebSocket] Connected");
      this.isConnected = true;
      normalizedOptions.onOpen?.();
    };

    this.ws.onmessage = (event: MessageEvent<string>) => {
      try {
        const data: ServerMessage = JSON.parse(event.data);
        normalizedOptions.onMessage?.(data);
      } catch {
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
      normalizedOptions.onError?.(error as unknown as Event);
    };
  }

  send(action: string, payload: Record<string, any> = {}): void {
    if (!this.isConnected || !this.ws) {
      console.warn("[WebSocket] Attempted to send before connecting");
      return;
    }

    const message: ClientMessage = { action, ...payload };
    this.ws.send(JSON.stringify(message));
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.clearReconnectTimer();
  }

  private normalizeOptions(options?: ConnectOptions): ConnectOptionsObject {
    if (typeof options === "function") {
      return { onMessage: options };
    }
    return options ?? {};
  }

  private scheduleReconnect(options: ConnectOptionsObject): void {
    if (this.reconnectTimeout) {
      return;
    }
    this.reconnectTimeout = window.setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect(options);
    }, this.reconnectDelayMs);
  }

  private clearReconnectTimer(): void {
    if (!this.reconnectTimeout) {
      return;
    }
    clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = null;
  }
}
