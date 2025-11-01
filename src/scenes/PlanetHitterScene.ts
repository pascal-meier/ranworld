import { Button } from "../common/ui/Button.js";
import { rngPoint } from "../common/utils/RNGpoint.js";
import {
  qS,
  gH,
  gW,
  fontSizeXS,
  fontSizeS,
  fontSizeM,
} from "../config/constants.js";
import WebSocketClient from "../common/systems/WebSocketClient.js";

export class PlanetHitterScene extends Phaser.Scene {
  private speedText!: Phaser.GameObjects.Text;
  private hitsText!: Phaser.GameObjects.Text;
  private wsClient!: WebSocketClient;

  constructor() {
    super({ key: "PlanetHitterScene" });
  }

  preload(): void {
    this.load.image("planet", "public/assets/logo/100.png");
    this.load.image("particle", "public/assets/logo/particle_planet.png");
    // this.load.audio("intro-music", "assets/common/intro-music.mp3");
  }

  create(): void {
    this.scale.refresh();
    const { width, height } = this.scale;

    // 🌌 Hintergrund
    const baseBG = this.add.image(width / 2, height / 2, "base-bg");
    baseBG.setDisplaySize(width, height);

    // 🌠 Partikel
    const particles = this.add.particles(0, 0, "particle", {
      speed: qS / 6,
      scale: { start: qS / 550, end: 0 },
      blendMode: "ADD",
    });

    // 🌍 Planet
    const startPoint = rngPoint(gW, gH);
    const logo = this.physics.add.image(startPoint.x, startPoint.y, "planet");
    logo.setDisplaySize(qS / 5, qS / 5);
    logo.setVelocity(50, 100);
    logo.setBounce(1, 1);
    logo.setCollideWorldBounds(true);
    logo.setDepth(10);

    particles.startFollow(logo);

    // ✋ Klick-Interaktion
    logo.setInteractive();
    logo.on("pointerdown", () => {
      const rndPoint = rngPoint(gW, gH);
      logo.setPosition(rndPoint.x, rndPoint.y);

      // Geschwindigkeit erhöhen
      logo.setVelocity(logo.body.velocity.x * 1.1, logo.body.velocity.y * 1.1);

      this.wsClient.send("incPcount");
      this.updateSpeed(logo);
    });

    // ⚡ Geschwindigkeitsanzeige
    this.add
      .text(gW * 0.9, gH * 0.1, "Speed:", {
        fontSize: `${fontSizeXS}px`,
        color: "#ffffff",
        fontFamily: "PokemonG1",
      })
      .setOrigin(1, 0)
      .setDepth(6);

    this.speedText = this.add
      .text(gW * 0.9, gH * 0.1 + fontSizeS, "", {
        fontSize: `${fontSizeM}px`,
        color: "#ffffff",
        fontFamily: "PokemonG3",
      })
      .setOrigin(1, 0)
      .setDepth(6);

    this.updateSpeed(logo);

    // 🎵 Musik-Button (optional)
    // new Button(this, width / 2, height - 200, "Musik starten", () => {
    //   this.sound.play("intro-music", { loop: true, volume: 0.5 });
    // });

    // 🔙 Zurück zum Menü
    new Button(this, width / 2, height - 100, "Zum Menü", () => {
      this.scene.start("MainMenuScene");
    });

    // 🔹 Hit Counter
    this.add
      .text(gW * 0.1, gH * 0.1, "Hits:", {
        fontSize: `${fontSizeXS}px`,
        color: "#ffffff",
        fontFamily: "PokemonG1",
      })
      .setDepth(6);

    this.hitsText = this.add
      .text(gW * 0.1, gH * 0.1 + fontSizeS, "load...", {
        fontSize: `${fontSizeM}px`,
        color: "#ffffff",
        fontFamily: "PokemonG3",
      })
      .setDepth(6);

    // 🌐 WebSocket
    this.wsClient = new WebSocketClient();
    this.wsClient.connect((msg: any) => {
      console.log("🌐 WS Nachricht:", msg);
      if (msg.count !== undefined) {
        this.hitsText.setText(String(msg.count));
      }
    });

    // Initiale Abfrage nach kurzer Verzögerung
    this.time.delayedCall(100, () => {
      this.wsClient.send("getPcount");
    });
  }

  private updateSpeed(logo: Phaser.Physics.Arcade.Image): void {
    const body = logo.body as Phaser.Physics.Arcade.Body | null;
    if (!body) {
      // If the physics body is not available yet, display 0
      this.speedText.setText("0");
      return;
    }
    const velocity = body.velocity;
    const speed = Math.abs(velocity.x / 10 + velocity.y / 10);
    this.speedText.setText(speed.toFixed(0));
  }
}
