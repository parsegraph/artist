import { Keystroke } from "parsegraph-input";
import Interactive from "./Interactive";

export type KeyListener = (event: Keystroke) => boolean;
export type DragListener = (
  worldX: number,
  worldY: number,
  dx: number,
  dy: number
) => boolean;

export type EventListener = () => boolean;
export type FocusListener = (focused: boolean) => boolean;

import Method from "parsegraph-method";

export default class Interaction {
  _ignoresMouse: boolean;
  _keyListener: Method<KeyListener>;
  _clickListener: Method<EventListener>;
  _dragListener: Method<DragListener>;
  _focusListener: Method<FocusListener>;
  _prevInteractive: Interactive;
  _nextInteractive: Interactive;
  _immediateClick: boolean;

  constructor() {
    this._ignoresMouse = false;
    this._keyListener = null;
    this._clickListener = null;
    this._focusListener = null;
    this._dragListener = null;
    this._prevInteractive = null;
    this._nextInteractive = null;
    this._immediateClick = false;
  }

  nextInteractive() {
    return this._nextInteractive;
  }

  prevInteractive() {
    return this._prevInteractive;
  }

  setClickListener(listener: EventListener, thisArg?: object): void {
    if (!listener) {
      this._clickListener = null;
      return;
    }
    this._clickListener = new Method(listener, thisArg || this);
    // console.log("Set click listener for node " + this._id);
  }

  setDragListener(listener: DragListener, thisArg?: object): void {
    if (!listener) {
      this._dragListener = null;
      return;
    }
    this._dragListener = new Method(listener, thisArg || this);
  }

  hasDragListener(): boolean {
    return this._dragListener != null;
  }

  drag(worldX: number, worldY: number, dx: number, dy: number): boolean {
    if (!this.hasDragListener()) {
      return false;
    }
    return this._dragListener.call(worldX, worldY, dx, dy);
  }

  isClickable(): boolean {
    return this.hasClickListener() || !this.ignoresMouse();
  }

  setIgnoreMouse(value: boolean): void {
    this._ignoresMouse = value;
  }

  ignoresMouse(): boolean {
    return this._ignoresMouse;
  }

  setImmediateClick(value: boolean): void {
    this._immediateClick = value;
  }

  immediateClick(): boolean {
    return this._immediateClick;
  }

  hasClickListener(): boolean {
    return this._clickListener != null;
  }

  click(): any {
    // Invoke the click listener.
    if (!this.hasClickListener()) {
      return;
    }
    return this._clickListener.call(this);
  }

  setKeyListener(listener: KeyListener, thisArg?: object): void {
    if (!listener) {
      this._keyListener = null;
      return;
    }
    this._keyListener = new Method(listener, thisArg || this);
  }

  hasKeyListener(): boolean {
    return this._keyListener != null;
  }

  key(event: Keystroke): any {
    // Invoke the key listener.
    if (!this.hasKeyListener()) {
      return;
    }
    return this._keyListener.call(event);
  }

  setFocusListener(listener: FocusListener, thisArg?: object): void {
    if (!listener) {
      this._focusListener = null;
      return;
    }
    this._focusListener = new Method(listener, thisArg || this);
  }

  hasFocusListener() {
    return this._focusListener != null;
  }

  focus() {
    if (!this.hasFocusListener()) {
      return false;
    }
    return this._focusListener.call(true);
  }

  blur() {
    if (!this.hasFocusListener()) {
      return false;
    }
    return this._focusListener.call(false);
  }
}
