import DOMContent, { DOMContentArtist } from "./DOMContent";
import Direction, { Alignment, DirectionNode } from "parsegraph-direction";
import { BasicProjector } from "parsegraph-projector";
import TimingBelt from "parsegraph-timingbelt";
import Pizza from "./Pizza";
import Camera from "parsegraph-camera";
import { showInCamera } from "parsegraph-showincamera";
import WorldTransform from "./WorldTransform";

const artist = new DOMContentArtist();

let COUNT = 0;
const makeNode = (cam: Camera, onUpdate: () => void): DirectionNode => {
  const node = new DirectionNode();
  const size = 24; // Math.ceil(36 * Math.random());
  // co
  const val = new DOMContent(() => {
    const c = document.createElement("div");
    c.style.fontSize = size + "px";
    c.style.pointerEvents = "all";
    c.innerText = "DOMCONTENT" + COUNT++;
    return c;
  });
  val.interact().setClickListener(() => {
    console.log("CLICK");
    const layout = node.value().getLayout();
    cam.setScale(1 / (node.state().scale() * layout.absoluteScale()));
    cam.setOrigin(
      -layout.absoluteX() + cam.width() / 2,
      -layout.absoluteY() + cam.height() / 2
    );
    onUpdate();
    return true;
  });
  val.setArtist(artist);
  val.setNode(node);
  val.setOnScheduleUpdate(onUpdate);
  node.setValue(val);
  return node;
};

const buildGraph = (cam: Camera, onUpdate: () => void) => {
  const root = makeNode(cam, onUpdate);
  let par = root;

  const dirs = [
    Direction.FORWARD,
    // Direction.DOWNWARD,
    // Direction.INWARD,
    // Direction.UPWARD,
    // Direction.BACKWARD,
  ];
  for (let i = 0; i < 3; ++i) {
    const n = makeNode(cam, onUpdate);
    let dir = Direction.NULL;
    while (dir === Direction.NULL || par.hasNode(dir)) {
      dir = dirs[Math.floor(Math.random() * dirs.length)];
    }
    par.connectNode(dir, n);
    par.setNodeAlignmentMode(Direction.INWARD, Alignment.INWARD_VERTICAL);
    par.pull(dir);
    par.state().setScale(0.85);
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
    belt.scheduleUpdate();
    cam.setSize(proj.width(), proj.height());
    const world = WorldTransform.fromCamera(rootNode, cam);
    pizza.setWorldTransform(world);
    world.apply(proj, rootNode, cam.scale());
  };

  setTimeout(() => {
    proj.overlay();
    proj.render();
    belt.addRenderable(pizza);
    cam.setSize(proj.width(), proj.height());
    showInCamera(rootNode, cam, false);
  }, 0);

  const pizza = new Pizza(proj);
  let rootNode = makeNode(cam, onUpdate);
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
    rootNode = buildGraph(cam, onUpdate);
    rootNode.value().interact().setClickListener(toggle);
    pizza.populate(rootNode);
    pizza.scheduleUpdate();
    // showInCamera(rootNode, cam, false);
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

  document.body.addEventListener("keydown", (e) => {
    const SPEED = 4;
    switch (e.key) {
      case "ArrowRight":
        cam.adjustOrigin(-SPEED, 0);
        break;
      case "+":
        cam.zoomToPoint(1.1, cam.width() / 2, cam.height() / 2);
        break;
      case "-":
        cam.zoomToPoint(0.9, cam.width() / 2, cam.height() / 2);
        break;
      case "ArrowLeft":
        cam.adjustOrigin(SPEED, 0);
        break;
      case "ArrowUp":
        cam.adjustOrigin(0, SPEED);
        break;
      case "ArrowDown":
        cam.adjustOrigin(0, -SPEED);
        break;
    }
    const world = WorldTransform.fromCamera(rootNode, cam);
    pizza.setWorldTransform(world);
    proj.overlay().resetTransform();
    proj.overlay().clearRect(0, 0, proj.width(), proj.height());
    world.apply(proj, rootNode, cam.scale());
    belt.scheduleUpdate();
  });
});
