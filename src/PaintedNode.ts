import { DirectionNode } from "parsegraph-direction";
import Painted from "./Painted";
import { WorldRenderable } from "parsegraph-scene";

type PaintedNode<
  Model extends Painted<Model, View> = any,
  View extends WorldRenderable = WorldRenderable
> = DirectionNode<Model> & DirectionNode<Painted<Model, View>>;

export default PaintedNode;
