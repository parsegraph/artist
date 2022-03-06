import { Interaction } from "parsegraph-interact";
import { Layout } from "parsegraph-layout";
import Artist, {
  PaintedNode,
  Painted,
  FreezerCache,
} from ".";
import Size from "parsegraph-size";
import Direction, {Axis} from "parsegraph-direction";
import Repaintable from "./Repaintable";

export const BUD_RADIUS = 2;

export const MIN_BLOCK_HEIGHT = BUD_RADIUS * 12;
export const MIN_BLOCK_WIDTH = BUD_RADIUS * 15;

// Inter-node spacing
export const HORIZONTAL_SEPARATION_PADDING = BUD_RADIUS;
export const VERTICAL_SEPARATION_PADDING = BUD_RADIUS / 2;

export default class AbstractPainted<Model extends Painted<Model>> implements Painted<Model> {
  private _layout: Layout;
  private _interactor: Interaction;
  private _node: PaintedNode<Model>;
  private _cache: FreezerCache;
  private _artist: Artist<Model>;
  private _onUpdate: Repaintable;

  constructor(node: PaintedNode<Model>, artist: Artist<Model>) {
    this._node = node;
    this._interactor = new Interaction();
    this._layout = new Layout(node);
    this._cache = new FreezerCache(node);
    this._artist = artist;
    this._onUpdate = null;
  }

  protected setArtist(artist: Artist<Model>) {
    if (artist === this._artist) {
      return;
    }
    this._artist = artist;
    this.scheduleRepaint();
  }

  size(bodySize?: Size):Size {
    if (!bodySize) {
      bodySize = new Size();
    }
    bodySize.setWidth(MIN_BLOCK_WIDTH);
    bodySize.setHeight(MIN_BLOCK_HEIGHT);
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
