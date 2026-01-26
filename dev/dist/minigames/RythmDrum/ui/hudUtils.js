export function clampValue(value, min, max) {
    return Phaser.Math.Clamp(value, min, max);
}
export function getChanceColor(intensity) {
    if (intensity <= 0.2) {
        return "#6befa8";
    }
    if (intensity <= 0.5) {
        return "#ffd369";
    }
    return "#ff5c8d";
}
export function createText(scene, x, y, text, style, originX = 0.5, originY = 0.5) {
    return scene.add.text(x, y, text, style).setOrigin(originX, originY);
}
