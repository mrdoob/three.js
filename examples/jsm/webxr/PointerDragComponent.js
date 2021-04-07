import { Component } from "./EntityComponentSystem.js";

class PointerDragComponent extends Component {
  constructor(gameObject, pointers) {
    super(gameObject);
    this.pointers = pointers;
    this.parent = null;
    this.dragging = false;
    this.hovered = false;
    this.attachedPointer = null;
  }

  update() {
    this.hovered = false;
    let pinchedPointer = null;
    for (let pointer of this.pointers) {
      if (pointer) {
        let intersections = pointer.intersectObject(this.gameObject.transform);
        if (intersections && intersections.length > 0) {
          this.hovered = !pointer.isAttached();
          if (pointer.isPinched()) {
            pinchedPointer = pointer;
            break;
          }
        }
      }
    }
    if (pinchedPointer != null) {
      if (!this.dragging && !pinchedPointer.isAttached()) {
        this.parent = this.gameObject.transform.parent;
        pinchedPointer.children[0].attach(this.gameObject.transform);
        this.attachedPointer = pinchedPointer;
        this.attachedPointer.setAttached(true);
        this.dragging = true;
      }
    } else {
      if (this.dragging) {
        this.parent.attach(this.gameObject.transform);
        this.attachedPointer.setAttached(false);
        this.attachedPointer = null;
        this.dragging = false;
      }
    }
    if (this.hovered) {
      this.gameObject.transform.scale.set(1.1, 1.1, 1.1);
    } else {
      this.gameObject.transform.scale.set(1, 1, 1);
    }
  }
}

export { PointerDragComponent };
