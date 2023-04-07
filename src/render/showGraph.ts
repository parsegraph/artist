import { PaintedNode } from "../artist";
import { Navport, SingleScreenViewportDisplayMode } from "../navport";
import render from "./render";

/**
 * Show a basic graph given a node.
 */
export default function showGraph(rootNode: PaintedNode) {
  const viewport = new Viewport(
    new SingleScreenViewportDisplayMode(),
    rootNode
  );
  return (container: Element) => {
    return render(container, viewport);
  };
}
