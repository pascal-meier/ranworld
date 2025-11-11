import { Button } from "../../../core/ui/Button.js";
import { Track } from "../objects/track.js";
import { Fox } from "../objects/fox.js";
import { Race } from "../objects/race.js";
export class RiggedRaceGameScene extends Phaser.Scene {
    foxes = [];
    selectedFox = null;
    race;
    titleText;
    raceFinishedListener = (winner) => this.handleRaceFinished(winner);
    constructor() {
        super("RiggedRaceGameScene");
    }
    create() {
        this.createBackground();
        this.createTitle();
        const laneStartY = this.scale.height * 0.4;
        const laneSpacing = 110;
        this.createTracks(laneStartY, laneSpacing);
        this.createFoxes(laneStartY, laneSpacing);
        this.events.on("foxSelected", this.handleFoxSelection, this);
        this.events.on("raceFinished", this.raceFinishedListener);
        this.registerShutdownHook();
        this.race = new Race(this, this.foxes, this.scale.width - 100);
        this.createButtons();
    }
    createBackground() {
        const { width, height } = this.scale;
        this.add.image(width / 2, height / 2, "base-bg").setDisplaySize(width, height).setOrigin(0.5);
    }
    createTitle() {
        const { width, height } = this.scale;
        this.titleText = this.add
            .text(width / 2, height * 0.2, "CHOOSE RACER", {
            fontSize: "32px",
            color: "#ffffff",
        })
            .setOrigin(0.5)
            .setName("titleText");
    }
    createTracks(startY, spacing) {
        const trackStartX = this.scale.width * 0.05;
        const trackLength = this.scale.width - trackStartX * 2;
        for (let i = 0; i < 3; i++) {
            new Track(this, trackLength).setPosition(trackStartX, startY + i * spacing);
        }
    }
    createFoxes(startY, spacing) {
        const foxConfigs = [
            { name: "Miyo", texture: "fox01" },
            { name: "Anber", texture: "fox02" },
            { name: "Ret", texture: "fox03" },
        ];
        const startX = this.scale.width * 0.15;
        this.foxes = foxConfigs.map((config, index) => new Fox(this, config.name, config.texture).setPosition(startX, startY + index * spacing));
    }
    createButtons() {
        const { width, height } = this.scale;
        new Button(this, width * 0.75, height * 0.1, "Start Race", () => this.startRace());
        new Button(this, width / 4, height * 0.1, "Back", () => {
            this.resetRaceState();
            this.scene.start("MainMenuScene");
        });
    }
    startRace() {
        if (!this.selectedFox) {
            this.titleText.setText("⚠️ Select a fox first");
            return;
        }
        this.titleText.setText("🏁 Running...");
        this.race?.start();
    }
    handleFoxSelection(clickedFox) {
        if (this.selectedFox === clickedFox) {
            clickedFox.setSelected(false);
            this.selectedFox = null;
            this.titleText.setText("CHOOSE RACER");
            return;
        }
        this.selectedFox?.setSelected(false);
        clickedFox.setSelected(true);
        this.selectedFox = clickedFox;
        this.titleText.setText("Press Start");
    }
    handleRaceFinished(winner) {
        this.titleText.setText(`${winner.getName()} wins!`);
        this.time.delayedCall(3000, () => {
            this.resetRaceState();
            this.titleText.setText("CHOOSE RACER");
        });
    }
    resetRaceState() {
        this.selectedFox?.setSelected(false);
        this.selectedFox = null;
        this.race?.reset();
    }
    registerShutdownHook() {
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.resetRaceState();
            this.time.removeAllEvents();
            this.events.off("foxSelected", this.handleFoxSelection, this);
            this.events.off("raceFinished", this.raceFinishedListener);
        });
    }
}
