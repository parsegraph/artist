import { LayoutNode } from "parsegraph-layout";
import { LinePainter } from "./paintNodeLines";

export default function paintNodeBounds(
  node: LayoutNode,
  painter: LinePainter
) {
  const layout = node.value().getLayout();
  const size = layout.groupSize();
  painter(
    layout.groupX(),
    layout.groupY(),
    size.width(),
    size.height(),
  );
}
