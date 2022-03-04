import {DirectionNode} from "parsegraph-direction";
import { Positioned } from "parsegraph-layout";
import Artist, { WorldRenderable } from "./Artist";
import Freezable from "./freezer/Freezable";
import { Interactive } from "parsegraph-interact";

export default interface Painted<
  Model extends Painted<Model, View> = any,
  View extends WorldRenderable = WorldRenderable
> extends Positioned, Interactive, Freezable {
  /**
   * Returns the artist used to paint this object.
   */
  artist(): Artist<Model, View>;
}

export type PaintedNode<Model extends Painted<Model, View> = any, View extends WorldRenderable = WorldRenderable> = DirectionNode<
  Model & Painted<Model, View>
>;
