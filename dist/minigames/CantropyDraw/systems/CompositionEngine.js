const SHAPES = ["circle", "rect", "triangle"];
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
    constructor(random) {
        this.random = random;
    }
    craftEvent(x, y) {
        const emotion = this.pickEmotion();
        const brightness = Phaser.Math.Linear(0.25, 0.95, this.random.frac());
        const hue = this.buildHue(emotion.hueBase, brightness);
        const toneRate = Phaser.Math.Linear(0.7, 1.25, brightness);
        const size = Phaser.Math.Linear(60, 200, this.random.frac());
        const alpha = Phaser.Math.Linear(0.45, 0.95, this.random.frac());
        const shape = SHAPES[Math.floor(this.random.frac() * SHAPES.length)] ?? "circle";
        const rotation = Phaser.Math.Linear(-35, 35, this.random.frac());
        const echoDuration = Phaser.Math.Linear(1400, 3200, brightness) * emotion.echoMultiplier;
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
    pickEmotion() {
        const index = Math.floor(this.random.frac() * EMOTIONS.length);
        return EMOTIONS[index] ?? EMOTIONS[0];
    }
    buildHue(baseHue, brightness) {
        const variance = Phaser.Math.Linear(15, 60, this.random.frac());
        return (baseHue + variance * brightness + this.random.frac() * 45) % 360;
    }
}
