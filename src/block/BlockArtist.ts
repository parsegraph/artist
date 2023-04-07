import Artist, { NodeValues } from "parsegraph-artist";
import { Projector } from "parsegraph-projector";
import Block from "./Block";
import BlockScene from "./BlockScene";

export default class BlockArtist implements Artist<Block, BlockScene> {
  _creator: (projector: Projector) => BlockScene;

  constructor(creator: (projector: Projector) => BlockScene) {
    this._creator = creator;
  }

  protected create(projector: Projector) {
    return this._creator(projector);
  }

  make(projector: Projector, blocks: NodeValues<Block>) {
    const scene = this.create(projector);
    scene.setBlocks(blocks);
    return scene;
  }

  patch(view: BlockScene, blocks: NodeValues<Block>): boolean {
    view.setBlocks(blocks);
    return true;
  }
}
