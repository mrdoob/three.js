/**
 *	@author zz85 / http://twitter.com/blurspline / http://www.lab4games.net/zz85/blog
 *
 *		A general perpose camera, for setting FOV, Lens Focal Length,
 *		and switching between perspective and orthographic views easily.
 *		Use this only if you do not wish to manage
 *		both a Orthographic and Perspective Camera
 *
 */


THREE.CombinedCamera = function ( width, height, fov, near, far, hyperfocusOffset, hyperfocusScale ) {

	THREE.Camera.call( this );
	// perspective
	this.fov = fov;
	this.far = far;
	this.near = near;
	//orthographic
	this.left = - width / 2;
	this.right = width / 2;
	this.top = height / 2;
	this.bottom = - height / 2;

	this.aspect =  width / height;

	// We could also handle the projectionMatrix internally, but just wanted to test nested camera objects

	this.cameraO = new THREE.OrthographicCamera( this.left, this.right, this.top, this.bottom, this.near, this.far );
	this.cameraP = new THREE.PerspectiveCamera( this.fov, this.aspect, this.near, this.far );

	this.zoom = 1;
	this.view = null;
	this.hyperfocusOffset = hyperfocusOffset;
	this.hyperfocusScale = hyperfocusScale;

	this.toPerspective();

};

THREE.CombinedCamera.prototype = Object.create( THREE.Camera.prototype );
THREE.CombinedCamera.prototype.constructor = THREE.CombinedCamera;

THREE.CombinedCamera.prototype.toPerspective = function () {

	// Switches to the Perspective Camera

	this.cameraP.near = this.near;
	this.cameraP.far = this.far;
	this.cameraP.aspect = this.aspect;
	this.cameraP.fov =  this.fov / this.zoom ;
	this.cameraP.view = this.view;

	this.cameraP.updateProjectionMatrix();

	this.projectionMatrix = this.cameraP.projectionMatrix;

	this.inPerspectiveMode = true;
	this.inOrthographicMode = false;

};

THREE.CombinedCamera.prototype.toOrthographic = function () {

	// Switches to the Orthographic camera estimating viewport from Perspective

	var fov = this.fov;
	var aspect = this.aspect;

	var halfHeight = Math.tan( fov * Math.PI / 180 / 2 ) * (this.hyperfocusOffset + this.hyperfocusScale * ( this.near + this.far ));
	var halfWidth = halfHeight * aspect;

	this.cameraO.near = this.near;
	this.cameraO.far = this.far;

	this.cameraO.left = - halfWidth;
	this.cameraO.right = halfWidth;
	this.cameraO.top = halfHeight;
	this.cameraO.bottom = - halfHeight;

	this.cameraO.zoom = this.zoom;
	this.cameraO.view = this.view;

	this.cameraO.updateProjectionMatrix();

	this.projectionMatrix = this.cameraO.projectionMatrix;

	this.inPerspectiveMode = false;
	this.inOrthographicMode = true;

};


THREE.CombinedCamera.prototype.setSize = function( width, height ) {

	this.aspect = width / height;
	this.left = - width / 2;
	this.right = width / 2;
	this.top = height / 2;
	this.bottom = - height / 2;

};


THREE.CombinedCamera.prototype.setFov = function( fov ) {

	this.fov = fov;

	if ( this.inPerspectiveMode ) {

		this.toPerspective();

	} else {

		this.toOrthographic();

	}

};

THREE.CombinedCamera.prototype.copy = function ( source ) {

	THREE.Camera.prototype.copy.call( this, source );

	this.fov = source.fov;
	this.far = source.far;
	this.near = source.near;

	this.left = source.left;
	this.right = source.right;
	this.top = source.top;
	this.bottom = source.bottom;

	this.zoom = source.zoom;
	this.view = source.view === null ? null : Object.assign( {}, source.view );
	this.aspect = source.aspect;
	this.setSize = source.setSize;

	this.cameraO = new THREE.OrthographicCamera( this.left, this.right, this.top, this.bottom, this.near, this.far );
	this.cameraP = new THREE.PerspectiveCamera( this.fov, this.aspect, this.near, this.far );

	this.inOrthographicMode = source.inOrthographicMode;
	this.inPerspectiveMode = source.inPerspectiveMode;

	return this;

};

