import { Component } from "./EntityComponentSystem.js";

const FULL_PRESS_DISTANCE = 0.02;
const RECOVERY_SPEED = 0.005;

class PhysicalButtonComponent extends Component {
  constructor(
    gameObject,
    hands,
    onPressAction = () => { },
    onClearAction = () => { },
    whilePressedAction = () => { }
  ) {
    super(gameObject);
    this.hands = hands;
    this.onPressAction = onPressAction;
    this.onClearAction = onClearAction;
    this.whilePressedAction = whilePressedAction;
    this.fullyPressed = false;
    this.inRecovery = false;
    this.restingY = this.gameObject.transform.position.y;
  }

  update() {
    let pressedThisFrame = false;
    let pressingPosition = null;
    for (let hand of this.hands) {
      if (hand && hand.intersectBoxObject(this.gameObject.transform)) {
        pressedThisFrame = true;
        pressingPosition = hand.getPointerPosition();
      }
    }
    pressedThisFrame &= !this.inRecovery;

    if (pressedThisFrame) {
      let pressingDistance =
        0.05 - this.gameObject.transform.worldToLocal(pressingPosition).y;
      if (pressingDistance > 0) {
        this.gameObject.transform.position.y -= pressingDistance;
      }
      if (this.gameObject.transform.position.y <= this.restingY - FULL_PRESS_DISTANCE) {
        if (!this.fullyPressed) {
          this.fullyPressed = true;
          this.onPressAction();
        } else {
          this.whilePressedAction();
        }
        this.gameObject.transform.position.y = this.restingY - FULL_PRESS_DISTANCE;
      }
    } else {
      if (this.gameObject.transform.position.y < this.restingY) {
        this.gameObject.transform.position.y += RECOVERY_SPEED;
        this.inRecovery = true;
        this.fullyPressed = false;
        this.onClearAction();
      } else {
        this.gameObject.transform.position.y = this.restingY;
        this.inRecovery = false;
      }
    }
  }
}

export { PhysicalButtonComponent };
