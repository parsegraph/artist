import FrozenNode from "./FrozenNode";
import PaintedNode from "../PaintedNode";
import Freezer from "./Freezer";

export default class FreezerCache {
  _cache: FrozenNode;
  _node: PaintedNode;

  constructor(node: PaintedNode) {
    this._cache = null;
    this._node = node;
  }

  setNode(node: PaintedNode) {
    this._node = node;
  }

  node() {
    return this._node;
  }

  freeze(freezer: Freezer): void {
    if (!this.node()) {
      return;
    }
    if (!this.node().isRoot() && !this.node().localPaintGroup()) {
      throw new Error("A node must be a paint group in order to be frozen.");
    }
    this._cache = freezer.cache(this.node());
  }

  isFrozen(): boolean {
    return !!this._cache;
  }

  frozenNode() {
    return this._cache;
  }

  thaw(): void {
    if (!this.node()) {
      return;
    }
    if (!this.node().isRoot() && !this.node().localPaintGroup()) {
      throw new Error("A node must be a paint group in order to be thawed.");
    }
    if (this._cache) {
      this._cache.invalidate();
      this._cache = null;
    }
  }
}
