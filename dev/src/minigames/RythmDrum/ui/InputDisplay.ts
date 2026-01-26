export class InputDisplay {
  private container: Phaser.GameObjects.Container;
  private fontSize = 22;
  private spacing = 40;

  constructor(private scene: Phaser.Scene, x: number, y: number) {
    this.container = scene.add.container(x, y);
  }

  getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  setMetrics(fontSize: number, spacing: number): void {
    this.fontSize = fontSize;
    this.spacing = spacing;
  }

  setPosition(x: number, y: number): void {
    this.container.setPosition(x, y);
  }

  clear(): void {
    this.container.removeAll(true);
  }

  render(playerArray: number[] = [], successArray: (boolean | undefined)[] = []): void {
    this.container.removeAll(true);

    const spacing = this.spacing;
    let x = -((playerArray.length - 1) * spacing) / 2;

    for (let i = 0; i < playerArray.length; i++) {
      const note = playerArray[i];
      const ok = successArray[i];
      const color = ok === undefined ? "#ffffff" : ok ? "#ffffff" : "#ff5555";

      const text = this.scene.add
        .text(x, 0, `${note}`, {
          fontSize: `${this.fontSize}px`,
          color,
          fontStyle: "bold",
        })
        .setOrigin(0.5);

      this.container.add(text);
      x += spacing;
    }
  }

  destroy(): void {
    this.clear();
    this.container.destroy(true);
  }
}
