export class InputDisplay {
    scene;
    container;
    fontSize = 22;
    spacing = 40;
    constructor(scene, x, y) {
        this.scene = scene;
        this.container = scene.add.container(x, y);
    }
    getContainer() {
        return this.container;
    }
    setMetrics(fontSize, spacing) {
        this.fontSize = fontSize;
        this.spacing = spacing;
    }
    setPosition(x, y) {
        this.container.setPosition(x, y);
    }
    clear() {
        this.container.removeAll(true);
    }
    render(playerArray = [], successArray = []) {
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
    destroy() {
        this.clear();
        this.container.destroy(true);
    }
}
