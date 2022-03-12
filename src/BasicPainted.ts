import { Interaction } from "parsegraph-interact";
import { Layout } from "parsegraph-layout";
import Artist, { PaintedNode, Painted, FreezerCache } from ".";
import Size from "parsegraph-size";
import Direction, { Axis, Alignment } from "parsegraph-direction";
import Repaintable from "./Repaintable";

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
  private _onUpdate: Repaintable;
  private _size: Size;

  constructor(node: PaintedNode<Model>, artist: Artist<Model>) {
    this._node = node;
    this._interactor = new Interaction();
    this._layout = new Layout(node);
    this._cache = new FreezerCache(node);
    this._artist = artist;
    this._onUpdate = null;
    this._size = new Size(MIN_BLOCK_WIDTH, MIN_BLOCK_HEIGHT);
  }

  protected setArtist(artist: Artist<Model>) {
    if (artist === this._artist) {
      return;
    }
    this._artist = artist;
    this.scheduleRepaint();
  }

  setSize(w: number, h: number) {
    this._size.setWidth(w);
    this._size.setHeight(h);
  }

  size(bodySize?: Size): Size {
    if (!bodySize) {
      bodySize = new Size();
    }
    bodySize.setWidth(this._size.width());
    bodySize.setHeight(this._size.height());

    const node = this.node();
    if (node.hasNode(Direction.INWARD)) {
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
        bodySize.setHeight(bodySize.height() + scale * nestedSize.height());
      } else {
        // Align horizontal.
        bodySize.setWidth(bodySize.width() + scale * nestedSize.width());

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
    }
    return HORIZONTAL_SEPARATION_PADDING;
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
    this.node().layoutChanged();
  }

  protected scheduleRepaint() {
    if (this._onUpdate) {
      // console.log("Scheduling REPAINT");
      this._onUpdate.scheduleRepaint();
    }
  }

  setOnScheduleUpdate(repaintable: Repaintable) {
    this._onUpdate = repaintable;
  }
}
