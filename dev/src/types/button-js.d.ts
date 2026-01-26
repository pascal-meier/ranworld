declare module "../../../core/ui/Button.js" {
  export class Button extends Phaser.GameObjects.Container {
    constructor(
      scene: Phaser.Scene,
      x: number,
      y: number,
      text: string,
      callback?: () => void,
    );
    setCallback(callback: () => void): void;
    setLabel(text: string): void;
    setFontSize(size: number): void;
    setLabelColor(color: string): void;
    setTintColors(normal: number, hover?: number): void;
    setButtonSize(width: number, height: number): void;
    getButtonSize(): { width: number; height: number };
    setInteractionEnabled(enabled: boolean): void;
    markAsHud(tag?: string): void;
  }
}

