/**
 * DeviceOrientationControls - applies device orientation on object rotation
 *
 * @param {Object} object - instance of THREE.Object3D
 * @constructor
 *
 * @author richt / http://richt.me
 * @author WestLangley / http://github.com/WestLangley
 * @author jonobr1 / http://jonobr1.com
 * @author arodic / http://aleksandarrodic.com
 * @author doug / http://github.com/doug
 *
 * W3C Device Orientation control
 * (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */


THREE.DeviceOrientationControls = function (object) {

  this.object = object;

  this.object.rotation.reorder('YXZ');

  this.freeze = true;

  this.movementSpeed = 1.0;
  this.rollSpeed = 0.005;
  this.autoAlign = true;
  this.autoForward = false;

  this.alpha = 0;
  this.beta = 0;
  this.gamma = 0;
  this.orient = 0;

  this.alignQuaternion = new THREE.Quaternion();
  this.orientationQuaternion = new THREE.Quaternion();

  var quaternion = new THREE.Quaternion();
  var quaternionLerp = new THREE.Quaternion();

  var tempVector3 = new THREE.Vector3();
  var tempMatrix4 = new THREE.Matrix4();
  var tempEuler = new THREE.Euler(0, 0, 0, 'YXZ');
  var tempQuaternion = new THREE.Quaternion();

  var zee = new THREE.Vector3(0, 0, 1);
  var up = new THREE.Vector3(0, 1, 0);
  var v0 = new THREE.Vector3(0, 0, 0);
  var euler = new THREE.Euler();
  var q0 = new THREE.Quaternion(); // - PI/2 around the x-axis
  var q1 = new THREE.Quaternion(- Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));

  this.deviceOrientation = {};
  this.screenOrientation = window.orientation || 0;

  this.onDeviceOrientationChangeEvent = (function (rawEvtData) {

    this.deviceOrientation = rawEvtData;

  }).bind(this);

  var getOrientation = function () {

    switch (window.screen.orientation || window.screen.mozOrientation) {
      
      case 'landscape-primary': return 90;
      
      case 'landscape-secondary': return -90;
      
      case 'portrait-secondary': return 180;
      
      case 'portrait-primary': return 0;

    }

    return window.orientation || 0;

  };

  this.onScreenOrientationChangeEvent = (function () {

    this.screenOrientation = getOrientation();

  }).bind(this);

  this.update = function (delta) {

    return function () {

      if ( this.freeze ) return;

      this.alpha = this.deviceOrientation.gamma ?
        THREE.Math.degToRad(this.deviceOrientation.alpha) : 0; // Z
      this.beta = this.deviceOrientation.beta ?
        THREE.Math.degToRad(this.deviceOrientation.beta) : 0; // X'
      this.gamma = this.deviceOrientation.gamma ?
        THREE.Math.degToRad(this.deviceOrientation.gamma) : 0; // Y''
      this.orient = this.screenOrientation ?
        THREE.Math.degToRad(this.screenOrientation) : 0; // O

      // The angles alpha, beta and gamma
      // form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

      // 'ZXY' for the device, but 'YXZ' for us
      euler.set(this.beta, this.alpha, - this.gamma, 'YXZ');

      quaternion.setFromEuler(euler);
      quaternionLerp.slerp(quaternion, 0.5); // interpolate

      // orient the device
      if ( this.autoAlign ) this.orientationQuaternion.copy(quaternion); // interpolation breaks the auto alignment
      else this.orientationQuaternion.copy(quaternionLerp);

      // camera looks out the back of the device, not the top
      this.orientationQuaternion.multiply(q1);

      // adjust for screen orientation
      this.orientationQuaternion.multiply(q0.setFromAxisAngle(zee, - this.orient));

      this.object.quaternion.copy(this.alignQuaternion);
      this.object.quaternion.multiply(this.orientationQuaternion);

      if ( this.autoForward ) {

        tempVector3
          .set(0, 0, -1)
          .applyQuaternion(this.object.quaternion, 'ZXY')
          .setLength(this.movementSpeed / 50); // TODO: why 50 :S

        this.object.position.add(tempVector3);

      }

      if ( this.alpha !== 0 && this.autoAlign) {
          
          this.autoAlign = false;

          this.align();
        
      }

    };

  }();

  this.align = function () {

    tempVector3
      .set(0, 0, -1)
      .applyQuaternion( tempQuaternion.copy(this.orientationQuaternion).inverse(), 'ZXY' );

    tempEuler.setFromQuaternion(
      tempQuaternion.setFromRotationMatrix(
        tempMatrix4.lookAt(tempVector3, v0, up)
     )
   );

    tempEuler.set(0, tempEuler.y, 0);
    this.alignQuaternion.setFromEuler(tempEuler);

  };

  this.connect = function () {

    // run once on load
    this.onScreenOrientationChangeEvent();

    window.addEventListener('orientationchange', this.onScreenOrientationChangeEvent, false);
    window.addEventListener('deviceorientation', this.onDeviceOrientationChangeEvent, false);

    this.freeze = false;

    return this;

  };

  this.disconnect = function () {

    this.freeze = true;

    window.removeEventListener('orientationchange', this.onScreenOrientationChangeEvent, false);
    window.removeEventListener('deviceorientation', this.onDeviceOrientationChangeEvent, false);

  };


};

