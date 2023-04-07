import { DirectionNode, InplaceNodePalette } from "parsegraph-direction";
import Artist from "parsegraph-artist";
import Block from "./Block";
import { style } from "./BlockStyle";

type BlockNode = DirectionNode<Block>;

export default class BlockPalette implements InplaceNodePalette<Block> {
  _mathMode: boolean;
  _artist: Artist<Block>;

  constructor(artist: Artist<Block>, mathMode?: boolean) {
    this._mathMode = mathMode;
    this._artist = artist;
  }

  defaultType(): BlockNode {
    return this.spawn();
  }

  artist(): Artist<Block> {
    return this._artist;
  }

  setArtist(artist: Artist<Block>) {
    this._artist = artist;
  }

  mathMode() {
    return this._mathMode;
  }

  set(node: DirectionNode<Block>, given?: any): Block {
    const block = new Block(node, style(given, this.mathMode()), this.artist());
    node.setValue(block);
    return block;
  }

  spawn(given?: any): BlockNode {
    if (given instanceof DirectionNode) {
      return given;
    }
    const node = new DirectionNode<Block>();
    this.set(node, given);
    return node;
  }

  replace(node: BlockNode, given?: any): void {
    if (node.value() instanceof Block) {
      node.value().setBlockStyle(style(given, this.mathMode()));
    } else {
      this.set(node, given);
    }
  }
}
