import { Projector } from "parsegraph-projector";
import Size from "parsegraph-size";
import Artist from "./Artist";
import BasicPainted from "./BasicPainted";
import NodeValues from "./NodeValues";
import WorldTransform from "./WorldTransform";
import { MIN_BLOCK_HEIGHT, MIN_BLOCK_WIDTH } from "./BasicPainted";
import AbstractScene from "./AbstractScene";
import computeInnerPos from "./computeInnerPos";
import paintNodeLines from "./paintNodeLines";
import paintNodeBounds from "./paintNodeBounds";
import PaintedNode from "./PaintedNode";

export type ContentEntry = [()=>HTMLElement, HTMLElement, PaintedNode];

const innerSize = new Size();
export class DOMContentScene extends AbstractScene {
  _elems: NodeValues<DOMContent>;
  _worldElement: HTMLDivElement;
  _created: ContentEntry[];

  constructor(projector: Projector, elems: NodeValues<DOMContent>) {
    super(projector);
    this._elems = elems;
    this._worldElement = null;
    this._created = [];
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

  private createContent(node: PaintedNode) {
    const elem = node.value().create();
    new ResizeObserver(() => {
      node.value().reportSize(elem.offsetWidth, elem.offsetHeight);
    }).observe(elem);

    elem.addEventListener("click", () => {
      node.value().interact().click();
    });
    elem.addEventListener("hover", () => {
      this.projector().setCursor("pointer");
    });
    elem.addEventListener("blur", () => {
      this.projector().setCursor(null);
    });

    elem.style.width = "fit-content";
    elem.style.height = "fit-content";
    elem.style.position = "absolute";
    node.value().reportSize(elem.offsetWidth, elem.offsetHeight);

    return elem;
  }

  getContent(node: PaintedNode, i: number):HTMLElement {
    const creator = node.value().getCreator();
    if (i >= 0 && i < this._created.length) {
      const saved = this._created[i];
      if (saved[2] === node && saved[0] === creator) {
        return saved[1];
      }
      if (saved) {
        saved[1].remove();
      }
    }
    const entry:ContentEntry = [creator, this.createContent(node), node];
    if (i < this._created.length) {
      this._created[i] = entry;
    } else {
      this._created.push(entry);
    }
    return this.getContent(node, i);
  }

  paint() {
    if (this.hasWorldElement()) {
      this.getWorldElement().remove();
    }
    this._worldElement = null;
    this.projector().getDOMContainer().appendChild(this.getWorldElement());
    this.projector().getDOMContainer().style.overflow = "initial";

    this._elems.forEach((node, i) => {
      const elem = this.getContent(node, i);
      if (elem.parentNode !== this.getWorldElement()) {
        elem.remove();
        this.getWorldElement().appendChild(elem);
      }
      node.value().measure(innerSize);
      const [x, y, absScale] = computeInnerPos(node, innerSize);
      const posTranslate = `translate(${x}px, ${y}px)`;
      const nodeScale = `scale(${absScale}, ${absScale})`;
      const halfSize = `translate(-${innerSize.width()/2}px, -${innerSize.height()/2}px)`;
      const newTransform = [posTranslate, halfSize, nodeScale].join(" ");
      elem.style.transform = newTransform;
    });
    return false;
  }

  render() {
    const ctx = this.projector().overlay();
    this._elems.forEach(node=>{
      ctx.fillStyle = "black";
      const scale = 1;//node.value().getLayout().groupScale();
      paintNodeLines(node, 1, (x, y, w, h)=>{
        ctx.fillRect(x - scale*w/2, y - scale*h/2, scale*w, scale*h);
      });
      ctx.fillStyle = "rgb(1, 1, 1, .25)";
      paintNodeBounds(node, (x, y, w, h)=>{
        ctx.fillRect(x - scale*w/2, y - scale*h/2, scale*w, scale*h);
      });
    });
    return false;
  }

  setElems(elems: NodeValues<DOMContent>) {
    this._elems = elems;
  }

  setWorldTransform(world: WorldTransform) {
    if (!world) {
      return;
    }
    const tx = [
      `translate(${world.x()}px, ${world.y()}px)`,
      `scale(${world.scale()})`].join(" ")
    this.getWorldElement().style.transform = tx;
  }

  unmount() {
    if (this._worldElement) {
      this._worldElement.remove();
    }
    this._created.forEach((val)=>{
      val[1] && val[1].remove();
    });
    this._created = [];
  }
}

export class DOMContentArtist implements Artist<DOMContent> {
  patch(view: DOMContentScene, seq: NodeValues<DOMContent>) {
    view.setElems(seq);
    return true;
  }

  make(projector: Projector, seq: NodeValues<DOMContent>) {
    return new DOMContentScene(projector, seq);
  }
}

export type ElementFunc = () => HTMLElement;

export default class DOMContent extends BasicPainted<DOMContent> {
  _creator: ElementFunc;
  _size: Size;

  constructor(creator?: ElementFunc) {
    super();
    this._creator = creator;
    this.setArtist(new DOMContentArtist());
    this.clearSize();
  }

  getCreator() {
    return this._creator;
  }

  create() {
    return this._creator();
  }

  setCreator(creator: ElementFunc): void {
    if (this._creator === creator) {
      return;
    }
    this._creator = creator;
    this.clearSize();
    this.invalidateLayout();
    this.scheduleRepaint();
  }

  clearSize() {
    const w = MIN_BLOCK_WIDTH;
    const h = MIN_BLOCK_HEIGHT;
    if (!this._size) {
      this._size = new Size(w, h);
    } else {
      this._size.setSize(w, h);
    }
  }

  hasSize() {
    return this._size.width() > 0 && this._size.height() > 0;
  }

  reportSize(w: number, h: number) {
    if (this._size.width() >= w && this._size.height() >= h) {
      return;
    }
    this._size.setSize(
      Math.max(this._size.width(), w),
      Math.max(this._size.height(), h)
    );
    this.invalidateLayout();
    this.scheduleRepaint();
  }

  measure(size: Size): void {
    size.copyFrom(this._size);
  }
}
