import { assert } from "chai";
import { NodeValues } from "../src/index";
import Direction, { DirectionNode } from "parsegraph-direction";

const buildGraph = () => {
  const root = new DirectionNode();
  let par = root;
  for (let i = 0; i < 3; ++i) {
    const n = new DirectionNode();
    par.connectNode(Direction.FORWARD, n);
    par = n;
  }
  const joint = new DirectionNode();
  par.connectNode(Direction.DOWNWARD, joint);
  par = joint;
  for (let i = 0; i < 3; ++i) {
    const n = new DirectionNode();
    par.connectNode(Direction.FORWARD, n);
    par = n;
  }
  return root;
};

describe("Package", function () {
  it("works", () => {
    const values = new NodeValues(buildGraph());
    assert.equal(values.length(), 1);
    values.include();
    assert.equal(values.length(), 2);
  });
});
