// import { TimeoutTimer } from "parsegraph-timing";
import { makeInverse3x3, matrixTransform2D } from "parsegraph-matrix";
import { BasicMouseController } from "parsegraph-input";
import Navport from "./Navport";

export default class CarouselMouseController extends BasicMouseController {
  _nav: Navport;

  constructor(nav: Navport) {
    super();
    this._nav = nav;
  }

  nav() {
    return this._nav;
  }

  carousel() {
    return this.nav().carousel();
  }

  mousedown(button: any, downTime: number, x: number, y: number): boolean {
    if (!this.carousel().isCarouselShown()) {
      return false;
    }
    super.mousedown(button, downTime, x, y);
    return true;
  }

  mousemove(x: number, y: number): boolean {
    if (!this.carousel().isCarouselShown()) {
      return false;
    }

    super.mousemove(x, y);

    const mouseInWorld = matrixTransform2D(
      makeInverse3x3(this.carousel().camera().worldMatrix()),
      x,
      y
    );

    const overClickable: number = this.carousel().mouseOverCarousel(
      mouseInWorld[0],
      mouseInWorld[1]
    );
    switch (overClickable) {
      case 2:
        this._nav.setCursor("pointer");
        break;
      case 1:
        break;
      case 0:
        this._nav.setCursor("auto");
        break;
    }

    return true;
  }

  scheduleRepaint() {
    this.nav().scheduleRepaint();
  }

  mouseup(button: any, downTime: number, x: number, y: number) {
    super.mouseup(button, downTime, x, y);

    // Check for carousel click
    const mouseInCarousel = matrixTransform2D(
      makeInverse3x3(this.carousel().camera().worldMatrix()),
      x,
      y
    );
    const wasCarouselShown = this.carousel().isCarouselShown();
    if (
      this.carousel().clickCarousel(
        mouseInCarousel[0],
        mouseInCarousel[1],
        false
      )
    ) {
      this.scheduleRepaint();
      return true;
    } else if (this.carousel().isCarouselShown()) {
      this.nav().carousel().hideCarousel();
      this.nav().carousel().scheduleCarouselRepaint();
      return true;
    }
    if (this.carousel().isCarouselShown() !== wasCarouselShown) {
      return false;
    }

    return false;
  }

  wheel(mag: number, x: number, y: number): boolean {
    if (!this.carousel().isCarouselShown()) {
      return false;
    }
    super.wheel(mag, x, y);
    return true;
  }
}
