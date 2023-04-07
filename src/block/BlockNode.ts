import Block from "./Block";
import { DirectionNode } from "parsegraph-direction";
import BlockType from "./BlockType";
import { style } from "./BlockStyle";
import BlockArtist from "./BlockArtist";
import { Projector } from "parsegraph-projector";
import DefaultBlockScene from "./DefaultBlockScene";
import { BlockType as BlockPainterType } from "parsegraph-blockpainter";

const defaultArtist = new BlockArtist((proj: Projector) => {
  return new DefaultBlockScene(proj, BlockPainterType.ROUNDED);
});

export default class BlockNode extends DirectionNode<Block> {
  constructor(type: string | BlockType) {
    super();
    this.setValue(new Block(this, style(type), defaultArtist));
  }
}
