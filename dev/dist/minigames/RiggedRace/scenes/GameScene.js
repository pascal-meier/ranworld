import { Button } from "../../../core/ui/Button.js";
import { BaseScene } from "../../../core/scenes/BaseScene.js";
import { Track } from "../objects/track.js";
import { Fox } from "../objects/fox.js";
import { Race } from "../objects/race.js";
export class RiggedRaceGameScene extends BaseScene {
    foxes = [];
    selectedFox = null;
    race;
    titleText;
    background;
    startButton;
    backButton;
    tracks = [];
    startLineX = 0;
    finishLineX = 0;
    trackMarginRatio = 0.05;
    laneStartRatio = 0.4;
    laneSpacingRatio = 0.12;
    raceFinishedListener = (winner) => this.handleRaceFinished(winner);
    constructor() {
        super("RiggedRaceGameScene");
    }
    create() {
        const { width, height } = this.scale;
        this.startLineX = width * 0.15;
        this.finishLineX = width - 100;
        this.background = this.add.image(0, 0, "base-bg").setOrigin(0.5);
        this.background.setPosition(width / 2, height / 2).setDisplaySize(width, height);
        this.titleText = this.add
            .text(width / 2, height * 0.2, "CHOOSE RACER", {
            fontSize: "32px",
            color: "#ffffff",
        })
            .setOrigin(0.5);
        const laneStartY = this.getLaneStart(height);
        const laneSpacing = this.getLaneSpacing(height);
        this.createTracks(laneStartY, laneSpacing, width);
        this.createFoxes(laneStartY, laneSpacing);
        this.startButton = new Button(this, width * 0.75, height * 0.1, "Start Race", () => this.startRace());
        this.backButton = new Button(this, width / 4, height * 0.1, "Back", () => {
            this.resetRaceState();
            this.scene.start("MainMenuScene");
        });
        this.events.on("foxSelected", this.handleFoxSelection, this);
        this.events.on("raceFinished", this.raceFinishedListener);
        this.registerShutdownHook();
        this.race = new Race(this, this.foxes, this.finishLineX);
        super.create();
    }
    createTracks(startY, spacing, width) {
        const startX = width * this.trackMarginRatio;
        const trackLength = width - startX * 2;
        this.tracks = Array.from({ length: 3 }, (_, index) => new Track(this, trackLength).setPosition(startX, startY + index * spacing));
    }
    createFoxes(startY, spacing) {
        const foxConfigs = [
            { name: "Miyo", texture: "fox01" },
            { name: "Anber", texture: "fox02" },
            { name: "Ret", texture: "fox03" },
        ];
        this.foxes = foxConfigs.map((config, index) => new Fox(this, config.name, config.texture).setPosition(this.startLineX, startY + index * spacing));
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
    onResize(gameSize) {
        const prevStart = this.startLineX;
        const prevFinish = this.finishLineX;
        const { width, height } = gameSize;
        this.startLineX = width * 0.15;
        this.finishLineX = width - 100;
        const laneStartY = this.getLaneStart(height);
        const laneSpacing = this.getLaneSpacing(height);
        this.background?.setPosition(width / 2, height / 2).setDisplaySize(width, height);
        this.titleText?.setPosition(width / 2, height * 0.2);
        this.startButton?.setPosition(width * 0.75, height * 0.1);
        this.backButton?.setPosition(width / 4, height * 0.1);
        const trackStartX = width * this.trackMarginRatio;
        const trackLength = width - trackStartX * 2;
        this.tracks.forEach((track, index) => {
            track.setPosition(trackStartX, laneStartY + index * laneSpacing);
            track.resize(trackLength);
        });
        const oldRange = Math.max(prevFinish - prevStart, 1);
        const newRange = Math.max(this.finishLineX - this.startLineX, 1);
        this.foxes.forEach((fox, index) => {
            const progress = Phaser.Math.Clamp((fox.x - prevStart) / oldRange, 0, 1);
            const newX = this.startLineX + progress * newRange;
            const newY = laneStartY + index * laneSpacing;
            fox.setPosition(newX, newY);
        });
        this.race?.setFinishLine(this.finishLineX);
    }
    getLaneStart(height) {
        return height * this.laneStartRatio;
    }
    getLaneSpacing(height) {
        return Math.max(80, height * this.laneSpacingRatio);
    }
}
