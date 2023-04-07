import Artist, { PaintedNode, BasicPainted } from "parsegraph-artist";
import Color from "parsegraph-color";
import Size from "parsegraph-size";
import Direction, { Axis, Alignment } from "parsegraph-direction";

import BlockStyle, {
  BUD_LEAF_SEPARATION,
  BUD_TO_BUD_VERTICAL_SEPARATION,
  copyStyle,
} from "./BlockStyle";
import Font from "parsegraph-font";
import Label, { defaultFont } from "./Label";

type BlockNode = PaintedNode<Block>;

export default class Block extends BasicPainted<Block> {
  _focused: boolean;
  _label: Label;
  _selected: boolean;
  _style: BlockStyle;
  _labelWeight: number;

  constructor(node: BlockNode, style: BlockStyle, artist: Artist<Block>) {
    super(node, artist);
    this._focused = false;
    this.interact().setFocusListener(this.onFocus, this);
    this._style = style;
    this._label = null;
    this._selected = false;
    this._labelWeight = 1;
  }

  horizontalPadding(): number {
    return this.blockStyle().horizontalPadding;
  }

  verticalPadding(): number {
    return this.blockStyle().verticalPadding;
  }

  lineColor() {
    return this.isSelected()
      ? this.blockStyle().selectedLineColor
      : this.blockStyle().lineColor;
  }

  focused() {
    return this._focused;
  }

  onFocus(focus: boolean): boolean {
    // console.log("FOCUSED");
    this._focused = focus;
    this.scheduleRepaint();
    return true;
  }

  getSeparation(axis: Axis, dir: Direction) {
    switch (axis) {
      case Axis.VERTICAL:
        return this.verticalSeparation(dir);
      case Axis.HORIZONTAL:
        return this.horizontalSeparation(dir);
      case Axis.Z:
        if (this.node().hasNode(Direction.INWARD) && !this.hasLabel()) {
          switch (this.node().nodeAlignmentMode(Direction.INWARD)) {
            case Alignment.INWARD_VERTICAL:
              return this.verticalPadding() + this.borderThickness();
            default:
              return 2 * this.horizontalPadding() + this.borderThickness();
          }
        }
        switch (this.node().nodeAlignmentMode(Direction.INWARD)) {
          case Alignment.INWARD_VERTICAL:
            return this.verticalPadding() + this.borderThickness();
          default:
            return 2 * this.horizontalPadding() + this.borderThickness();
        }
    }
  }

  size(bodySize?: Size): Size {
    bodySize = this.sizeWithoutPadding(bodySize);
    bodySize[0] += 2 * this.horizontalPadding() + 2 * this.borderThickness();
    bodySize[1] += 2 * this.verticalPadding() + 2 * this.borderThickness();
    // console.log("Calculated node size of (" + bodySize[0] + ", " +
    // bodySize[1] + ")");
    return bodySize;
  }

  borderThickness(): number {
    return this.blockStyle().borderThickness;
  }

  blockStyle(): any {
    return this._style;
  }

  setBlockStyle(style: BlockStyle | string): void {
    if (typeof style === "string") {
      style = copyStyle(style);
    }
    if (this._style == style) {
      // Ignore idempotent style changes.
      return;
    }
    this._style = style as BlockStyle;
    this.invalidateLayout();
  }

  updateBlockStyle(style: object): void {
    this.setBlockStyle({
      ...this.blockStyle(),
      ...style,
    });
  }

  backdropColor(): Color {
    return this.isSelected()
      ? this.blockStyle().selectedBackgroundColor
      : this.blockStyle().backgroundColor;
  }

  hasLabel(): boolean {
    return this.realLabel() && !this.realLabel().isEmpty();
  }

  label(): string {
    if (!this.hasLabel()) {
      return null;
    }
    return this.realLabel().getText();
  }

  glyphCount(counts: any, pagesPerTexture: number): number {
    if (!this.hasLabel()) {
      return 0;
    }
    return this.realLabel().glyphCount(counts, pagesPerTexture);
  }

  realLabel(): Label {
    return this._label;
  }

  setLabel(text: string, font?: Font): void {
    if (!font) {
      font = defaultFont();
    }
    if (text === "") {
      this._label = null;
      this.invalidateLayout();
      return;
    }
    if (!this._label) {
      this._label = new Label(font);
    }
    this._label.setText(text);
    this.invalidateLayout();
  }

