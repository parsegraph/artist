import { Keystroke } from "parsegraph-input";
import { matrixTransform2D, makeInverse3x3 } from "parsegraph-matrix";
import { MouseController, KeyController } from "parsegraph-input";
import Camera from "parsegraph-camera";
import { Carousel } from "../carousel";

const RESET_CAMERA_KEY = "Escape";
const CLICK_KEY = " ";

export default class CarouselKeyController implements KeyController {
  _camera: Camera;
  _carousel: Carousel;
  _mouse: MouseController;

  constructor(cam: Camera, carousel: Carousel, mouse?: MouseController) {
    this._camera = cam;
    this._carousel = carousel;
    this._mouse = mouse;
  }

  tick(_cycleStart: number) {
    return false;
  }

  camera() {
    return this._camera;
  }

  carousel() {
    return this._carousel;
  }

  lastMouseX() {
    return this._mouse?.lastMouseX();
  }

  lastMouseY() {
    return this._mouse?.lastMouseY();
  }

  keydown(event: Keystroke) {
    return this.carousel().carouselKey(event);
  }

  keyup(event: Keystroke) {
    switch (event.name()) {
      case CLICK_KEY:
        const mouseInWorld = matrixTransform2D(
          makeInverse3x3(this.camera().worldMatrix()),
          event.x(),
          event.y()
        );
        if (
          this.carousel().clickCarousel(mouseInWorld[0], mouseInWorld[1], false)
        ) {
          return true;
        }
        break;
      case RESET_CAMERA_KEY:
        if (this.carousel().isCarouselShown()) {
          this.carousel().hideCarousel();
          return true;
        }
        break;
    }
    return false;
  }
}
