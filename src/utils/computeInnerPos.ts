import { LayoutNode } from "parsegraph-layout";
import Direction, { Alignment } from "parsegraph-direction";
import Size from "parsegraph-size";

const size = new Size();
const computeInnerPos = (
  node: LayoutNode,
  innerSize: Size
): [number, number, number] => {
  const layout = node.value().getLayout();
  layout.size(size);
  const x = layout.groupX();
  const y = layout.groupY();
  const absScale = layout.groupScale();
  if (!node.hasNode(Direction.INWARD)) {
    return [x, y, absScale];
  }

  const innerScale = node.nodeAt(Direction.INWARD).state().scale();
  if (node.nodeAlignmentMode(Direction.INWARD) == Alignment.INWARD_VERTICAL) {
    // Align vertical.
    return [
      x - (absScale * innerScale * innerSize.width()) / 2,
      y - (absScale * size.height()) / 2,
      absScale,
    ];
  }

  // Align horizontal.
  return [
    x - (absScale * size.width()) / 2,
    y - (absScale * innerScale * innerSize.height()) / 2,
    absScale,
  ];
};

export default computeInnerPos;
