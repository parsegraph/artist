import DOMContent, { DOMContentArtist } from "./DOMContent";
import Direction, { Alignment, DirectionNode } from "parsegraph-direction";
import { BasicProjector } from "parsegraph-projector";
import TimingBelt from "parsegraph-timingbelt";
import Pizza from "./Pizza";
import Camera from "parsegraph-camera";
import { showInCamera } from "parsegraph-showincamera";
import WorldTransform from "./WorldTransform";
import {
  makeScale3x3I,
  makeTranslation3x3I,
  matrixMultiply3x3I,
  Matrix3x3,
  matrixIdentity3x3,
} from "parsegraph-matrix";

const artist = new DOMContentArtist();

const makeNode = (onUpdate: () => void): DirectionNode => {
  const node = new DirectionNode();
  const size = Math.ceil(36 * Math.random());
  const val = new DOMContent(() => {
    const c = document.createElement("div");
    c.style.fontSize = size + "px";
    c.style.pointerEvents = "all";
    c.innerText = "DOM";
    return c;
  });
  val.setArtist(artist);
  val.setNode(node);
  val.setOnScheduleUpdate(onUpdate);
  node.setValue(val);
  return node;
};

const buildGraph = (onUpdate: () => void) => {
  const root = makeNode(onUpdate);
  let par = root;

  const dirs = [
    Direction.INWARD,
  ];
  for (let i = 0; i < 20; ++i) {
    const n = makeNode(onUpdate);
    let dir = Direction.NULL;
    while (dir === Direction.NULL || par.hasNode(dir)) {
      dir = dirs[Math.floor(Math.random() * dirs.length)];
    }
    par.connectNode(dir, n);
    par.setNodeAlignmentMode(Direction.INWARD, Alignment.INWARD_VERTICAL);
    par.pull(dir);
    par = n;
  }
  return root;
};

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("demo");
  root.style.position = "relative";

  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "0px";
  container.style.top = "0px";
  container.style.pointerEvents = "none";
  root.appendChild(container);
  container.style.fontSize = "18px";
  container.style.fontFamily = "sans";
  const proj = new BasicProjector();
  const belt = new TimingBelt();
  container.appendChild(proj.container());

  const cam = new Camera();

  const onUpdate = () => {
    console.log("Updating from belt");
    belt.scheduleUpdate();
    console.log(proj.width(), proj.height());
    cam.setSize(proj.width(), proj.height());
    showInCamera(rootNode, cam, false);
    console.log(cam.toJSON());
    const layout = rootNode.value().getLayout();
    const project = () => {
      const world: Matrix3x3 = cam.project();

      const scaleMat = matrixIdentity3x3();
      const transMat = matrixIdentity3x3();
      const worldMat = matrixIdentity3x3();
      makeScale3x3I(scaleMat, layout.absoluteScale());
      makeTranslation3x3I(transMat, layout.absoluteX(), layout.absoluteY());
      matrixMultiply3x3I(worldMat, scaleMat, transMat);
      matrixMultiply3x3I(worldMat, worldMat, world);
      return world;
    };
    pizza.setWorldTransform(
      new WorldTransform(
        cam.canProject() ? project() : matrixIdentity3x3(),
        cam.scale() * rootNode.state().scale(),
        cam.width(),
        cam.height(),
        cam.x() + layout.absoluteX(),
        cam.y() + layout.absoluteY()
      )
    );
    if (cam && proj.hasOverlay()) {
      const overlay = proj.overlay();
      overlay.resetTransform();
      overlay.clearRect(0, 0, proj.width(), proj.height());

      overlay.scale(cam.scale(), cam.scale());
      overlay.translate(
        cam.x() + layout.absoluteX(),
        cam.y() + layout.absoluteY()
      );
      overlay.scale(layout.absoluteScale(), layout.absoluteScale());
    }
    if (cam && proj.hasDOMContainer()) {
      const camScale = `scale(${cam.scale()}, ${cam.scale()})`;
      const translate = `translate(${cam.x() + layout.absoluteX()}px, ${
        cam.y() + layout.absoluteY()
      }px)`;
      const nodeScale = `scale(${layout.absoluteScale()}, ${layout.absoluteScale()})`;
      proj.getDOMContainer().style.transform = [
        camScale,
        translate,
        nodeScale,
      ].join(" ");
      console.log("Adding cont");
    }
  };

  setTimeout(() => {
    proj.overlay();
    proj.render();
    belt.addRenderable(pizza);
  }, 0);

  const pizza = new Pizza(proj);
  let rootNode = makeNode(onUpdate);
  const toggle = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
      clearInterval(dotTimer);
      dotTimer = null;
      dot.style.transition = "background-color 3s";
      dot.style.backgroundColor = "#222";
    } else {
      refresh();
      dot.style.transition = "background-color 400ms";
      refreshDot();
      timer = setInterval(refresh, interval);
      dotTimer = setInterval(refreshDot, dotInterval);
    }
  };
  rootNode.value().interact().setClickListener(toggle);
  pizza.populate(rootNode);

  const refresh = () => {
    rootNode = buildGraph(onUpdate);
    rootNode.value().interact().setClickListener(toggle);
    pizza.populate(rootNode);
    belt.scheduleUpdate();
    const rand = () => Math.floor(Math.random() * 255);
    document.body.style.backgroundColor = `rgb(${rand()}, ${rand()}, ${rand()})`;
    container.style.color = `rgb(${rand()}, ${rand()}, ${rand()})`;
  };

  const dot = document.createElement("div");
  dot.style.position = "absolute";
  dot.style.right = "8px";
  dot.style.top = "8px";
  dot.style.width = "16px";
  dot.style.height = "16px";
  dot.style.borderRadius = "8px";
  dot.style.transition = "background-color 400ms";
  dot.style.backgroundColor = "#222";
  root.appendChild(dot);

  container.style.transition = "color 2s, left 2s, top 2s";
  document.body.style.transition = "background-color 2s";
  let timer: any = null;
  let dotTimer: any = null;
  let dotIndex = 0;
  const dotState = ["#f00", "#c00"];
  const refreshDot = () => {
    dotIndex = (dotIndex + 1) % dotState.length;
    dot.style.backgroundColor = dotState[dotIndex];
  };
  const interval = 3000;
  const dotInterval = 500;
});
