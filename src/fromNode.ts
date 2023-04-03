import Camera from "parsegraph-camera";
import { LayoutNode } from "parsegraph-layout";
import { WorldTransform } from "parsegraph-scene";
import {
  makeScale3x3I,
  makeTranslation3x3I,
  matrixMultiply3x3I,
  Matrix3x3,
  matrixIdentity3x3,
} from "parsegraph-matrix";

const scaleMat = matrixIdentity3x3();
const transMat = matrixIdentity3x3();
const worldMat = matrixIdentity3x3();
const fromNode = (rootNode: LayoutNode, cam: Camera): WorldTransform => {
  const layout = rootNode.value().getLayout();
  const project = () => {
    const world: Matrix3x3 = cam.project();
    makeScale3x3I(scaleMat, layout.absoluteScale());
    makeTranslation3x3I(transMat, layout.absoluteX(), layout.absoluteY());
    matrixMultiply3x3I(worldMat, scaleMat, transMat);
    matrixMultiply3x3I(worldMat, worldMat, world);
    return world;
  };
  return new WorldTransform(
    cam.canProject() ? project() : matrixIdentity3x3(),
    cam.scale() * layout.absoluteScale(),
    cam.width(),
    cam.height(),
    cam.x() + layout.absoluteX(),
    cam.y() + layout.absoluteY()
  );
};

export default fromNode;
