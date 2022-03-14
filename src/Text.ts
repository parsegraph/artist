import BasicPainted from "./BasicPainted";
import Size from "parsegraph-size";

export default class Text extends BasicPainted<Text> {
  _text: string;

  constructor(text: string) {
    super();
    this._text = text;
  }

  measure(size: Size): void {
    size.setSize(18 * this._text.length, 18);
  }
}
