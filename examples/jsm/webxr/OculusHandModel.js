import { Object3D, Sphere, Box3 } from "../../../build/three.module.js";
import { FBXLoader } from "../loaders/FBXLoader.js";

const JOINTS = [
  "wrist",
  "thumb-metacarpal",
  "thumb-phalanx-proximal",
  "thumb-phalanx-distal",
  "thumb-tip",
  "index-finger-metacarpal",
  "index-finger-phalanx-proximal",
  "index-finger-phalanx-intermediate",
  "index-finger-phalanx-distal",
  "index-finger-tip",
  "middle-finger-metacarpal",
  "middle-finger-phalanx-proximal",
  "middle-finger-phalanx-intermediate",
  "middle-finger-phalanx-distal",
  "middle-finger-tip",
  "ring-finger-metacarpal",
  "ring-finger-phalanx-proximal",
  "ring-finger-phalanx-intermediate",
  "ring-finger-phalanx-distal",
  "ring-finger-tip",
  "pinky-finger-metacarpal",
  "pinky-finger-phalanx-proximal",
  "pinky-finger-phalanx-intermediate",
  "pinky-finger-phalanx-distal",
  "pinky-finger-tip",
];
const TOUCH_RADIUS = 0.01;
const POINTING_JOINT = "index-finger-tip";

class XRHandOculusMeshModel {
  constructor(handModel, controller, handedness) {
    this.controller = controller;
    this.handModel = handModel;

    this.bones = [];
    const loader = new FBXLoader();

    // loader.setPath("");
    loader.load("models/fbx/OculusHandNew_" + handedness + ".fbx", (object) => {
      this.handModel.add(object);
      // Hack because of the scale of the skinnedmesh
      object.scale.setScalar(0.01);

      const mesh = object.getObjectByProperty("type", "SkinnedMesh");
      mesh.frustumCulled = false;
      // mesh.castShadow = true;
      // mesh.receiveShadow = true;

      const bonesMapping = [
        "b_%_wrist", // XRHand.WRIST,

        "b_%_thumb1", // XRHand.THUMB_METACARPAL,
        "b_%_thumb2", // XRHand.THUMB_PHALANX_PROXIMAL,
        "b_%_thumb3", // XRHand.THUMB_PHALANX_DISTAL,
        "b_%_thumb_null", // XRHand.THUMB_PHALANX_TIP,

        'b_%_index0', // XRHand.INDEX_METACARPAL,
        "b_%_index1", // XRHand.INDEX_PHALANX_PROXIMAL,
        "b_%_index2", // XRHand.INDEX_PHALANX_INTERMEDIATE,
        "b_%_index3", // XRHand.INDEX_PHALANX_DISTAL,
        "b_%_index_null", // XRHand.INDEX_PHALANX_TIP,

        'b_%_middle0', // XRHand.MIDDLE_METACARPAL,
        "b_%_middle1", // XRHand.MIDDLE_PHALANX_PROXIMAL,
        "b_%_middle2", // XRHand.MIDDLE_PHALANX_INTERMEDIATE,
        "b_%_middle3", // XRHand.MIDDLE_PHALANX_DISTAL,
        "b_%_middlenull", // XRHand.MIDDLE_PHALANX_TIP,

        'b_%_ring0', // XRHand.RING_METACARPAL,
        "b_%_ring1", // XRHand.RING_PHALANX_PROXIMAL,
        "b_%_ring2", // XRHand.RING_PHALANX_INTERMEDIATE,
        "b_%_ring3", // XRHand.RING_PHALANX_DISTAL,
        "b_%_ring_inull", // XRHand.RING_PHALANX_TIP,

        "b_%_pinky0", // XRHand.LITTLE_METACARPAL,
        "b_%_pinky1", // XRHand.LITTLE_PHALANX_PROXIMAL,
        "b_%_pinky2", // XRHand.LITTLE_PHALANX_INTERMEDIATE,
        "b_%_pinky3", // XRHand.LITTLE_PHALANX_DISTAL,
        "b_%_pinkynull", // XRHand.LITTLE_PHALANX_TIP
      ];

      let i = 0;

      bonesMapping.forEach((boneName) => {
        if (boneName) {
          const bone = object.getObjectByName(
            boneName.replace(/%/g, handedness === "right" ? "r" : "l")
          );

          if (bone !== undefined) {
            bone.jointName = JOINTS[i];
          }

          this.bones.push(bone);
        } else {
          this.bones.push(null);
        }

        i++;
      });
    });
  }

  updateMesh() {
    // XR Joints
    const XRJoints = this.controller.joints;
    for (let i = 0; i < this.bones.length; i++) {
      const bone = this.bones[i];

      if (bone) {
        const XRJoint = XRJoints[bone.jointName];

        if (XRJoint.visible) {
          const position = XRJoint.position;

          if (bone) {
            bone.position.copy(position.clone().multiplyScalar(100));
            bone.quaternion.copy(XRJoint.quaternion);
            // bone.scale.setScalar( XRJoint.jointRadius || defaultRadius );
          }
        }
      }
    }
  }
}

class OculusHandModel extends Object3D {
  constructor(controller) {
    super();

    this.controller = controller;
    this.motionController = null;
    this.envMap = null;

    this.mesh = null;

    controller.addEventListener("connected", (event) => {
      const xrInputSource = event.data;

      if (xrInputSource.hand) {
        this.visible = true;
        this.xrInputSource = xrInputSource;

        this.motionController = new XRHandOculusMeshModel(
          this,
          controller,
          xrInputSource.handedness
        );
      }
    });

    controller.addEventListener("disconnected", () => {
      this.clear();
      this.motionController = null;
    })
  }

  updateMatrixWorld(force) {
    Object3D.prototype.updateMatrixWorld.call(this, force);

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
