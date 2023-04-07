import Color from "parsegraph-color";
import Type, { readType } from "./BlockType";

const BUD_RADIUS = 16;
const HORIZONTAL_SEPARATION_PADDING = 2 * BUD_RADIUS;
const VERTICAL_SEPARATION_PADDING = 2 * BUD_RADIUS;
export const FONT_SIZE = BUD_RADIUS;

// Configures graphs to appear grid-like; I call it 'math-mode'.
export const MIN_BLOCK_WIDTH_MATH = BUD_RADIUS * 4;
export const MIN_BLOCK_HEIGHT_MATH = MIN_BLOCK_WIDTH_MATH;
export const HORIZONTAL_SEPARATION_PADDING_MATH = 2;
export const VERTICAL_SEPARATION_PADDING_MATH = 2;

/**
 * The separation between leaf buds and their parents.
 */
export const BUD_LEAF_SEPARATION = 1;

export const BUD_TO_BUD_VERTICAL_SEPARATION = VERTICAL_SEPARATION_PADDING / 2; // BUD_RADIUS * 4.5;

type BlockStyle = {
  bud: boolean;
  mathMode: boolean;
  minWidth: number;
  minHeight: number;
  horizontalPadding: number;
  verticalPadding: number;
  borderColor: Color;
  backgroundColor: Color;
  selectedBorderColor: Color;
  selectedBackgroundColor: Color;
  brightness: number;
  borderRoundness: number;
  borderThickness: number;
  fontColor: Color;
  selectedFontColor: Color;
  fontSize: number;
  letterWidth: number;
  verticalSeparation: number;
  horizontalSeparation: number;
  lineColor: Color;
  selectedLineColor: Color;
  dashes?: number[];
};

export const LINE_COLOR = new Color(0.5, 0.4, 0.4, 0.5);
export const SELECTED_LINE_COLOR = new Color(0.8, 0.8, 0.8, 1);
export const LINE_THICKNESS = BUD_RADIUS / 16;

const BACKGROUND_COLOR = new Color(250 / 255, 244 / 255, 236 / 255, 0.2);
const SLOT_BACKGROUND_COLOR = new Color(0.73, 0.726, 0.719, 0.2);
const FONT_COLOR = new Color(0.125, 0.125, 0.125, 1);

const lineColor = LINE_COLOR;
const selectedLineColor = lineColor;
const borderColor = lineColor;
const selectedBorderColor = lineColor;

const BORDER_THICKNESS = 0.05;

const BUD_STYLE = {
  bud: true,
  minWidth: BUD_RADIUS,
  minHeight: BUD_RADIUS,
  horizontalPadding: BUD_RADIUS / 4,
  verticalPadding: BUD_RADIUS / 4,
  borderColor: borderColor,
  backgroundColor: BACKGROUND_COLOR,
  selectedBorderColor: selectedBorderColor,
  selectedBackgroundColor: new Color(1, 1, 0.7, 1),
  brightness: 1.5,
  borderRoundness: BUD_RADIUS + BUD_RADIUS / 2,
  borderThickness: BORDER_THICKNESS,
  fontColor: FONT_COLOR,
  selectedFontColor: new Color(0, 0, 0, 1),
  fontSize: FONT_SIZE,
  letterWidth: 0.61,
  verticalSeparation: VERTICAL_SEPARATION_PADDING,
  horizontalSeparation: HORIZONTAL_SEPARATION_PADDING,
  lineColor: lineColor,
  selectedLineColor: selectedLineColor,
};

const BLOCK_STYLE: BlockStyle = {
  bud: false,
  mathMode: false,
  minWidth: BUD_RADIUS * 3,
  minHeight: BUD_RADIUS,
  horizontalPadding: BUD_RADIUS / 2,
  verticalPadding: BUD_RADIUS / 4,
  borderColor: borderColor,
  backgroundColor: BACKGROUND_COLOR,
  selectedBorderColor: selectedBorderColor,
  selectedBackgroundColor: new Color(0.75, 0.75, 1, 1),
  brightness: 0.75,
  borderRoundness: BUD_RADIUS / 4,
  borderThickness: BORDER_THICKNESS,
  fontColor: FONT_COLOR,
  selectedFontColor: new Color(0, 0, 0, 1),
  fontSize: FONT_SIZE,
  letterWidth: 0.61,
  verticalSeparation: VERTICAL_SEPARATION_PADDING,
  horizontalSeparation: HORIZONTAL_SEPARATION_PADDING,
  lineColor: lineColor,
  selectedLineColor: selectedLineColor,
};