THREE.CombinedCamera.prototype.setViewOffset = function( fullWidth, fullHeight, x, y, width, height ) {

	this.view = {
		fullWidth: fullWidth,
		fullHeight: fullHeight,
		offsetX: x,
		offsetY: y,
		width: width,
		height: height
	};

	if ( this.inPerspectiveMode ) {

		this.aspect = fullWidth / fullHeight;

		this.toPerspective();

	} else {

		this.toOrthographic();

	}

};

THREE.CombinedCamera.prototype.clearViewOffset = function() {

	this.view = null;
	this.updateProjectionMatrix();

};
// For maintaining similar API with PerspectiveCamera

THREE.CombinedCamera.prototype.updateProjectionMatrix = function() {

	if ( this.inPerspectiveMode ) {

		this.toPerspective();

	} else {

		this.toPerspective();
		this.toOrthographic();

	}

};

/*
* Uses Focal Length (in mm) to estimate and set FOV
* 35mm (full frame) camera is used if frame size is not specified;
* Formula based on http://www.bobatkins.com/photography/technical/field_of_view.html
*/
THREE.CombinedCamera.prototype.setLens = function ( focalLength, filmGauge ) {

	if ( filmGauge === undefined ) filmGauge = 35;

	var vExtentSlope = 0.5 * filmGauge /
			( focalLength * Math.max( this.cameraP.aspect, 1 ) );

	var fov = THREE.Math.RAD2DEG * 2 * Math.atan( vExtentSlope );

	this.setFov( fov );

	return fov;

};


THREE.CombinedCamera.prototype.setZoom = function( zoom ) {

	this.zoom = zoom;

	if ( this.inPerspectiveMode ) {

		this.toPerspective();

	} else {

		this.toOrthographic();

	}

};

THREE.CombinedCamera.prototype.toFrontView = function() {

	this.rotation.x = 0;
	this.rotation.y = 0;
	this.rotation.z = 0;

	this.position.x = 0;
	this.position.y = 0;
	this.position.z = -15;
	// should we be modifing the matrix instead?

};

THREE.CombinedCamera.prototype.toBackView = function() {

	this.rotation.x = 0;
	this.rotation.y = Math.PI;
	this.rotation.z = 0;

	this.position.x = 0;
	this.position.y = 0;
	this.position.z = 15;

};

THREE.CombinedCamera.prototype.toLeftView = function() {

	this.rotation.x = 0;
	this.rotation.y = - Math.PI / 2;
	this.rotation.z = 0;

	this.position.x = -15;
	this.position.y = 0;
	this.position.z = 0;

};

THREE.CombinedCamera.prototype.toRightView = function() {

	this.rotation.x = 0;
	this.rotation.y = Math.PI / 2;
	this.rotation.z = 0;

	this.position.x = 15;
	this.position.y = 0;
	this.position.z = 0;

};

THREE.CombinedCamera.prototype.toTopView = function() {

	this.rotation.x = - Math.PI / 2;
	this.rotation.y = 0;
	this.rotation.z = 0;

	this.position.x = 0;
	this.position.y = 15;
	this.position.z = 0;

};

THREE.CombinedCamera.prototype.toBottomView = function() {

	this.rotation.x = Math.PI / 2;
	this.rotation.y = 0;
	this.rotation.z = 0;

	this.position.x = 0;
	this.position.y = -15;
	this.position.z = 0;

};

THREE.CombinedCamera.prototype.toPerspectiveView = function() {

	this.rotation.x = - Math.PI / 4;
	this.rotation.y = - Math.PI / 4;
	this.rotation.z = 0;

	this.position.x = 4;
	this.position.y = 4;
	this.position.z = 4;

};
