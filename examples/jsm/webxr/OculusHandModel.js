import { Object3D, Sphere, Box3 } from "../../../build/three.module.js";
import { fetchProfile } from '../libs/motion-controllers.module.js';
import { XRHandMeshModel } from "./XRHandMeshModel.js";

const DEFAULT_PROFILES_PATH = 'https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0/dist/profiles';
const DEFAULT_PROFILE = 'generic-hand';

class OculusHandModel extends Object3D {
  constructor(controller) {
    super();

    this.controller = controller;
    this.motionController = null;
    this.envMap = null;

    this.mesh = null;

    controller.addEventListener("connected", (event) => {
      const xrInputSource = event.data;
      if (xrInputSource.hand && !this.motionController) {
        this.visible = true;
        this.xrInputSource = xrInputSource;
        fetchProfile(xrInputSource, DEFAULT_PROFILES_PATH, DEFAULT_PROFILE).then(({ profile, assetPath }) => {
          this.motionController = new XRHandMeshModel(
            this,
            controller,
            assetPath
          );
        }).catch((err) => {
          console.warn(err);
        });
      }
    });

    controller.addEventListener("disconnected", () => {
      this.clear();
      this.motionController = null;
    })
  }

  updateMatrixWorld(force) {
    super.updateMatrixWorld(force);

    if (this.motionController) {
      this.motionController.updateMesh();
    }
  }

  getPointerPosition() {
    let indexFingerTip = this.controller.joints[POINTING_JOINT];
    if (indexFingerTip) {
      return indexFingerTip.position;
    } else {
      return null;
    }
  }

  intersectBoxObject(boxObject) {
    let pointerPosition = this.getPointerPosition();
    if (pointerPosition) {
      let indexSphere = new Sphere(pointerPosition, TOUCH_RADIUS);
      let box = new Box3().setFromObject(boxObject);
      return indexSphere.intersectsBox(box);
    } else {
      return false;
    }
  }

  checkButton(button) {
    if (this.intersectBoxObject(button)) {
      button.onPress();
    } else {
      button.onClear();
    }

    if (button.isPressed()) {
      button.whilePressed();
    }
  }
}

export { OculusHandModel };
