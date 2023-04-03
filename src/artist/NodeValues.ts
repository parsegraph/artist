import { DirectionNode } from "parsegraph-direction";

export default class NodeValues<Value = any> {
  _root: DirectionNode<Value>;
  _length: number;

  constructor(root: DirectionNode<Value>) {
    this._root = root;
    this._length = 1;
  }

  length() {
    return this._length;
  }

  root() {
    return this._root;
  }

  include(count: number = 1) {
    this._length += count;
  }

  iterate(): () => DirectionNode<Value> {
    let n = this._root;
    let i = 0;
    return () => {
      if (i >= this._length) {
        return null;
      }
      ++i;
      const rv = n;
      n = n.siblings().prev() as DirectionNode<Value>;
      return rv;
    };
  }

  forEach(cb: (val: DirectionNode<Value>, i: number) => void) {
    let n = this._root;
    for (let i = 0; i < this._length; ++i) {
      cb(n, i);
      n = n.siblings().prev() as DirectionNode<Value>;
    }
  }

  map<T>(cb: (val: DirectionNode<Value>, i: number) => T): T[] {
    const rv: T[] = [];
    this.forEach((val, i) => {
      rv.push(cb(val, i));
    });
    return rv;
  }
}
