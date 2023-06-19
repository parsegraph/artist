import { Keystroke } from "parsegraph-input";
import { matrixTransform2D, makeInverse3x3 } from "parsegraph-matrix";
import { Direction } from "parsegraph-direction";
import { KeyController } from "parsegraph-input";
import { KeyTimer } from "parsegraph-scene";
import Camera from "parsegraph-camera";

import NavportCursor from "./NavportCursor";
import { PaintedNode } from "../artist";
import { MIN_CAMERA_SCALE } from "./Navport";

const RESET_CAMERA_KEY = "Escape";
const CLICK_KEY = " ";

const MOVE_UPWARD_KEY = "ArrowUp";
const MOVE_DOWNWARD_KEY = "ArrowDown";
const MOVE_BACKWARD_KEY = "ArrowLeft";
const MOVE_FORWARD_KEY = "ArrowRight";
const MOVE_TO_FORWARD_END_KEY = "End";
const MOVE_TO_BACKWARD_END_KEY = "Home";
const MOVE_TO_UPWARD_END_KEY = "PageUp";
const MOVE_TO_DOWNWARD_END_KEY = "PageDown";

// const MOVE_UPWARD_KEY = "w";
// const MOVE_DOWNWARD_KEY = "s";
// const MOVE_BACKWARD_KEY = "a";
// const MOVE_FORWARD_KEY = "d";

const ZOOM_IN_KEY = "ZoomIn";
const ZOOM_OUT_KEY = "ZoomOut";

const KEY_CAMERA_FREE_MOVE = true;

export const FOCUS_SCALE = 2;

export default class NavportKeyController implements KeyController {
  _keys: KeyTimer;
  _cursor: NavportCursor;
  _focusScale: number;
  _camera: Camera;

  setFocusScale(scale: number) {
    // console.log("Focus scale is changing: " + scale);
    this._focusScale = scale;
  }

  getFocusScale() {
    // console.log("Reading focus scale: " + this._focusScale);
    return this._focusScale;
  }

  getRequiredScale() {
    return (
      this.getFocusScale() /
      this.focusedNode()?.value().getLayout().absoluteScale()
    );
  }

  constructor(cursor: NavportCursor, camera: Camera) {
    this._cursor = cursor;
    this._camera = camera;
    this._keys = new KeyTimer();
    this._focusScale = FOCUS_SCALE;
  }

  cursor() {
    return this._cursor;
  }

  scheduleRepaint() {
    this._cursor.scheduleRepaint();
  }

  carousel() {
    return this.cursor().carousel();
  }

  focusedNode(): PaintedNode {
    return this._cursor.focusedNode();
  }

  keydown(event: Keystroke) {
    if (!event.name().length) {
      return false;
    }

    if (this.carousel().carouselKey(event)) {
      return true;
    }

    if (this.focusedNode()) {
      return this.focusKey(event);
    }

    this._keys.keydown(event);

    if (this.navKey(event)) {
      this.scheduleRepaint();
      return true;
    }

    return false;
  }

  keyup(event: Keystroke) {
    this._keys.keyup(event);

    switch (event.name()) {
      case CLICK_KEY:
        const mouseInWorld = matrixTransform2D(
          makeInverse3x3(this.camera().worldMatrix()),
          event.x(),
          event.y()
        );
        if (
          this.carousel().clickCarousel(mouseInWorld[0], mouseInWorld[1], false)
        ) {
          return;
        }
      // fall through
      case ZOOM_IN_KEY:
      case ZOOM_OUT_KEY:
      case RESET_CAMERA_KEY:
      case MOVE_DOWNWARD_KEY:
      case MOVE_UPWARD_KEY:
      case MOVE_BACKWARD_KEY:
      case MOVE_FORWARD_KEY:
        return true;
    }
    return false;
  }

  focusMovementNavKey(event: Keystroke): boolean {
    switch (event.name()) {
      case MOVE_BACKWARD_KEY:
        this.cursor().moveOutwardly(Direction.BACKWARD);
        break;
      case MOVE_FORWARD_KEY:
        this.cursor().moveForwardly(true);
        break;
      case MOVE_TO_DOWNWARD_END_KEY:
        this.cursor().moveToEnd(Direction.DOWNWARD);
        break;
      case MOVE_TO_UPWARD_END_KEY:
        this.cursor().moveToEnd(Direction.UPWARD);
        break;
      case MOVE_TO_FORWARD_END_KEY:
        this.cursor().moveToEnd(Direction.FORWARD);
        break;
      case MOVE_TO_BACKWARD_END_KEY:
        this.cursor().moveToEnd(Direction.BACKWARD);
        break;
      case MOVE_DOWNWARD_KEY:
        this.cursor().moveInwardly(Direction.DOWNWARD);
        break;
      case MOVE_UPWARD_KEY:
        this.cursor().moveOutwardly(Direction.UPWARD);
        break;
      case "Backspace":
        this.cursor().moveFocus(Direction.OUTWARD);
        break;
      default:
        return false;
    }
    return true;
  }

