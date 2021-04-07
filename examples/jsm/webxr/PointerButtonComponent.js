import { Component } from "./EntityComponentSystem.js";

class PointerButtonComponent extends Component {
  constructor(
    gameObject,
    pointers,
    onPressAction = null,
    onClearAction = null,
    whilePressedAction = null
  ) {
    super(gameObject);
    this.pointers = pointers;
    this.onPressAction = onPressAction;
    this.onClearAction = onClearAction;
    this.whilePressedAction = whilePressedAction;
    this.pressed = false;
    this.hovered = false;
  }

  update() {
    let pinchedPointer = null;
    this.hovered = false;
    for (let pointer of this.pointers) {
      if (pointer) {
        let intersections = pointer.intersectObject(this.gameObject.transform);
        if (intersections && intersections.length > 0) {
          if (!pointer.isAttached()) {
            this.hovered = true;
            if (pointer.isPinched()) {
              pinchedPointer = pointer;
            }
          }
        }
      }
    }
    if (pinchedPointer != null) {
      if (this.whilePressedAction) this.whilePressedAction();
      if (!this.pressed) {
        if (this.onPressAction) this.onPressAction();
        this.pressed = true;
      }
    } else {
      if (this.pressed) {
        if (this.onClearAction) this.onClearAction();
        this.pressed = false;
      }
    }
    if (this.hovered) {
      this.gameObject.transform.scale.set(1.1, 1.1, 1.1);
    } else {
      this.gameObject.transform.scale.set(1, 1, 1);
    }
  }
}

export { PointerButtonComponent };
