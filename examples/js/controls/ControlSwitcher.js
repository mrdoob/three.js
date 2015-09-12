function ControlSwitcher(fov, aspect, near, far, container, onCameraChanged) {
	this.fov = fov;
	this.aspect = aspect;
	this.near = near;
	this.far = far;

	this.onCameraChanged = onCameraChanged;

	this.container = container;

	this.stereo = false;
	this.eyeSeparation = 0.1;

	this.CAMERACONTROLMODE = { ORBIT: 0, FLY: 1, MOUSE: 2, DEVICE: 3 };


	this.camera = new THREE.PerspectiveCamera(this.fov, this.aspect, this.near, this.far);
	this.camera.position.z = 100;
    this.camera.position.y = 20;

	this.camControls = undefined;
	this.setControlMode(this.CAMERACONTROLMODE.ORBIT);
}

ControlSwitcher.prototype.setControlMode = function (controlMode) {
	var prevCamera = this.camera;

    this.camera = new THREE.PerspectiveCamera(this.fov, this.aspect, this.near, this.far);
    this.camera.position.copy(prevCamera.position);
    this.camera.rotation.copy(prevCamera.rotation);

	if(this.camControls !== undefined)
		this.camControls.disable();
		
	switch(controlMode) {
	    case this.CAMERACONTROLMODE.ORBIT:
	        this.camControls = new THREE.OrbitControls(this.camera, this.container);
	        this.camControls.reset();
			break;
	    case this.CAMERACONTROLMODE.FLY:
	        this.camControls = new THREE.FlyControls(this.camera, this.container);

	        this.camControls.movementSpeed = 500;
	        this.camControls.rollSpeed = Math.PI / 24;
	        this.camControls.autoForward = false;
	        this.camControls.dragToLook = false;
	        break;
	    case this.CAMERACONTROLMODE.MOUSE:
	        this.camControls = new THREE.MouseControls(this.camera);
	        break;
	    case this.CAMERACONTROLMODE.DEVICE:
	        this.camControls = new THREE.DeviceOrientationControls(this.camera);
	        break;
	}

	this.onCameraChanged(this.camera);
};