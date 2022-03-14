import { Projector } from "parsegraph-projector";
import Size from "parsegraph-size";
import { WorldRenderable } from "./Artist";
import Artist from "./Artist";
import BasicPainted from "./BasicPainted";
import NodeValues from "./NodeValues";
import WorldTransform from "./WorldTransform";
import Method from "parsegraph-method";
import { MIN_BLOCK_HEIGHT, MIN_BLOCK_WIDTH } from "./BasicPainted";
import paintNodeBounds from "./paintNodeBounds";
import paintNodeLines from "./paintNodeLines";
import Direction, { Alignment } from "parsegraph-direction";

class DOMContentScene implements WorldRenderable {
  _projector: Projector;
  _elems: NodeValues<DOMContent>;
  _worldElement: HTMLDivElement;
  _onUpdate: Method;

  constructor(projector: Projector, elems: NodeValues<DOMContent>) {
    this._onUpdate = new Method();
    this._projector = projector;
    this._elems = elems;
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

  tick() {
    return false;
  }

  projector() {
    return this._projector;
  }

  hasWorldElement() {
    return !!this._worldElement;
  }

  paint() {
    if (this.hasWorldElement()) {
      this.getWorldElement().remove();
    }
    this._worldElement = null;

    this.projector().getDOMContainer().appendChild(this.getWorldElement());
    this.projector().getDOMContainer().style.overflow = "initial";

    const size = new Size();

    this._elems.forEach((node) => {
      const elem = node.value().create();
      if (elem.parentNode !== this.getWorldElement()) {
        elem.remove();
        this.getWorldElement().appendChild(elem);

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
      }

      node.value().size(size);
      elem.style.width = "fit-content";
      elem.style.height = "fit-content";
      elem.style.position = "absolute";

      if (!node.hasNode(Direction.INWARD)) {
        const layout = node.value().getLayout();
        const x = layout.groupX();
        const y = layout.groupY();
        const absScale = layout.groupScale();

        const posTranslate = `translate(${x}px, ${y}px)`;
        const halfSizeTranslate = `translate(${-size.width() / 2}px, ${
          -size.height() / 2
        }px)`;
        const nodeScale = `scale(${absScale}, ${absScale})`;
        const newTransform = [posTranslate, nodeScale, halfSizeTranslate].join(
          " "
        );
        elem.style.transform = newTransform;
      } else if (
        node.nodeAlignmentMode(Direction.INWARD) == Alignment.INWARD_VERTICAL
      ) {
        const innerSize = new Size();
        node.value().measure(innerSize);
        const layout = node.value().getLayout();
        const absScale = layout.groupScale() * node.nodeAt(Direction.INWARD).state().scale();
        // Align vertical.
        const x = layout.groupX() - (absScale * innerSize.width()) / 2;
        const y = layout.groupY() - (absScale * size.height()) / 2;

        const posTranslate = `translate(${x}px, ${y}px)`;
        const nodeScale = `scale(${absScale}, ${absScale})`;
        const newTransform = [posTranslate, nodeScale].join(
          " "
        );
        elem.style.transform = newTransform;
      } else {
        const innerSize = new Size();
        node.value().measure(innerSize);
        const layout = node.value().getLayout();
        const absScale = layout.groupScale() * node.nodeAt(Direction.INWARD).state().scale();
        const x = layout.groupX() - (absScale * size.width()) / 2;
        const y = layout.groupY() - (absScale * innerSize.height()) / 2;

        const posTranslate = `translate(${x}px, ${y}px)`;
        const nodeScale = `scale(${absScale}, ${absScale})`;
        const newTransform = [posTranslate, nodeScale].join(
          " "
        );
        elem.style.transform = newTransform;
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
    const tx = `scale(${world.scale()}) translate(${world.x()}px, ${world.y()}px)`;
    console.log("Setting world transform to " + tx);
    this.getWorldElement().style.transform = tx;
  }

  render() {
    this._elems.forEach((node) => {
      this.projector().overlay().strokeStyle = "black";
      this.projector().overlay().fillStyle = "black";
      paintNodeLines(node, 1, (x: number, y: number, w: number, h: number) => {
        this.projector()
          .overlay()
          .fillRect(x - w / 2, y - h / 2, w, h);
      });
      this.projector().overlay().strokeStyle = "black";
      this.projector().overlay().fillStyle = "red";
      paintNodeBounds(node, (x: number, y: number, w: number, h: number) => {
        this.projector()
          .overlay()
          .fillRect(x - w / 2, y - h / 2, w, h);
        this.projector()
          .overlay()
          .strokeRect(x - w / 2, y - h / 2, w, h);
      });
    });
    return false;
  }

  unmount() {
    if (this._worldElement) {
      this._worldElement.remove();
    }
  }

  protected scheduleUpdate() {
    this._onUpdate.call();
  }

  setOnScheduleUpdate(func: () => void, listenerObj?: object) {
    this._onUpdate.set(func, listenerObj);
  }
}

export class DOMContentArtist implements Artist<DOMContent> {
  patch(view: DOMContentScene, seq: NodeValues<DOMContent>) {
    // view.setElems(seq);
    return false;
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
    this._size = new Size(4, 4);
    this.setArtist(new DOMContentArtist());
  }

  create() {
    return this._creator();
  }

  setCreator(creator: ElementFunc): void {
    if (this._creator === creator) {
      return;
    }
    this._creator = creator;
    this.invalidateLayout();
    this.scheduleRepaint();
  }

  clearSize() {
    this._size.setSize(MIN_BLOCK_WIDTH, MIN_BLOCK_HEIGHT);
  }

  reportSize(w: number, h: number) {
    if (this._size.width() >= w && this._size.height() >= h) {
      return;
    }
    console.log(w, h);
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
