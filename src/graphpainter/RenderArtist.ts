import { DirectionNode } from "parsegraph-direction";
import { Projector } from "parsegraph-projector";
import { AbstractScene } from "parsegraph-scene";

import { Artist, NodeValues } from "../artist";

export type RenderFunc<Model> = (
  projector: Projector,
  val: DirectionNode<Model>
) => boolean;

export class RenderScene<Model> extends AbstractScene {
  _renderFunc: RenderFunc<Model>;
  _values: NodeValues<Model>;

  constructor(projector: Projector, values: NodeValues<Model>) {
    super(projector);
    this.setValues(values);
  }

  setValues(values: NodeValues<Model>) {
    this._values = values;
  }

  values() {
    return this._values;
  }

  hasRenderFunc() {
    return !!this._renderFunc;
  }

  setRenderFunc(func: RenderFunc<Model>) {
    this._renderFunc = func;
  }

  render(): boolean {
    if (!this.hasRenderFunc()) {
      return false;
    }
    let needsUpdate = false;
    this.values().forEach((val) => {
      needsUpdate = this._renderFunc(this.projector(), val) || needsUpdate;
    });
    return needsUpdate;
  }
}

export default class RenderArtist<Model = any>
  implements Artist<Model, RenderScene<Model>>
{
  _renderFunc: RenderFunc<Model>;

  constructor(func: RenderFunc<Model>) {
    this._renderFunc = func;
  }

  patch(scene: RenderScene<Model>, values: NodeValues<Model>) {
    scene.setValues(values);
    return true;
  }

  make(projector: Projector, values: NodeValues<Model>): RenderScene<Model> {
    const scene = new RenderScene(projector, values);
    scene.setRenderFunc(this._renderFunc);
    return scene;
  }
}
