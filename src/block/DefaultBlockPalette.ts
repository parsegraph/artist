import BlockPalette from "./BlockPalette";
import BlockArtist from "./BlockArtist";
import DefaultBlockScene from "./DefaultBlockScene";
import { BlockType } from "parsegraph-blockpainter";

export default class DefaultBlockPalette extends BlockPalette {
  constructor(
    blockType: BlockType = BlockType.ROUNDED,
    mathMode: boolean = false
  ) {
    super(
      new BlockArtist((projector) => {
        return new DefaultBlockScene(projector, blockType);
      }),
      mathMode
    );
  }
}
