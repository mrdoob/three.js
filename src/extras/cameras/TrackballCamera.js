/**
 * @author Eberhard Gräther / http://egraether.com/

 * parameters = {
 *	fov: <float>,
 *	aspect: <float>,
 *	near: <float>,
 *	far: <float>,
 *	target: <THREE.Object3D>,

 *	radius: <float>,

 *	zoomSpeed: <float>,
 *	panSpeed: <float>,

 *	noZoom: <bool>,
 *	noPan: <bool>,

 *	domElement: <HTMLElement>,
 * }
 */

THREE.TrackballCamera = function ( parameters ) {

	THREE.Camera.call( this, parameters.fov, parameters.aspect, parameters.near, parameters.far, parameters.target );
	
	this.radius = ( window.innerWidth + window.innerHeight ) / 4;
	
	this.zoomSpeed = 1.0;
	this.panSpeed = 1.0;

	this.noZoom = false;
	this.noPan = false;
	
	this.domElement = document;

	if ( parameters ) {

		if ( parameters.radius !== undefined ) this.radius = parameters.radius;

		if ( parameters.zoomSpeed !== undefined ) this.zoomSpeed = parameters.zoomSpeed;
		if ( parameters.panSpeed !== undefined ) this.panSpeed = parameters.panSpeed;

		if ( parameters.noZoom !== undefined ) this.noZoom = parameters.noZoom;
		if ( parameters.noPan !== undefined ) this.noPan = parameters.noPan;

		if ( parameters.domElement !== undefined ) this.domElement = parameters.domElement;

	}

	this.useTarget = true;

	this.mouseDragOn = false;

	this.screen = this.getScreenDimensions();

	this.start = new THREE.Vector3();
	this.end = new THREE.Vector3();
	
	function bind( scope, fn ) {

		return function () {

			fn.apply( scope, arguments );

		};

	};
	
	this.domElement.addEventListener( 'mousemove', bind( this, this.mousemove ), false );
	this.domElement.addEventListener( 'mousedown', bind( this, this.mousedown ), false );
	this.domElement.addEventListener( 'mouseup',   bind( this, this.mouseup ), false );

	window.addEventListener( 'keydown', bind( this, this.keydown ), false );
	window.addEventListener( 'keyup',   bind( this, this.keyup ), false );
	
};

THREE.TrackballCamera.prototype = new THREE.Camera();
THREE.TrackballCamera.prototype.constructor = THREE.TrackballCamera;
THREE.TrackballCamera.prototype.supr = THREE.Camera.prototype;

THREE.TrackballCamera.prototype.handleEvent = function ( event ) {

	if ( typeof this[ event.type ] == 'function' ) {

		this[ event.type ]( event );

	}

};

THREE.TrackballCamera.prototype.keydown = function( event ) {



};

THREE.TrackballCamera.prototype.keyup = function( event ) {



};

THREE.TrackballCamera.prototype.mousedown = function(event) {

	event.preventDefault();
	event.stopPropagation();
	
	this.mouseDragOn = true;

	this.start = this.getMouseProjectionOnBall( event.clientX, event.clientY );

};

THREE.TrackballCamera.prototype.mousemove = function( event ) {

	if ( this.mouseDragOn ) {

		this.end = this.getMouseProjectionOnBall( event.clientX, event.clientY );

		var angle = Math.acos( this.start.dot( this.end ) / this.start.length() / this.end.length() );

		if ( angle ) {

			var axis = (new THREE.Vector3()).cross( this.end, this.start ).normalize(),
				quaternion = new THREE.Quaternion();

			quaternion.setFromAxisAngle( axis, angle );

			quaternion.multiplyVector3( this.position );
			quaternion.multiplyVector3( this.up );

		}

	}

};

THREE.TrackballCamera.prototype.mouseup = function( event ) {

	event.preventDefault();
	event.stopPropagation();

	this.mouseDragOn = false;

};

THREE.TrackballCamera.prototype.getScreenDimensions = function() {

	if ( this.domElement != document ) {
		
		return {
			width : this.domElement.offsetWidth, 
			height : this.domElement.offsetHeight,
			offsetLeft : this.domElement.offsetLeft,
			offsetTop : this.domElement.offsetTop
		};

	} else {

		return {
			width : window.innerWidth, 
			height : window.innerHeight,
			offsetLeft : 0,
			offsetTop : 0
		};

	}

};

THREE.TrackballCamera.prototype.getMouseProjectionOnBall = function( clientX, clientY ) {

	var mouse = new THREE.Vector3(
		( clientX - this.screen.width * 0.5 - this.screen.offsetLeft ) / this.radius,
		( this.screen.height * 0.5 + this.screen.offsetTop - clientY ) / this.radius,
		0.0
	);

	var length = mouse.length();

	if ( length > 1.0 ) {

		mouse.divideScalar( length );

	} else {

		mouse.z = Math.sqrt( 1.0 - length * length );

	}

	var projection = this.up.clone().setLength( mouse.y );
	projection.addSelf( this.up.clone().crossSelf( this.position ).setLength( mouse.x ) );
	projection.addSelf( this.position.clone().setLength( mouse.z ) );

	return projection;

};
