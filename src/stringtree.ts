import DOMContent, { DOMContentArtist } from "./DOMContent";
import Direction, { Alignment, DirectionNode } from "parsegraph-direction";
import { BasicProjector } from "parsegraph-projector";
import TimingBelt from "parsegraph-timingbelt";
import Pizza from "./Pizza";
import Camera from "parsegraph-camera";
import { showInCamera } from "parsegraph-showincamera";
import { WorldTransform } from "parsegraph-scene";

const artist = new DOMContentArtist();

let COUNT = 0;
const makeNode = (cam: Camera, onUpdate: () => void): DirectionNode => {
  const node = new DirectionNode();
  const size = 24; // Math.ceil(36 * Math.random());
  // co
  const c = document.createElement("div");
  c.style.fontSize = size + "px";
  c.style.pointerEvents = "all";
  c.innerText = "DOMCONTENT" + COUNT++;
  const val = new DOMContent(() => c);
  val.interact().setClickListener(() => {
    const layout = node.value().getLayout();
    console.log(layout.absoluteScale(), node.state().scale());
    cam.setScale(1 / layout.absoluteScale());
    cam.setOrigin(
      -layout.absoluteX() + cam.width() / 2 / cam.scale(),
      -layout.absoluteY() + cam.height() / 2 / cam.scale()
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
    proj.overlay().resetTransform();
    proj.overlay().clearRect(0, 0, proj.width(), proj.height());
    pizza.setWorldTransform(world);
  };

  setTimeout(() => {
    proj.overlay();
    proj.render();
    belt.addRenderable(pizza);
    cam.setSize(proj.width(), proj.height());
    showInCamera(rootNode, cam, false);
  }, 0);

  const pizza = new Pizza(proj);
  const rootNode = buildGraph(cam, onUpdate);
  pizza.populate(rootNode);

  document.body.addEventListener("keydown", (e) => {
    const SPEED = 4;
    switch (e.key) {
      case "ArrowRight":
        cam.adjustOrigin(-SPEED, 0);
        break;
      case "=":
      case "+":
        cam.zoomToPoint(1.1, cam.width() / 2, cam.height() / 2);
        break;
      case "_":
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
    world.applyTransform(proj, rootNode, cam.scale());
    belt.scheduleUpdate();
  });
});
