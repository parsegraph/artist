import PaintedNode from "./PaintedNode";
import BasicPainted from "./BasicPainted";
import Artist from "./Artist";
import {Projector } from "parsegraph-projector";
import NodeValues from "./NodeValues";
import Size from 'parsegraph-size';
import AbstractScene from "./AbstractScene";

class LabelScene extends AbstractScene {

  constructor(

}

class LabelArtist implements Artist<Label> {
  patch() {
    return false;
  }

  make(projector:Projector, seq:NodeValues<Label>) {

  }
}

const labelArtist = new LabelArtist();

export default class Label extends BasicPainted<Label> {
  _text: string;
  _measuredSize: Size;
  _measured: boolean;

  constructor(node: PaintedNode<Label> = null, text: string = "") {
    super(node, labelArtist);
    this.setText(text);
    this._measuredSize = new Size();
  }

  measure(size: Size): void {
    if (!this._measuredSize) {
      this._measuredSize = new Size();
    }

    size.copyFrom(this._measuredSize);
  }

  setText(text: string) {
    this._text = text;
    this.invalidateLayout();
  }
}
