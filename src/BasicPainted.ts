import { Interaction } from "parsegraph-interact";
import { Layout } from "parsegraph-layout";
import Artist from "./Artist";
import Painted from "./Painted";
import PaintedNode from "./PaintedNode";
import FreezerCache from "./freezer/FreezerCache";
import Size from "parsegraph-size";
import Direction, { Axis, Alignment } from "parsegraph-direction";
import Method from "parsegraph-method";

export const BUD_RADIUS = 2;

export const MIN_BLOCK_HEIGHT = BUD_RADIUS * 12;
export const MIN_BLOCK_WIDTH = BUD_RADIUS * 15;

// Inter-node spacing
export const HORIZONTAL_SEPARATION_PADDING = 7 * BUD_RADIUS;
export const VERTICAL_SEPARATION_PADDING = 3 * BUD_RADIUS;

export default class BasicPainted<Model extends Painted<Model> = Painted>
  implements Painted<Model>
{
  private _layout: Layout;
  private _interactor: Interaction;
  private _node: PaintedNode<Model>;
  private _cache: FreezerCache;
  private _artist: Artist<Model>;
  private _onUpdate: Method;

  constructor(node: PaintedNode<Model> = null, artist: Artist<Model> = null) {
    this._node = node;
    this._interactor = new Interaction();
    this._layout = new Layout(node);
    this._cache = new FreezerCache(node);
    this._artist = artist;
    this._onUpdate = new Method();
  }

  setNode(node: PaintedNode<Model>) {
    if (this._node === node) {
      return;
    }
    this._node = node;
    this._layout.setOwner(node);
    this._cache.setNode(node);
    this.scheduleRepaint();
  }

  setArtist(artist: Artist<Model>) {
    if (artist === this._artist) {
      return;
    }
    this._artist = artist;
    this.scheduleRepaint();
  }

  measure(size: Size): void {
    size.setSize(MIN_BLOCK_WIDTH, MIN_BLOCK_HEIGHT);
  }

  size(bodySize?: Size): Size {
    if (!bodySize) {
      bodySize = new Size();
    }
    this.measure(bodySize);

    const node = this.node();
    if (node && node.hasNode(Direction.INWARD)) {
      const nestedNode = node.nodeAt(Direction.INWARD);
      const nestedLayout = nestedNode.value().getLayout();
      const nestedSize = nestedLayout.extentSize();
      const scale = nestedNode.state().scale();

      if (
        node.nodeAlignmentMode(Direction.INWARD) == Alignment.INWARD_VERTICAL
      ) {
        // Align vertical.
        bodySize.setWidth(
          Math.max(bodySize.width(), scale * nestedSize.width())
        );
        bodySize.setHeight(
          bodySize.height() +
            this.getSeparation(Axis.Z, Direction.INWARD, true) +
            scale * nestedSize.height()
        );
      } else {
        // Align horizontal.
        bodySize.setWidth(
          bodySize.width() +
            this.getSeparation(Axis.Z, Direction.INWARD, false) +
            scale * nestedSize.width()
        );

        bodySize.setHeight(
          Math.max(bodySize.height(), scale * nestedSize.height())
        );
      }
    }
    return bodySize;
  }

  getSeparation(axis: Axis, _: Direction, _2: boolean): number {
    if (axis === Axis.VERTICAL) {
      return VERTICAL_SEPARATION_PADDING;
    } else if (axis === Axis.HORIZONTAL) {
      return HORIZONTAL_SEPARATION_PADDING;
    }
    return 10;
  }

  artist(): Artist<Model> {
    return this._artist;
  }

  node(): PaintedNode {
    return this._node;
  }

  getCache() {
    return this._cache;
  }

  getLayout(): Layout {
    return this._layout;
  }

  interact(): Interaction {
    return this._interactor;
  }

  protected invalidateLayout() {
    if (this.node()) {
      this.node().layoutChanged();
    }
  }

  protected scheduleRepaint() {
    this._onUpdate.call();
  }

  setOnScheduleUpdate(func: () => void, funcObj?: object) {
    this._onUpdate.set(func, funcObj);
  }
}
