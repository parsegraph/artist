import { Projector } from "parsegraph-projector";
import Size from "parsegraph-size";
import Artist from "./Artist";
import BasicPainted from "./BasicPainted";
import NodeValues from "./NodeValues";
import { MIN_BLOCK_HEIGHT, MIN_BLOCK_WIDTH } from "./BasicPainted";
import { AbstractScene, WorldTransform } from "parsegraph-scene";
import computeInnerPos from "./computeInnerPos";
import paintNodeLines from "./paintNodeLines";
import paintNodeBounds from "./paintNodeBounds";
import PaintedNode from "./PaintedNode";
import Color from "parsegraph-color";
import DOMPainter from "./DOMPainter";

const LINE_COLOR = new Color(0, 0, 0, 1);
const BACKGROUND_COLOR = new Color(1, 1, 1, 0.25);
const LINE_THICKNESS = 1;

export type ContentEntry = [() => HTMLElement, HTMLElement, PaintedNode];

const innerSize = new Size();
export class DOMContentScene extends AbstractScene {
  _elems: NodeValues<DOMContent>;
  _created: ContentEntry[];
  _painter: DOMPainter;

  constructor(projector: Projector, elems: NodeValues<DOMContent>) {
    super(projector);
    this._elems = elems;
    this._created = [];
    this._painter = new DOMPainter(projector);
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

  getContent(node: PaintedNode, i: number): HTMLElement {
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
    const entry: ContentEntry = [creator, this.createContent(node), node];
    if (i < this._created.length) {
      this._created[i] = entry;
    } else {
      this._created.push(entry);
    }
    return this.getContent(node, i);
  }

  paint() {
    this._painter.reset();

    this._elems.forEach((node, i) => {
      const elem = this.getContent(node, i);
      node.value().measure(innerSize);
      const [x, y, absScale] = computeInnerPos(node, innerSize);
      this._painter.drawElem(elem, innerSize, x, y, absScale);
    });
    return false;
  }

  render() {
    const ctx = this.projector().overlay();
    this._elems.forEach((node) => {
      const content = node.value();
      if (content.lineColor() && content.lineThickness() > 0) {
        ctx.fillStyle = content.lineColor().asRGBA();
        paintNodeLines(node, content.lineThickness(), (x, y, w, h) => {
          ctx.fillRect(x - w / 2, y - h / 2, w, h);
        });
      }
      if (content.backgroundColor()) {
        ctx.fillStyle = content.backgroundColor().asRGBA();
        paintNodeBounds(node, (x, y, w, h) => {
          ctx.fillRect(x - w / 2, y - h / 2, w, h);
        });
      }
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
    this._painter.setWorldTransform(world);
  }

  unmount() {
    this._painter.unmount();
    this._created.forEach((val) => {
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
  _lineThickness: number;
  _lineColor: Color;
  _bgColor: Color;

  constructor(creator?: ElementFunc) {
    super();
    this._creator = creator;
    this.setArtist(new DOMContentArtist());
    this.clearSize();
    this._lineColor = LINE_COLOR;
    this._lineThickness = LINE_THICKNESS;
    this._bgColor = BACKGROUND_COLOR;
  }

  getCreator() {
    return this._creator;
  }

  create() {
    return this._creator();
  }

  lineThickness() {
    return this._lineThickness;
  }

  setLineThickness(thickness: number) {
    this._lineThickness = thickness;
    this.scheduleRepaint();
  }

  setLineColor(color: Color) {
    this._lineColor = color;
    this.scheduleRepaint();
  }

  lineColor() {
    return this._lineColor;
  }

  backgroundColor() {
    return this._bgColor;
  }

  setBackgroundColor(color: Color) {
    this._bgColor = color;
    this.scheduleRepaint();
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
