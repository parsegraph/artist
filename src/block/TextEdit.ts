import BlockType from "./BlockType";
import BlockNode from './BlockNode';
import {DOMContent, DOMContentArtist} from "parsegraph-artist";

const domArtist = new DOMContentArtist();

type TextNodeCallback = (val:string)=>Promise<void>;

export default class TextEditNode extends BlockNode {
  _callback: TextNodeCallback;

  constructor(type: string | BlockType, initialText: string = "", callback: TextNodeCallback = null) {
    super(type);

    const block = this.value();

    const div = document.createElement("div");
    const c = document.createElement("input");
    c.style.pointerEvents = "all";
    c.value = initialText;

    const returnToView = () => {
      this.setValue(block);
      block.setNode(this);
    };

    const commit = () => {
      origValue = c.value;
      returnToView();
    };

    let origValue = initialText;
    c.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        // Commit
        e.preventDefault();
        if (!this._callback) {
          commit();
          return;
        }
        this._callback(c.value)
          .then(() => {
            commit();
          })
          .catch(() => {});
      } else if (e.key === "Escape") {
        // Cancel
        e.preventDefault();
        c.value = origValue;
        returnToView();
      }
    });
    div.appendChild(c);
    const edit = new DOMContent(() => div);
    edit.setArtist(domArtist);

    block.interact().setClickListener(() => {
      // Replace with DOMContent
      edit.setNode(this as any);
      (this as any).setValue(edit);
      return false;
    });

    this.setCallback(callback);
  }

  setCallback(callback: TextNodeCallback) {
    this._callback = callback;
  }
}
