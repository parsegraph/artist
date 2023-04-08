import { Keystroke } from "parsegraph-input";
import NavportCursor from "./NavportCursor";
import { PaintedNode } from "../artist";
import { Direction } from "parsegraph-direction";
import { KeyController } from "parsegraph-input";

const CLICK_KEY = " ";

const MOVE_UPWARD_KEY = "ArrowUp";
const MOVE_DOWNWARD_KEY = "ArrowDown";
const MOVE_BACKWARD_KEY = "ArrowLeft";
const MOVE_FORWARD_KEY = "ArrowRight";
const MOVE_TO_FORWARD_END_KEY = "End";
const MOVE_TO_BACKWARD_END_KEY = "Home";
const MOVE_TO_UPWARD_END_KEY = "PageUp";
const MOVE_TO_DOWNWARD_END_KEY = "PageDown";

export default class CursorKeyController implements KeyController {
  _cursor: NavportCursor;

  constructor(cursor: NavportCursor) {
    this._cursor = cursor;
  }

  cursor() {
    return this._cursor;
  }

  scheduleRepaint() {
    this.cursor().scheduleUpdate();
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
    // this.nav().showInCamera(null);

    if (this.focusedNode()) {
      return this.focusKey(event);
    }

    if (this.navKey(event)) {
      this.scheduleRepaint();
      return true;
    }

    return false;
  }

  keyup(event: Keystroke) {
    switch (event.name()) {
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
        if (this.nodeUnderCursor()) {
          this.nodeUnderCursor().value().interact().click();
          this.scheduleRepaint();
          return true;
        }
        break;
    }
    return false;
  }

  camera() {
    return this.nav().camera();
  }

  nodeUnderCursor(): PaintedNode {
    return this.focusedNode();
  }

  tick() {
    return false;
  }
}
