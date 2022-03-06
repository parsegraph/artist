import { WorldTransform, WorldRenderable } from ".";
import { Projector } from "parsegraph-projector";
import Method from "parsegraph-method";

export default abstract class AbstractScene implements WorldRenderable {
  _projector: Projector;
  _world: WorldTransform;
  private _onUpdate: Method;

  constructor(projector: Projector) {
    this._projector = projector;
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