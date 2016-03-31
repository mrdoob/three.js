/**
 * @author mrdoob / http://mrdoob.com/
 * @author greggman / http://games.greggman.com/
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * @author tschw
 */

THREE.PerspectiveCamera = function ( fov, aspect, near, far ) {

	THREE.Camera.call( this );

	this.type = 'PerspectiveCamera';

	this.zoom = 1;

	this.fov = fov !== undefined ? fov : 50;
	this.aspect = aspect !== undefined ? aspect : 1;
	this.near = near !== undefined ? near : 0.1;
	this.far = far !== undefined ? far : 2000;

	this.view = null;

	this.skewSlopeX = 0;
	this.skewSlopeY = 0;

	this.focalLength = 10;

	this.updateProjectionMatrix();

};

THREE.PerspectiveCamera.prototype = Object.create( THREE.Camera.prototype );
THREE.PerspectiveCamera.prototype.constructor = THREE.PerspectiveCamera;


/**
 * Uses Focal Length (in mm) to estimate and set FOV
 * 35mm (full-frame) camera is used if frame size is not specified;
 * Formula based on http://www.bobatkins.com/photography/technical/field_of_view.html
 */

THREE.PerspectiveCamera.prototype.setLens = function ( focalLength, frameHeight ) {

	if ( frameHeight === undefined ) frameHeight = 24;

	this.fov = 2 * THREE.Math.RAD2DEG * Math.atan( frameHeight / ( focalLength * 2 ) );
	this.updateProjectionMatrix();

};


/**
 * Sets an offset in a larger frustum. This is useful for multi-window or
 * multi-monitor/multi-machine setups.
 *
 * For example, if you have 3x2 monitors and each monitor is 1920x1080 and
 * the monitors are in grid like this
 *
 *   +---+---+---+
 *   | A | B | C |
 *   +---+---+---+
 *   | D | E | F |
 *   +---+---+---+
 *
 * then for each monitor you would call it like this
 *
 *   var w = 1920;
 *   var h = 1080;
 *   var fullWidth = w * 3;
 *   var fullHeight = h * 2;
 *
 *   --A--
 *   camera.setOffset( fullWidth, fullHeight, w * 0, h * 0, w, h );
 *   --B--
 *   camera.setOffset( fullWidth, fullHeight, w * 1, h * 0, w, h );
 *   --C--
 *   camera.setOffset( fullWidth, fullHeight, w * 2, h * 0, w, h );
 *   --D--
 *   camera.setOffset( fullWidth, fullHeight, w * 0, h * 1, w, h );
 *   --E--
 *   camera.setOffset( fullWidth, fullHeight, w * 1, h * 1, w, h );
 *   --F--
 *   camera.setOffset( fullWidth, fullHeight, w * 2, h * 1, w, h );
 *
 *   Note there is no reason monitors have to be the same size or in a grid.
 */

THREE.PerspectiveCamera.prototype.setViewOffset = function ( fullWidth, fullHeight, x, y, width, height ) {

	this.aspect = fullWidth / fullHeight;

	this.view = {
		fullWidth: fullWidth,
		fullHeight: fullHeight,
		offsetX: x,
		offsetY: y,
		width: width,
		height: height
	};

	this.updateProjectionMatrix();

};

THREE.PerspectiveCamera.prototype.getEffectiveFOV = function() {

	return THREE.Math.RAD2DEG * 2 * Math.atan(
			Math.tan( THREE.Math.DEG2RAD * 0.5 * this.fov ) / this.zoom );

};


THREE.PerspectiveCamera.prototype.updateProjectionMatrix = function () {

	var near = this.near,
		top = near * Math.tan(
				THREE.Math.DEG2RAD * 0.5 * this.fov ) / this.zoom,
		height = 2 * top,
		width = this.aspect * height,
		left = -0.5 * width,
		view = this.view;

	if ( view !== null ) {

		var fullWidth = view.fullWidth,
			fullHeight = view.fullHeight;

		left += view.offsetX * width / fullWidth;
		top -= view.offsetY * height / fullHeight;
		width *= view.width / fullWidth;
		height *= view.height / fullHeight;

	}

	left += this.skewSlopeX * near;
	top -= this.skewSlopeY * near;

	this.projectionMatrix.makeFrustum(
			left, left + width, top - height, top, near, this.far );

};

THREE.PerspectiveCamera.prototype.copy = function ( source ) {

	THREE.Camera.prototype.copy.call( this, source );

	this.zoom = source.zoom;

	this.fov = source.fov;
	this.aspect = source.aspect;
	this.near = source.near;
	this.far = source.far;

	this.zoom = source.zoom;
	this.focalLength = source.focalLength;

	this.skewSlopeX = source.skewSlopeX;
	this.skewSlopeY = source.skewSlopeY;

	if ( source.view !== null && source.view !== undefined ) {

		this.view = Object.assign( {}, source.view );

	}

	return this;

};

THREE.PerspectiveCamera.prototype.toJSON = function ( meta ) {

	var data = THREE.Object3D.prototype.toJSON.call( this, meta );

	data.object.fov = this.fov;
	data.object.aspect = this.aspect;
	data.object.near = this.near;
	data.object.far = this.far;

	data.object.zoom = this.zoom;
	data.object.focalLength = this.focalLength;

	data.object.skewSlopeX = this.skewSlopeX;
	data.object.skewSlopeY = this.skewSlopeY;

	if ( this.view !== null ) {

		data.object.view = Object.assign( {}, this.view );

	}

	return data;

};
