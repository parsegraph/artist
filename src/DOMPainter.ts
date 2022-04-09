import { Projector } from "parsegraph-projector";
import { WorldTransform, AbstractScene } from "parsegraph-scene";
import Size from "parsegraph-size";

export default class DOMPainter extends AbstractScene {
  _worldElement: HTMLDivElement;
  _elems: HTMLElement[];

  constructor(projector: Projector) {
    super(projector);
    this._elems = [];
    this._worldElement = null;
  }

  getWorldElement(): HTMLElement {
    if (!this.projector().getDOMContainer()) {
      return null;
    }
    if (!this._worldElement) {
      const worldEle = document.createElement("div");
      worldEle.className = "world";
      worldEle.style.transformOrigin = "top left";
      worldEle.style.position = "relative";
      worldEle.style.pointerEvents = "none";
      this._worldElement = worldEle;
    }
    return this._worldElement;
  }

  hasWorldElement() {
    return !!this._worldElement;
  }

  reset() {
    if (this.hasWorldElement()) {
      this.getWorldElement().remove();
    }
    this._worldElement = null;
    this.projector().getDOMContainer().appendChild(this.getWorldElement());
    this.projector().getDOMContainer().style.overflow = "initial";
  }

  drawElem(
    elem: HTMLElement,
    innerSize: Size,
    x: number,
    y: number,
    absScale: number
  ) {
    if (elem.parentNode !== this.getWorldElement()) {
      elem.remove();
      this.getWorldElement().appendChild(elem);
    }
    const posTranslate = `translate(${x}px, ${y}px)`;
    const nodeScale = `scale(${absScale}, ${absScale})`;
    const halfSize = `translate(-${innerSize.width() / 2}px, -${
      innerSize.height() / 2
    }px)`;
    const newTransform = [posTranslate, halfSize, nodeScale].join(" ");
    elem.style.transform = newTransform;
  }

  render() {
    return false;
  }

  setWorldTransform(world: WorldTransform) {
    if (!world) {
      return;
    }
    const tx = [
      `translate(${world.x()}px, ${world.y()}px)`,
      `scale(${world.scale()})`,
    ].join(" ");
    this.getWorldElement().style.transform = tx;
  }

  unmount() {
    if (this._worldElement) {
      this._worldElement.remove();
    }
  }
}
