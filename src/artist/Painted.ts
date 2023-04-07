import { Positioned } from "parsegraph-layout";
import Artist from "./Artist";
import { WorldRenderable } from "parsegraph-scene";
import Freezable from "./freezer/Freezable";
import { Interactive } from "./interact";

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
