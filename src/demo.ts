import Direction, { DirectionNode } from "parsegraph-direction";
import { Projector, BasicProjector } from "parsegraph-projector";
import TimingBelt from "parsegraph-timingbelt";
import Pizza from "./Pizza";
import BasicPainted, {MIN_BLOCK_WIDTH, MIN_BLOCK_HEIGHT} from "./BasicPainted";
import RenderArtist from "./RenderArtist";
import paintNodeLines from "./paintNodeLines";
import paintNodeBounds from "./paintNodeBounds";
import Color from 'parsegraph-color';

const s = 100;

const artist = new RenderArtist((proj:Projector, node: DirectionNode)=>{
  const ctx = proj.overlay();
  ctx.fillStyle = "grey";
  paintNodeLines(node, 1, (x:number, y:number, w:number, h:number)=>{
    console.log("Line", x, y, w, h);
    ctx.fillRect(x-w/2, y-h/2, w, h);
  });
  ctx.fillStyle = Color.random().asRGB();
  paintNodeBounds(node, (x:number, y:number, w:number, h:number)=>{
    console.log("Bounds", x, y, w, h);
    ctx.fillRect(x-w/2, y-h/2, w, h);
  });
  return false;
});

const makeNode = ():DirectionNode=>{
  const node = new DirectionNode();
  const val = new BasicPainted(node, artist);
  val.setSize(MIN_BLOCK_WIDTH + Math.random() * s, MIN_BLOCK_HEIGHT + Math.random() * s);
  node.setValue(val);
  return node;
};

const buildGraph = () => {
  const root = makeNode();
  let par = root;

  const dirs = [
    Direction.FORWARD,
    Direction.DOWNWARD,
    Direction.UPWARD,
    Direction.BACKWARD
  ];
  for (let i = 0; i < 10; ++i) {
    const n = makeNode();
    let dir:Direction;
    while (!dir || par.hasNode(dir)) {
      dir = dirs[Math.floor(Math.random()*dirs.length)];
    }
    par.connectNode(dir, n);
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

  const pizza = new Pizza(proj);
  pizza.populate(makeNode());
  belt.addRenderable(pizza);

  const refresh = () => {
    const n = buildGraph();
    pizza.populate(n);
    proj.overlay().resetTransform();
    proj.overlay().clearRect(0, 0, proj.width(), proj.height());
    proj.overlay().translate(proj.width()/2, proj.height()/2);
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
  root.addEventListener("click", () => {
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
  });
});
