const SHAPES = ["circle", "rect", "triangle"];
const DEFAULT_CONTROLS = {
    noise: 0.45,
    colorDrift: 0.5,
    variation: 0,
    patternShift: 0,
};
const EMOTIONS = [
    {
        label: "calm",
        hueBase: 210,
        saturation: 0.35,
        toneKey: "ping",
        chord: ["ping"],
        echoMultiplier: 1.2,
    },
    {
        label: "warm",
        hueBase: 30,
        saturation: 0.45,
        toneKey: "tone",
        chord: ["tone", "ping"],
        echoMultiplier: 1.35,
    },
    {
        label: "radiant",
        hueBase: 330,
        saturation: 0.55,
        toneKey: "tone",
        chord: ["tone", "ping"],
        echoMultiplier: 1.55,
    },
];
export class CompositionEngine {
    random;
    controls;
    constructor(random, controls = DEFAULT_CONTROLS) {
        this.random = random;
        this.controls = controls;
    }
    craftEvent(x, y) {
        const emotion = this.pickEmotion();
        const controls = { ...DEFAULT_CONTROLS, ...this.controls };
        const noiseAmount = Phaser.Math.Clamp(controls.noise, 0, 1);
        const colorDrift = Phaser.Math.Clamp(controls.colorDrift, 0, 1);
        const variationPhase = controls.variation * 47 + controls.patternShift * 61;
        const brightness = Phaser.Math.Linear(0.3, 0.97, this.random.frac());
        const hueVariance = Phaser.Math.Linear(18, 90, colorDrift);
        const hue = this.buildHue(emotion.hueBase, brightness, hueVariance, variationPhase);
        const toneRate = Phaser.Math.Linear(0.7, 1.25, brightness);
        const baseSize = Phaser.Math.Linear(60, 200, Phaser.Math.Linear(0.35, 1, noiseAmount) * this.random.frac());
        const size = Phaser.Math.Linear(baseSize * 0.82, baseSize * 1.18, this.random.frac());
        const alpha = Phaser.Math.Linear(0.45, 0.95, this.random.frac() * Phaser.Math.Linear(0.82, 1.05, noiseAmount));
        const shape = SHAPES[Math.floor(this.random.frac() * SHAPES.length)] ?? "circle";
        const rotationVariance = Phaser.Math.Linear(12, 88, noiseAmount);
        const rotation = Phaser.Math.Linear(-rotationVariance, rotationVariance, this.random.frac()) + variationPhase * 0.2;
        const echoDuration = Phaser.Math.Linear(1250, 3200, brightness) * emotion.echoMultiplier * Phaser.Math.Linear(0.92, 1.08, noiseAmount);
        return {
            x,
            y,
            hue,
            brightness,
            alpha,
            size,
            shape,
            rotation,
            echoDuration,
            toneRate,
            toneKey: emotion.toneKey,
            chord: emotion.chord,
            emotion,
        };
    }
    setControls(controls) {
        this.controls = { ...DEFAULT_CONTROLS, ...controls };
    }
    pickEmotion() {
        const index = Math.floor(this.random.frac() * EMOTIONS.length);
        return EMOTIONS[index] ?? EMOTIONS[0];
    }
    buildHue(baseHue, brightness, variance, variationPhase) {
        const drift = Phaser.Math.Linear(variance * 0.35, variance, this.random.frac());
        return (baseHue + drift * brightness + this.random.frac() * variance + variationPhase * 1.25) % 360;
    }
}
