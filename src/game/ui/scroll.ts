import { makeGraphics, makeRectangle } from "./display.js";
import { attachDisplayObject, type DisplayParent } from "./display.js";

export interface VerticalScrollViewportOptions {
  wheelStep?: number;
  trackWidth?: number;
  thumbMinHeight?: number;
  scrollbarColor?: number;
  thumbColor?: number;
}

export class VerticalScrollViewport {
  public readonly container: Phaser.GameObjects.Container;
  public readonly content: Phaser.GameObjects.Container;

  private readonly maskGraphics: Phaser.GameObjects.Graphics;
  private readonly track?: Phaser.GameObjects.Rectangle;
  private readonly thumb?: Phaser.GameObjects.Rectangle;
  private readonly wheelStep: number;
  private readonly thumbMinHeight: number;
  private readonly bounds: Phaser.Geom.Rectangle;
  private contentHeight = 0;
  private scrollY = 0;
  private destroyed = false;
  private readonly handleWheel = (
    pointer: Phaser.Input.Pointer,
    _gameObjects: Phaser.GameObjects.GameObject[],
    _deltaX: number,
    deltaY: number
  ): void => {
    if (this.destroyed || deltaY === 0) {
      return;
    }

    if (!this.bounds.contains(pointer.x, pointer.y)) {
      return;
    }

    this.scrollBy(deltaY * this.wheelStep);
  };

  constructor(
    private scene: Phaser.Scene,
    x: number,
    y: number,
    public readonly width: number,
    public readonly height: number,
    parent?: DisplayParent,
    options: VerticalScrollViewportOptions = {}
  ) {
    this.container = attachDisplayObject(scene, new Phaser.GameObjects.Container(scene, x, y), parent);
    this.content = new Phaser.GameObjects.Container(scene, 0, 0);
    this.container.add(this.content);

    this.wheelStep = options.wheelStep ?? 0.75;
    this.thumbMinHeight = options.thumbMinHeight ?? 24;
    this.bounds = new Phaser.Geom.Rectangle(x, y, width, height);

    this.maskGraphics = makeGraphics(scene);
    this.maskGraphics.fillStyle(0xffffff, 1);
    this.maskGraphics.fillRect(x, y, width, height);
    this.maskGraphics.setVisible(false);
    this.content.setMask(this.maskGraphics.createGeometryMask());

    const trackWidth = options.trackWidth ?? 4;
    const scrollbarColor = options.scrollbarColor ?? 0x5d8ca1;
    const thumbColor = options.thumbColor ?? 0x9de7ff;

    this.track = makeRectangle(
      scene,
      width - trackWidth - 2,
      6,
      trackWidth,
      height - 12,
      scrollbarColor,
      0.2,
      this.container
    );
    this.thumb = makeRectangle(
      scene,
      width - trackWidth - 2,
      6,
      trackWidth,
      this.thumbMinHeight,
      thumbColor,
      0.75,
      this.container
    );

    this.track.setVisible(false);
    this.thumb.setVisible(false);

    this.scene.input.on("wheel", this.handleWheel);
  }

  setContentHeight(contentHeight: number): void {
    this.contentHeight = Math.max(0, contentHeight);
    this.scrollY = Phaser.Math.Clamp(this.scrollY, 0, this.maxScroll);
    this.content.y = -this.scrollY;
    this.refreshScrollbar();
  }

  scrollTo(scrollY: number): void {
    this.scrollY = Phaser.Math.Clamp(scrollY, 0, this.maxScroll);
    this.content.y = -this.scrollY;
    this.refreshScrollbar();
  }

  scrollBy(delta: number): void {
    if (this.maxScroll <= 0) {
      return;
    }

    this.scrollTo(this.scrollY + delta);
  }

  destroy(): void {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;
    this.scene.input.off("wheel", this.handleWheel);
    this.maskGraphics.destroy();
    this.container.destroy(true);
  }

  private get maxScroll(): number {
    return Math.max(0, this.contentHeight - this.height);
  }

  private refreshScrollbar(): void {
    if (!this.track || !this.thumb) {
      return;
    }

    if (this.maxScroll <= 0) {
      this.track.setVisible(false);
      this.thumb.setVisible(false);
      return;
    }

    const trackHeight = this.height - 12;
    const ratio = Phaser.Math.Clamp(this.height / this.contentHeight, 0.08, 1);
    const thumbHeight = Math.max(this.thumbMinHeight, Math.floor(trackHeight * ratio));
    const thumbTravel = Math.max(1, trackHeight - thumbHeight);
    const thumbOffset = thumbTravel * (this.scrollY / this.maxScroll);

    this.track.setVisible(true);
    this.thumb
      .setVisible(true)
      .setPosition(this.width - this.track.width - 2, 6 + thumbOffset)
      .setDisplaySize(this.track.width, thumbHeight);
  }
}
