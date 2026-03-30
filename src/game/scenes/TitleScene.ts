import { BaseScene } from "./BaseScene.js";
import { LAB_THEME, textStyle } from "../ui/theme.js";
import { makeImage, makeRectangle, makeText } from "../ui/display.js";
import { createButton } from "../ui/widgets.js";
import { soundGenerator } from "../audio/SoundGenerator.js";

export class TitleScene extends BaseScene {
  constructor() {
    super({ key: "TitleScene" });
  }

  create(): void {
    this.lab.returnToSetup("new");
    const { width, height } = this.scale;

    // Background
    makeRectangle(this, 0, 0, width, height, LAB_THEME.background, 1).setOrigin(0);

    // Ambient Glow / Backdrop
    const planet = makeImage(this, width / 2, height / 2 - 20, "planet-01")
      .setOrigin(0.5)
      .setAlpha(0.6)
      .setScale(1.2);

    this.tweens.add({
      targets: planet,
      scale: 1.25,
      alpha: 0.8,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    // Title
    const title = makeText(
      this, 
      width / 2, 
      height / 2 - 40, 
      "RANWORLD", 
      {
        ...textStyle(48, LAB_THEME.text, "center"),
        letterSpacing: 8,
        shadow: { blur: 10, color: LAB_THEME.accent, fill: true, offsetX: 0, offsetY: 0 }
      }
    ).setOrigin(0.5);

    makeText(
      this,
      width / 2,
      height / 2 + 10,
      "PLANETFALL MECHANICS LAB",
      textStyle(12, LAB_THEME.accent, "center")
    ).setOrigin(0.5);

    // Initialize Button
    const btnWidth = 240;
    const startBtn = createButton(this, {
      x: width / 2 - btnWidth / 2,
      y: height - 120,
      width: btnWidth,
      height: 54,
      label: "INITIALIZE EXPEDITION",
      onClick: () => {
        const phaserCtx = (this.sound as Phaser.Sound.WebAudioSoundManager).context;
        soundGenerator.init(phaserCtx); 
        if (this.sound instanceof Phaser.Sound.WebAudioSoundManager) {
          this.sound.context.resume();
        }

        // Generate and cache synthetic audio on first interaction
        if (!this.cache.audio.exists("sfx-click")) {
            this.cache.audio.add("sfx-click", soundGenerator.generateClickBuffer());
            this.cache.audio.add("sfx-confirm", soundGenerator.generateConfirmBuffer());
            this.cache.audio.add("sfx-hit", soundGenerator.generateHitBuffer());
            this.cache.audio.add("sfx-miss", soundGenerator.generateMissBuffer());
            this.cache.audio.add("sfx-block", soundGenerator.generateBlockBuffer());
            this.cache.audio.add("sfx-crit", soundGenerator.generateCritBuffer());
            this.cache.audio.add("sfx-reward", soundGenerator.generateRewardBuffer());
            this.cache.audio.add("amb-lab", soundGenerator.generateAmbientBuffer());
        }

        // Start ambient loop
        if (!this.sound.get("amb-lab")?.isPlaying) {
            this.sound.play("amb-lab", { loop: true, volume: 0.15 });
        }

        this.sound.play("sfx-click");

        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("SetupScene");
        });
      },
      fill: 0x1d4d6c,
    });

    // Subtle instructions
    makeText(
      this,
      width / 2,
      height - 40,
      "v1.17 - Neural Render Protocol Active",
      textStyle(8, LAB_THEME.textMuted, "center")
    ).setOrigin(0.5);
    
    // Fade in
    this.cameras.main.fadeIn(1000, 0, 0, 0);
  }
}
