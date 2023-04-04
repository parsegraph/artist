import { LayoutNode } from "parsegraph-layout";
import { Projector } from "parsegraph-projector";

const applyTransform = (
  proj: Projector,
  rootNode: LayoutNode,
  camX: number,
  camY: number,
  camScale: number = 1
) => {
  const layout = rootNode.value().getLayout();
  if (proj.hasOverlay()) {
    const overlay = proj.overlay();
    overlay.resetTransform();
    overlay.clearRect(0, 0, proj.width(), proj.height());

    overlay.translate(camX, camY);
    overlay.scale(camScale, camScale);
    overlay.scale(layout.absoluteScale(), layout.absoluteScale());
  }
  if (proj.hasDOMContainer()) {
    const camScaleTx = `scale(${camScale}, ${camScale})`;
    const translate = `translate(${camX}px, ${camY}px)`;
    const nodeScale = `scale(${layout.absoluteScale()}, ${layout.absoluteScale()})`;
    proj.getDOMContainer().style.transform = [
      translate,
      camScaleTx,
      nodeScale,
    ].join(" ");
  }
};

export default applyTransform;
