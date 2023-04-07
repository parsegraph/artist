import { NodeValues } from "parsegraph-artist";
import { WorldTransform, WorldRenderable } from "parsegraph-scene";
import { Projector } from "parsegraph-projector";
import Block from "./Block";
import Method from "parsegraph-method";

export default abstract class BlockScene implements WorldRenderable {
  _projector: Projector;
  _blocks: NodeValues<Block>;
  _world: WorldTransform;
  private _onUpdate: Method;

  constructor(projector: Projector) {
    this._projector = projector;
    this._blocks = null;
    this._onUpdate = new Method();
  }

  projector() {
    return this._projector;
  }

  markDirty() {
    this._onUpdate.call();
  }

  setOnScheduleUpdate(listener: () => void, listenerObj?: object): void {
    this._onUpdate.set(listener, listenerObj);
  }

  setBlocks(blocks: NodeValues<Block>) {
    this._blocks = blocks;
  }

  blocks() {
    return this._blocks;
  }

  setWorldTransform(world: WorldTransform) {
    this._world = world;
  }

  worldTransform() {
    return this._world;
  }

  tick() {
    return false;
  }

  paint() {
    return false;
  }

  abstract render(): boolean;

  unmount() {}
}