const SLOT_STYLE: BlockStyle = {
  bud: false,
  mathMode: false,
  minWidth: BLOCK_STYLE.minWidth,
  minHeight: BLOCK_STYLE.minHeight,
  horizontalPadding: BLOCK_STYLE.horizontalPadding,
  verticalPadding: BLOCK_STYLE.verticalPadding,
  borderColor: borderColor,
  backgroundColor: SLOT_BACKGROUND_COLOR,
  selectedBorderColor: selectedBorderColor,
  selectedBackgroundColor: new Color(0.9, 1, 0.9, 1),
  brightness: 0.75,
  borderRoundness: BLOCK_STYLE.borderRoundness,
  borderThickness: BORDER_THICKNESS,
  fontColor: FONT_COLOR,
  selectedFontColor: new Color(0, 0, 0, 1),
  fontSize: FONT_SIZE,
  letterWidth: 0.61,
  verticalSeparation: VERTICAL_SEPARATION_PADDING,
  horizontalSeparation: HORIZONTAL_SEPARATION_PADDING,
  lineColor: lineColor,
  selectedLineColor: selectedLineColor,
};

const BLOCK_MATH_STYLE: BlockStyle = {
  bud: false,
  mathMode: true,
  minWidth: MIN_BLOCK_WIDTH_MATH,
  minHeight: MIN_BLOCK_HEIGHT_MATH,
  horizontalPadding: 2 * BUD_RADIUS,
  verticalPadding: 0.5 * BUD_RADIUS,
  borderColor: borderColor,
  backgroundColor: BACKGROUND_COLOR,
  selectedBorderColor: selectedBorderColor,
  selectedBackgroundColor: new Color(0.75, 0.75, 1, 1),
  brightness: 0.75,
  borderRoundness: BUD_RADIUS / 4,
  borderThickness: BORDER_THICKNESS,
  fontColor: FONT_COLOR,
  selectedFontColor: new Color(0, 0, 0, 1),
  fontSize: FONT_SIZE,
  letterWidth: 0.61,
  verticalSeparation: 6 * VERTICAL_SEPARATION_PADDING_MATH,
  horizontalSeparation: 7 * HORIZONTAL_SEPARATION_PADDING_MATH,
  lineColor: lineColor,
  selectedLineColor: selectedLineColor,
};

const SLOT_MATH_STYLE = {
  bud: false,
  mathMode: true,
  minWidth: MIN_BLOCK_WIDTH_MATH,
  minHeight: MIN_BLOCK_HEIGHT_MATH,
  horizontalPadding: BLOCK_MATH_STYLE.horizontalPadding,
  verticalPadding: BLOCK_MATH_STYLE.verticalPadding,
  borderRoundness: BLOCK_MATH_STYLE.borderRoundness,
  borderThickness: BLOCK_MATH_STYLE.borderThickness,
  borderColor: SLOT_STYLE.borderColor,
  backgroundColor: SLOT_STYLE.backgroundColor,
  selectedBorderColor: SLOT_STYLE.selectedBorderColor,
  selectedBackgroundColor: SLOT_STYLE.selectedBackgroundColor,
  brightness: SLOT_STYLE.brightness,
  fontColor: new Color(0, 0, 0, 1),
  selectedFontColor: new Color(0, 0, 0, 1),
  fontSize: FONT_SIZE,
  letterWidth: 0.61,
  verticalSeparation: 6 * VERTICAL_SEPARATION_PADDING_MATH,
  horizontalSeparation: 7 * HORIZONTAL_SEPARATION_PADDING_MATH,
  lineColor: lineColor,
  selectedLineColor: selectedLineColor,
};
SLOT_MATH_STYLE.borderColor.setA(1);

export function cloneStyle(style: any): any {
  const rv: any = {};
  for (const styleName in style) {
    if (Object.prototype.hasOwnProperty.call(style, styleName)) {
      rv[styleName] = style[styleName];
    }
  }
  return rv;
}

export function copyStyle(type: any): any {
  const rv: any = {};
  const copiedStyle: any = style(type);

  for (const styleName in copiedStyle) {
    if (Object.prototype.hasOwnProperty.call(copiedStyle, styleName)) {
      rv[styleName] = copiedStyle[styleName];
    }
  }

  return rv;
}

export function style(type: Type | string, mathMode?: boolean): any {
  if (typeof type === "string") {
    type = readType(type);
  }
  switch (type as Type) {
    case Type.BUD: {
      return BUD_STYLE;
    }
    case Type.SLOT: {
      return mathMode ? SLOT_MATH_STYLE : SLOT_STYLE;
    }
    case Type.BLOCK:
    default: {
      return mathMode ? BLOCK_MATH_STYLE : BLOCK_STYLE;
    }
  }
}

export default BlockStyle;

export {
  BLOCK_STYLE,
  BLOCK_MATH_STYLE,
  SLOT_STYLE,
  SLOT_MATH_STYLE,
  BUD_STYLE,
};
