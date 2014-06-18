/**
 * Copyright 2013 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Portions come from the Oculus SDK.
 * @author benvanik
 */


/**
 * Oculus Rift effect.
 * @param {!THREE.WebGLRenderer} renderer Target.
 * @constructor
 */
THREE.OculusRiftEffect = function(renderer) {
  /**
   * Target renderer.
   * @type {!THREE.WebGLRenderer}
   * @private
   */
  this.renderer_ = renderer;

  /**
   * Whether a real device is attached.
   * @type {boolean}
   * @private
   */
  this.present_ = false;

  /**
   * Stereo renderer.
   * @type {!vr.StereoRenderer}
   * @private
   */
  this.stereoRenderer_ = new vr.StereoRenderer(renderer.getContext(), {
    alpha: false,
    depth: true,
    stencil: false
  });

  /**
   * Dummy VR state used when none is available.
   * @type {!vr.State}
   * @private
   */
  this.dummyState_ = new vr.State();

  /**
   * Eye camera.
   * @type {!THREE.Camera}
   * @private
   */
  this.eyeCamera_ = new THREE.PerspectiveCamera();
  this.eyeCamera_.matrixAutoUpdate = false;

  // Initialize the renderer (with defaults).
  this.init_(vr.HmdInfo.DEFAULT);
};


/**
 * Initializes the scene for rendering.
 * This is called whenever the device changes.
 * @param {!vr.HmdInfo} info HMD info.
 * @private
 */
THREE.OculusRiftEffect.prototype.init_ = function(info) {
  this.renderer_.autoClear = false;
  this.renderer_.setSize(info.resolutionHorz, info.resolutionVert);
};


/**
 * Gets the current interpupillary distance value.
 * @return {number} IPD value.
 */
THREE.OculusRiftEffect.prototype.getInterpupillaryDistance = function() {
  return this.stereoRenderer_.getInterpupillaryDistance();
};


/**
 * Sets a new interpupillary distance value.
 * @param {number} value New IPD value.
 */
THREE.OculusRiftEffect.prototype.setInterpupillaryDistance = function(value) {
  this.stereoRenderer_.setInterpupillaryDistance(value);
};


/**
 * Renders the scene to both eyes.
 * @param {!THREE.Scene} scene Three.js scene.
 * @param {!THREE.Camera} camera User camera. This is treated as the neck base.
 * @param {vr.VRState} vrstate VR state, if active.
 */
THREE.OculusRiftEffect.prototype.render = function(scene, camera, vrstate) {
  var info = vr.getHmdInfo() || vr.HmdInfo.DEFAULT;
  var nowPresent = vrstate ? vrstate.hmd.present : false;
  if (nowPresent != this.present_) {
    if (nowPresent) {
      // Connected.
      this.present_ = true;

      // Initialize the renderer/etc.
      this.init_(info);
    } else {
      // Disconnected.
      this.present_ = false;
    }
  }

  // Propagate camera options.
  var params = this.stereoRenderer_.getParams();
  params.setZNear(camera.near);
  params.setZFar(camera.far);

  // Grab camera matrix from user.
  // This is interpreted as the head base.
  if (camera.matrixAutoUpdate) {
    camera.updateMatrix();
  }
  var eyeWorldMatrix = camera.matrixWorld.clone();

  /*
   * Simple head simulation:
   *
   *    Leye <--IPD--> Reye
   *             ^
   *             |
   *   baseToEyeX/baseToEyeY
   *             |
   *           base
   *
   */
  // TODO(benvanik): head sim

  // Rotate by Oculus data.
  if (vrstate) {
    var quat = new THREE.Quaternion(
        vrstate.hmd.rotation[0],
        vrstate.hmd.rotation[1],
        vrstate.hmd.rotation[2],
        vrstate.hmd.rotation[3]);
    var rotMat = new THREE.Matrix4();
    rotMat.setRotationFromQuaternion(quat);
    eyeWorldMatrix.multiply(rotMat);
  }

  // Shift around to the the eye center.

  function convertMatrix(source, target) {
    for (var n = 0; n < 16; n++) {
      target.elements[n] = source[n];
    }
  };

  // Render eyes.
  this.stereoRenderer_.render(vrstate || this.dummyState_, function(eye) {
    var eyeCamera = this.eyeCamera_;
    convertMatrix(eye.projectionMatrix, eyeCamera.projectionMatrix);
    var viewAdjustMatrix = new THREE.Matrix4();
    convertMatrix(eye.viewAdjustMatrix, viewAdjustMatrix);
    eyeCamera.matrixWorld.multiplyMatrices(viewAdjustMatrix, eyeWorldMatrix);

    this.renderer_.render(scene, this.eyeCamera_, undefined, true);
  }, this);
};
