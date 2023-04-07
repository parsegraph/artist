import Direction, { Alignment, nameDirection } from "parsegraph-direction";
import Color from "parsegraph-color";
import { Pizza } from "parsegraph-artist";
import { WorldTransform } from "parsegraph-scene";
import Block from "./Block";
import { DirectionCaret } from "parsegraph-direction";
import { BasicProjector } from "parsegraph-projector";
import Camera from "parsegraph-camera";
import { showInCamera } from "parsegraph-showincamera";
import DefaultBlockPalette from "./DefaultBlockPalette";
import BlockCaret from "./BlockCaret";
import { copyStyle } from "./BlockStyle";

import { WorldLabels } from "parsegraph-scene";

const palette = new DefaultBlockPalette();

const dirs = [
  Direction.FORWARD,
  Direction.DOWNWARD,
  Direction.INWARD,
  Direction.UPWARD,
  Direction.BACKWARD,
];
const randDir = () => {
  return dirs[Math.floor(Math.random() * dirs.length)];
};

const buildGraphRandom = () => {
  const car = new DirectionCaret<Block>("u", palette);

  const root = car.root();

  for (let i = 0; i < 20; ++i) {
    let dir = Direction.NULL;
    while (dir === Direction.NULL || car.has(dir)) {
      dir = randDir();
    }
    car.spawn(dir, Math.random() > 0.5 ? "b" : "u");
    if (dir === Direction.INWARD) {
      car.align(
        dir,
        Math.random() > 0.5
          ? Alignment.INWARD_VERTICAL
          : Alignment.INWARD_HORIZONTAL
      );
    }
    car
      .node()
      .value()
      .setLabel(Math.random() > 0.5 ? "parsegraph" : "");
    car.pull(dir);
    car.move(dir);
    if (Math.random() > 0.5) {
      car.shrink();
    }
  }
  return root;
};

const buildGraphSwitch = () => {
  const car = new BlockCaret("u", palette);
  car.spawnMove("i", "u");
  car.spawnMove("f", "u");
  car.label("parsegraph");
  car.spawnMove("f", "b");
  car.spawnMove("f", "b");
  car.spawnMove("i", "u");
  car.push();
  car.spawnMove("i", "u");
  car.spawnMove("d", "u");
  car.pop();
  car.spawnMove("d", "u");
  car.label("parsegraph");
  car.spawnMove("d", "b");
  return car.root();
};

const buildGraphBuds = () => {
  const car = new BlockCaret("u", palette);
  const max = Math.random() * 10;
  for (let i = 0; i < max; ++i) {
    car.spawnMove("i", Math.random() > 0.5 ? "u" : "b");
  }
  return car.root();
};

const buildGraphLogo = () => {
  const car = new BlockCaret("u", palette);
  car.spawn("f", "u");
  car.spawn("b", "u");
  car.spawnMove("d", "b");
  car.label("Parsegraph");
  return car.root();
};

const buildGraphLong = () => {
  const car = new BlockCaret("u", palette);
  const dir = randDir();
  const smallBlock = copyStyle("b");
  smallBlock.fontSize /= 3;
  for (let i = 0; i < 30; ++i) {
    car.spawnMove(dir, "b");
    car.label(nameDirection(dir));
    if (Math.random() > 0.5) {
      car.shrink();
    } else {
      car.node().value().setBlockStyle(smallBlock);
    }
  }
  return car.root();
};

const buildGraphDashed = () => {
  const car = new BlockCaret("u", palette);
  const dir = randDir();
  const dashedBlock = copyStyle("b");
  dashedBlock.dashes = [5, 5];
  dashedBlock.borderThickness = 4;
  dashedBlock.borderColor = new Color(1, 1, 1, 1);
  dashedBlock.backgroundColor = new Color(0.8, 0.8, 1, 0);
  dashedBlock.fontColor = new Color(1, 1, 1, 1);
  for (let i = 0; i < 30; ++i) {
    car.spawnMove(dir, "b");
    car.label(nameDirection(dir));
    car.node().value().setBlockStyle(dashedBlock);
  }
  return car.root();
};

