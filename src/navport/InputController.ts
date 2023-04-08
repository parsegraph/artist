import { INTERVAL } from "parsegraph-timingbelt";
import { PaintedNode } from "../artist";
import Navport from "./Navport";
import { Projector } from "parsegraph-projector";

import { FocusInput, TouchInput, MouseInput, KeyInput } from "parsegraph-input";
import NavportCursor from "./NavportCursor";
import NavportKeyController from "./NavportKeyController";
import NavportMouseController from "./NavportMouseController";
import log from "parsegraph-log";

export const TOUCH_SENSITIVITY = 1;
export const MOUSE_SENSITIVITY = 1;

// The amount by which a slider is adjusted by keyboard and mouse events.
export const SLIDER_NUDGE = 0.01;

// How many milliseconds to commit a layout if an input event is detected.
export const INPUT_LAYOUT_TIME = INTERVAL;

export default class InputController {
  _nav: Navport;
  _cursor: NavportCursor;
  _key: NavportKeyController;
  _mouse: NavportMouseController;
  _showCursor: boolean;

  _inputs: Map<Projector, Input>;

  constructor(nav: Navport) {
    this._nav = nav;
    this._inputs = new Map();

    this._cursor = new NavportCursor(nav);
    this._showCursor = true;

    this._key = new NavportKeyController(this._cursor);
    this._mouse = new NavportMouseController(nav);
  }

  mouse() {
    return this._mouse;
  }

  key() {
    return this._key;
  }

  cursor() {
    return this._cursor;
  }

  carousel() {
    return this.nav().carousel();
  }

  scheduleRepaint() {
    this.world().value().scheduleRepaint();
    this.nav().scheduleRepaint();
  }

  camera() {
    return this._nav.camera();
  }

  width() {
    return this.nav().camera().width();
  }

  height() {
    return this.nav().camera().height();
  }

  focusedNode(): PaintedNode {
    return this._cursor.focusedNode();
  }

  menu() {
    return this.nav().menu();
  }

  nav() {
    return this._nav;
  }

  world(): PaintedNode {
    return this.nav().root();
  }

  handleEvent(eventType: string, eventData: any, proj: Projector): boolean {
    // console.log(eventType, eventData);
    if (eventType === "blur") {
      this.nav().menu().closeMenu();
      return true;
    }
    console.log("Unhandled event type: " + eventType);
    return false;
  }

  update(t: Date) {
    let needsUpdate = this._mouse.update(t);
    if (needsUpdate) {
      log("Input tick needs update from mouse");
    }
    needsUpdate = this._key.update(t) || needsUpdate;
    if (needsUpdate) {
      log("Input tick needs update from key or mouse");
    }
    needsUpdate = this._cursor.update(t) || needsUpdate;
    if (needsUpdate) {
      log("Input tick needs update from key or mouse or cursor");
    }
    if (needsUpdate) {
      log("Input tick needs update");
    }
    return needsUpdate;
  }

  paint(projector: Projector): boolean {
    if (!this._inputs.has(projector)) {
      const input = new Input(
        projector.glProvider().container(),
        projector.glProvider().container()
      );
      input.mouse().setControl(this._mouse);
      input.focus().setControl(this._mouse);
      input.touch().setControl(this._mouse);
      input.key().setControl(this._key);
      this._inputs.set(projector, input);
    }
    return this._cursor.paint(projector);
  }

  render(proj: Projector) {
    return this._cursor.render(proj);
  }
}