  focusNavKey(event: Keystroke): boolean {
    if (this.focusMovementNavKey(event)) {
      return true;
    }
    switch (event.name()) {
      case "Tab":
        const toNode = event.shiftKey()
          ? this.focusedNode().value().interact().prevInteractive()
          : this.focusedNode().value().interact().nextInteractive();
        if (toNode) {
          this.cursor().setFocusedNode(toNode as PaintedNode);
          return true;
        }
        break;
      case "Enter":
        if (this.focusedNode().value().interact().hasKeyListener()) {
          if (this.focusedNode().value().interact().key(event)) {
            // Node handled it.
            return true;
          }
          // Nothing handled it.
        }
        if (this.focusedNode().hasNode(Direction.INWARD)) {
          return this.cursor().moveFocus(Direction.INWARD);
        } else if (this.focusedNode().hasNode(Direction.OUTWARD)) {
          return this.cursor().moveFocus(Direction.OUTWARD);
        } else if (this.focusedNode().value().interact().hasClickListener()) {
          this.scheduleRepaint();
          return this.focusedNode().value().interact().click();
        } else {
          // Nothing handled it.
          break;
        }
      case CLICK_KEY:
        this.focusedNode().value().interact().click();
        this.scheduleRepaint();
        return true;
      case ZOOM_IN_KEY:
        this.setFocusScale((1 / 1.1) * this.getFocusScale());
        this.scheduleRepaint();
        return true;
      case ZOOM_OUT_KEY:
        this.setFocusScale(1.1 * this.getFocusScale());
        this.scheduleRepaint();
        return true;
      case RESET_CAMERA_KEY:
        this.scheduleRepaint();
        return true;
      default:
        return false;
    }
  }

  focusKey(event: Keystroke) {
    const focused = this.focusedNode().value().interact();
    if (focused.hasKeyListener() && focused.key(event) !== false) {
      this.focusedNode().layoutChanged();
      this.scheduleRepaint();
      return true;
    } else if (this.focusNavKey(event)) {
      // Didn't move the caret, so interpret it as a key move
      // on the node itself.
      return true;
    } else {
      focused.click();
      focused.key(event);
      focused.click();
    }
  }

  navKey(event: Keystroke) {
    switch (event.name()) {
      case CLICK_KEY:
        // console.log("Q key for click pressed!");
        const mouseInWorld = matrixTransform2D(
          makeInverse3x3(this.camera().worldMatrix()),
          event.x(),
          event.y()
        );
        if (
          this.carousel().clickCarousel(mouseInWorld[0], mouseInWorld[1], true)
        ) {
          return;
        }
        if (this.nodeUnderCursor()) {
          this.nodeUnderCursor().value().interact().click();
          this.scheduleRepaint();
        }
      // fall through
      case RESET_CAMERA_KEY:
        if (this.carousel().isCarouselShown()) {
          this.carousel().hideCarousel();
          break;
        }
      case ZOOM_IN_KEY:
      case ZOOM_OUT_KEY:
      case MOVE_DOWNWARD_KEY:
      case MOVE_UPWARD_KEY:
      case MOVE_BACKWARD_KEY:
      case MOVE_FORWARD_KEY:
        return KEY_CAMERA_FREE_MOVE;
    }
    return false;
  }

  camera() {
    return this._camera;
  }

  nodeUnderCursor(): PaintedNode {
    return this.focusedNode();
  }

  resetCamera(complete?: boolean) {
    const defaultScale = 0.25;
    const cam = this.camera();
    let x = cam.width() / 2;
    let y = cam.height() / 2;
    if (!complete && cam.x() === x && cam.y() === y) {
      cam.setScale(defaultScale);
    } else {
      if (complete) {
        cam.setScale(defaultScale);
      }
      x = cam.width() / (2 * defaultScale);
      y = cam.height() / (2 * defaultScale);
      cam.setOrigin(x, y);
    }
  }

  tick(t: number) {
    const cam = this.camera();
    const xSpeed = 1000 / cam.scale();
    const ySpeed = 1000 / cam.scale();
    const scaleSpeed = 20;

    let needsUpdate = false;

    const keys = this._keys;
    if (keys.getKey(RESET_CAMERA_KEY)) {
      this.resetCamera(false);
      needsUpdate = true;
    }

    if (
      keys.getKey(MOVE_BACKWARD_KEY) ||
      keys.getKey(MOVE_FORWARD_KEY) ||
      keys.getKey(MOVE_UPWARD_KEY) ||
      keys.getKey(MOVE_DOWNWARD_KEY)
    ) {
      // console.log("Moving");
      const x =
        cam.x() +
        (keys.keyElapsed(MOVE_BACKWARD_KEY, t) * xSpeed +
          keys.keyElapsed(MOVE_FORWARD_KEY, t) * -xSpeed);
      const y =
        cam.y() +
        (keys.keyElapsed(MOVE_UPWARD_KEY, t) * ySpeed +
          keys.keyElapsed(MOVE_DOWNWARD_KEY, t) * -ySpeed);
      cam.setOrigin(x, y);
      needsUpdate = true;
    }

    if (keys.getKey(ZOOM_OUT_KEY)) {
      // console.log("Continuing to zoom out");
      needsUpdate = true;
      cam.zoomToPoint(
        Math.pow(1.1, scaleSpeed * keys.keyElapsed(ZOOM_OUT_KEY, t)),
        cam.width() / 2,
        cam.height() / 2
      );
    }
    if (keys.getKey(ZOOM_IN_KEY)) {
      // console.log("Continuing to zoom in");
      needsUpdate = true;
      if (cam.scale() >= MIN_CAMERA_SCALE) {
        cam.zoomToPoint(
          Math.pow(1.1, -scaleSpeed * keys.keyElapsed(ZOOM_IN_KEY, t)),
          cam.width() / 2,
          cam.height() / 2
        );
      }
    }

    return needsUpdate;
  }
}
