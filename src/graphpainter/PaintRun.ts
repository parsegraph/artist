import Artist from "./Artist";
import { WorldTransform, WorldRenderable } from "parsegraph-scene";
import NodeValues from "./NodeValues";
import Method from "parsegraph-method";
import { Projector, SharedProjector } from "parsegraph-projector";
import Painted from "./Painted";
import PaintedNode from "./PaintedNode";

export default class PaintRun<
  Model extends Painted<Model, View> = any,
  View extends WorldRenderable = WorldRenderable
> implements WorldRenderable
{
  private _slices: [Artist<Model, View>, View][];
  private _world: WorldTransform;
  private _onUpdate: Method;
  private _numRenders: number;
  private _projector: SharedProjector;
  private _root: PaintedNode<Model, View>;

  constructor(projector: Projector) {
    this._root = null;
    this._projector = new SharedProjector(projector);
    this._slices = [];
    this._world = null;
    this._numRenders = 0;
    this._onUpdate = new Method();
  }

  projector() {
    return this._projector;
  }

  numRenders(): number {
    return this._numRenders;
  }

  numSlices() {
    return this._slices.length;
  }

  worldTransform() {
    return this._world;
  }

  setWorldTransform(world: WorldTransform) {
    this._world = world;
  }

  eachView(cb: (view: View) => void): void {
    this._slices.forEach((slice) => cb(slice[1]));
  }

  eachArtist(cb: (artist: Artist<Model, View>) => void): void {
    this._slices.forEach((slice) => cb(slice[0]));
  }

  eachSlice(cb: (view: View, artist: Artist<Model, View>) => void): void {
    this._slices.forEach((slice) => cb(slice[1], slice[0]));
  }

  scheduleUpdate() {
    this._onUpdate.call();
  }

  setOnScheduleUpdate(cb: () => void, cbObj?: any) {
    this._onUpdate.set(cb, cbObj);
  }

  root() {
    return this._root;
  }

  populate(root: PaintedNode<Model, View>) {
    this._root = root;
    let seq: NodeValues<Model> = null;
    let seqArtist: Artist<Model, View> = null;

    let currentSlice = 0;

    let changed = false;

    // Adds the current node value sequence as a new Renderable
    // created from the root node's Artist.
    const commit = () => {
      if (!seq) {
        return;
      }
      if (currentSlice < this._slices.length) {
        const slice = this._slices[currentSlice];
        if (seqArtist === slice[0] && seqArtist.patch(slice[1], seq)) {
          // Slice is patchable, so re-use it.
          currentSlice++;
          return;
        } else {
          // Renderable cannot be patched, so remove it and replace.
          this._slices[currentSlice][1].unmount();
          this._slices.splice(currentSlice, 1);
          changed = true;
        }
      }

      // Create a new slice.
      const renderable = seqArtist.make(this.projector(), seq);
      renderable.setOnScheduleUpdate(this.scheduleUpdate, this);
      this._slices.splice(currentSlice++, 0, [seqArtist, renderable]);
      changed = true;
    };

    root.forEachNode((node: PaintedNode<Model, View>) => {
      const artist = node.value().artist();
      if (!seq || seqArtist !== artist) {
        // Artist has changed, so commit the current sequence, if any.
        commit();

        // Artist has changed, so start a new sequence.
        seq = new NodeValues<Model>(node);
        seqArtist = artist;
        changed = true;
      } else {
        // Artist did not change, so include node in current sequence.
        seq.include();
      }
    });

    // Include last sequence.
    commit();

    while (this._slices.length > currentSlice) {
      const slice = this._slices.pop();
      slice[1].unmount();
      changed = true;
    }

    if (changed) {
      this.scheduleUpdate();
    }
  }

  tick() {
    return false;
  }

  paint(timeout?: number): boolean {
    let needsRepaint = false;
    this.eachView((renderable) => {
      needsRepaint =
        renderable.paint(timeout / this.numSlices()) || needsRepaint;
    });
    if (!needsRepaint) {
      const cache = this.root().value().getCache();
      if (cache && cache.isFrozen()) {
        cache.frozenNode().paint(this, this.projector());
      }
    }
    return needsRepaint;
  }

  render() {
    let needsUpdate = this.projector().render();
    this.eachView((renderable) => {
      renderable.setWorldTransform(this.worldTransform());
      needsUpdate = renderable.render() || needsUpdate;
    });
    if (!needsUpdate) {
      ++this._numRenders;
    }
    return needsUpdate;
  }

  unmount() {}
}
