enum Type {
  BUD,
  SLOT,
  BLOCK,
}
export default Type;

export function nameType(given: Type): string {
  switch (given) {
    case Type.SLOT:
      return "SLOT";
    case Type.BLOCK:
      return "BLOCK";
    case Type.BUD:
      return "BUD";
  }
}

export function readType(given: string | Type): Type {
  if (typeof given !== "string") {
    return given as Type;
  }
  given = (given as string).toLowerCase().substring(0, 3);

  switch (given) {
    case "b":
    case "bl":
    case "blo":
      return Type.BLOCK;
    case "u":
    case "bu":
    case "bud":
      return Type.BUD;
    case "s":
    case "sl":
    case "slo":
      return Type.SLOT;
  }
  return null;
}
