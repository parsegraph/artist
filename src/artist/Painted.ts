import { Positioned } from "parsegraph-layout";
import Artist from "./Artist";
import { WorldTransform } from "parsegraph-scene";
import Freezable from "./freezer/Freezable";
import { Interactive } from "./interact";
import { Renderable } from "parsegraph-timingbelt";

export interface Transformed {
  setWorldTransform(wt: WorldTransform): void;
}

export type WorldRenderable = Renderable & Transformed;

export default interface Painted<
  Model extends Painted<Model, View> = any,
  View extends WorldRenderable = WorldRenderable
> extends Positioned,
    Interactive,
    Freezable {
  /**
   * Returns the artist used to paint this object.
   */
  artist(): Artist<Model, View>;
}