const buildGraph = () => {
  const builders = [
    buildGraphLogo,
    buildGraphBuds,
    buildGraphSwitch,
    buildGraphRandom,
    buildGraphRandom,
    buildGraphRandom,
    buildGraphLong,
    buildGraphDashed,
  ];
  return builders[Math.floor(Math.random() * builders.length)]();
};

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("demo");
  root.style.position = "relative";

  const proj = new BasicProjector();
  root.appendChild(proj.container());

  const labels = new WorldLabels();

  setTimeout(() => {
    proj.glProvider().canvas();
    proj.overlay();
    proj.render();
    proj.glProvider().gl().viewport(0, 0, proj.width(), proj.height());
    proj.overlay().resetTransform();
    proj.overlay().translate(proj.width() / 2, proj.height() / 2);
    cam.setSize(proj.width(), proj.height());
    const wt = WorldTransform.fromCamera(pizza.root(), cam);
    wt.setLabels(labels);
    pizza.setWorldTransform(wt);
  }, 0);

  const pizza = new Pizza(proj);

  const cam = new Camera();
  const n = palette.spawn();
  n.value().setLabel("No time");
  pizza.populate(n);

  const redraw = () => {
    labels.clear();
    cam.setSize(proj.width(), proj.height());
    proj.overlay().resetTransform();
    proj.overlay().clearRect(0, 0, proj.width(), proj.height());
    proj.overlay().scale(cam.scale(), cam.scale());
    proj.overlay().translate(cam.x(), cam.y());
    const wt = WorldTransform.fromCamera(pizza.root(), cam);
    wt.setLabels(labels);
    pizza.setWorldTransform(wt);
    pizza.paint();
    pizza.render();
    const ctx = proj.overlay();
    ctx.lineCap = "square";
    labels.render(
      proj,
      -cam.x() + cam.width() / cam.scale() / 2,
      -cam.y() + cam.height() / cam.scale() / 2,
      cam.width() / cam.scale(),
      cam.height() / cam.scale(),
      cam.scale()
    );

    ctx.resetTransform();
    ctx.font = "18px sans-serif";
    ctx.fillStyle = "black";
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.fillText(`scale=${cam.scale()}`, 0, 0);
  };

  const refresh = () => {
    proj.overlay().resetTransform();
    proj.overlay().clearRect(0, 0, proj.width(), proj.height());
    const n = buildGraph();
    pizza.populate(n);
    showInCamera(n, cam, false);
    redraw();
    // const rand = () => Math.floor(Math.random() * 255);
    // document.body.style.backgroundColor = `rgb(${rand()}, ${rand()}, ${rand()})`;
    // document.body.style.backgroundColor = `rgb(233, 204, 164)`;
    // Pine cone
    // document.body.style.backgroundColor = `rgb(221, 210, 186)`;
    // document.body.style.backgroundColor = `rgb(177, 156, 149)`;
    document.body.style.backgroundColor = `rgb(149, 149, 149)`;
    // document.body.style.backgroundColor = `rgb(221, 210, 186)`;
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
  root.tabIndex = 0;
  root.focus();

  let clicked = false;
  root.addEventListener("touchstart", (e) => {
    clicked = true;
  });
  let lastTouch = [0, 0];
  root.addEventListener("touchmove", (e) => {
    const [movementX, movementY] = [
      e.touches[0].clientX - lastTouch[0],
      e.touches[0].clientY - lastTouch[1],
    ];
    lastTouch = [e.touches[0].clientX, e.touches[0].clientY];
    cam.adjustOrigin(movementX / cam.scale(), movementY / cam.scale());
  });
  root.addEventListener("touchend", (e) => {
    clicked = false;
  });
  root.addEventListener("mousedown", (e) => {
    if (e.button === 0) {
      clicked = true;
    }
  });
  root.addEventListener("mousemove", (e) => {
    if (!clicked) {
      return;
    }
    console.log(e.movementX);
    cam.adjustOrigin(e.movementX / cam.scale(), e.movementY / cam.scale());
    redraw();
  });
  root.addEventListener("mouseup", (e) => {
    if (e.button === 0) {
      clicked = false;
    }
  });
  root.addEventListener("wheel", (e) => {
    const zoomIn = (e as WheelEvent).deltaY < 0;
    console.log(e);
    cam.zoomToPoint(zoomIn ? 1.1 : 0.9, e.clientX, e.clientY);
    redraw();
  });
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