  labelWeight(): number {
    return this._labelWeight;
  }

  setLabelWeight(labelWeight: number) {
    this._labelWeight = labelWeight;
  }

  isSelected(): boolean {
    return this._selected;
  }

  setSelected(selected: boolean): void {
    // console.log(new Error("setSelected(" + selected + ")"));
    this._selected = selected;
  }

  sizeWithoutPadding(bodySize?: Size): Size {
    if (!bodySize) {
      // console.log(new Error("Creating size"));
      bodySize = new Size(0, 0);
    } else {
      bodySize[0] = 0;
      bodySize[1] = 0;
    }

    // Find the size of this node's drawing area.
    const style = this.blockStyle();

    const node = this.node();
    const hasInward = node.hasNode(Direction.INWARD);

    if (this.hasLabel()) {
      const label = this.realLabel();
      const scaling = style.fontSize / label.font().fontSize();
      bodySize[0] = label.width() * scaling;
      bodySize[1] = label.height() * scaling;
      if (isNaN(bodySize[0]) || isNaN(bodySize[1])) {
        throw new Error("Label returned a NaN size.");
      }
    } else if (!hasInward) {
      bodySize[0] = style.minWidth;
      bodySize[1] = style.minHeight;
    }

    if (hasInward) {
      const nestedNode = node.nodeAt(Direction.INWARD);
      const nestedSize = nestedNode.value().getLayout().extentSize();
      const scale = nestedNode.state().scale();

      if (
        node.nodeAlignmentMode(Direction.INWARD) == Alignment.INWARD_VERTICAL
      ) {
        // Align vertical.
        bodySize.setWidth(
          Math.max(bodySize.width(), scale * nestedSize.width())
        );

        if (this.hasLabel()) {
          // Allow for the content's size.
          bodySize.setHeight(
            Math.max(
              style.minHeight,
              bodySize.height() +
                this.verticalPadding() +
                scale * nestedSize.height()
            )
          );
        } else {
          bodySize.setHeight(
            Math.max(bodySize.height(), scale * nestedSize.height())
          );
        }
      } else {
        // Align horizontal.
        if (this.hasLabel()) {
          // Allow for the content's size.
          bodySize.setWidth(
            bodySize.width() +
              this.horizontalPadding() +
              scale * nestedSize.width()
          );
        } else {
          // console.log(bodySize.width(), scale * nestedSize.width(), scale);
          bodySize.setWidth(
            Math.max(bodySize.width(), scale * nestedSize.width())
          );
        }

        bodySize.setHeight(
          Math.max(bodySize.height(), scale * nestedSize.height())
        );
      }
    }

    // Buds appear circular
    if (this.isBud() && !hasInward) {
      const aspect = bodySize.width() / bodySize.height();
      if (aspect < 2 && aspect > 1 / 2) {
        bodySize.setWidth(Math.max(bodySize.width(), bodySize.height()));
        bodySize.setHeight(bodySize.width());
      }
    }

    if (style.mathMode) {
      bodySize.setWidth(Math.max(bodySize.width(), style.minWidth));
      bodySize.setHeight(Math.max(bodySize.height(), style.minHeight));
    }

    return bodySize;
  }

  isBud() {
    return this.blockStyle().bud;
  }

  verticalSeparation(direction: Direction): number {
    const node = this.node();
    if (
      this.isBud() &&
      node.nodeAt(direction)?.value() instanceof Block &&
      node.nodeAt(direction).value().isBud()
    ) {
      return (
        this.blockStyle().verticalSeparation + BUD_TO_BUD_VERTICAL_SEPARATION
      );
    }
    return this.blockStyle().verticalSeparation;
  }

  horizontalSeparation(direction: Direction): number {
    const node = this.node();
    const style = this.blockStyle();

    if (
      node.hasNode(direction) &&
      node.nodeAt(direction).value() instanceof Block &&
      node.nodeAt(direction).value().isBud() &&
      !node.nodeAt(direction).hasAnyNodes()
    ) {
      return BUD_LEAF_SEPARATION * style.horizontalSeparation;
    }
    return style.horizontalSeparation;
  }
}
