import { Projector } from "parsegraph-projector";
import NodeValues from "./NodeValues";
import { WorldRenderable } from "parsegraph-scene";

export default interface Artist<
  Model = {},
  Scene extends WorldRenderable = WorldRenderable
> {
  /**
   * Attempt to update the scene in-place, given the model
   * used to create the original scene, and the old state.
   *
   * @returns {boolean} true if the update was successful, or false if
   * a new scene must be created.
   */
  patch(scene: Scene, newModel: NodeValues<Model>): boolean;

  /**
   * Given the sequence, create a projected that is used to
   * render the sequence.
   *
   * @param {Projector} projector the target projector
   * @param {NodeValues<Model>} seq the list of node values
   */
  make(projector: Projector, seq: NodeValues<Model>): Scene;
}
