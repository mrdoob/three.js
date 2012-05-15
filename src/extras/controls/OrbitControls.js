/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 */

THREE.OrbitControls = function ( object, domElement ) {

	THREE.EventTarget.call( this );

	this.object = object;
	this.domElement = ( domElement !== undefined ) ? domElement : document;

	// API
	
	this.center = new THREE.Vector3();
	
	this.userZoom = true;
	this.userZoomSpeed = 1.0;

	this.userRotate = true;
	this.userRotateSpeed = 1.0;

	this.autoRotate = false;
	this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

	// internals
	
	var scope = this;

	var EPS = 0.000001;
	var PIXELS_PER_ROUND = 1800;

	var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();

	var phiDelta = 0;
	var thetaDelta = 0;
	var scale = 1;

	var lastPosition = new THREE.Vector3();

	// events

	var changeEvent = { type: 'change' };


	this.rotateLeft = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}
		
		thetaDelta -= angle;

	};

	this.rotateRight = function ( angle ) {
	
		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		thetaDelta += angle;
	
	};

	this.rotateUp = function ( angle ) {
	
		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		phiDelta -= angle;
	
	};

	this.rotateDown = function ( angle ) {
	
		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}
		
		phiDelta += angle;
	
	};

	this.zoomIn = function ( zoomScale ) {
	
		if ( zoomScale === undefined ) {
		
			zoomScale = getZoomScale();
		
		}

		scale /= zoomScale;
	
	};

	this.zoomOut = function ( zoomScale ) {
	
		if ( zoomScale === undefined ) {
		
			zoomScale = getZoomScale();
		
		}

		scale *= zoomScale;
	
	};

	this.update = function () {

		var position = this.object.position;
		var offset = position.clone().subSelf( this.center )

		// angle from z-axis around y-axis
		var theta = Math.atan2( offset.x, offset.z ); 
		// angle from y-axis
		var phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );
		
		if ( this.autoRotate ) {

			this.rotateLeft( getAutoRotationAngle() );

		}
		
		theta += thetaDelta;
		phi += phiDelta;

		// restrict phi to be betwee EPS and PI-EPS
		phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );

		var radius = offset.length();
		offset.x = radius * Math.sin( phi ) * Math.sin( theta );
		offset.y = radius * Math.cos( phi );
		offset.z = radius * Math.sin( phi ) * Math.cos( theta );
		offset.multiplyScalar( scale );
		
		position.copy( this.center ).addSelf( offset );

		this.object.lookAt( this.center );

		thetaDelta = 0;
		phiDelta = 0;
		scale = 1;

		if ( lastPosition.distanceTo( this.object.position ) > 0 ) {
			
			this.dispatchEvent( changeEvent );

			lastPosition.copy( this.object.position );

		}

	};


	function getAutoRotationAngle() {

		return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

	}

	function getZoomScale() {
	
		return Math.pow( 0.95, scope.userZoomSpeed );
	
	}

	function onMouseDown( event ) {

		if ( !scope.userRotate ) return;

		event.preventDefault();

		rotateStart.set( event.clientX, event.clientY );

		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'mouseup', onMouseUp, false );

	}

	function onMouseMove( event ) {

		event.preventDefault();

		rotateEnd.set( event.clientX, event.clientY );
		rotateDelta.sub( rotateEnd, rotateStart );

		scope.rotateLeft( 2 * Math.PI * rotateDelta.x / PIXELS_PER_ROUND * scope.userRotateSpeed );
		scope.rotateUp( 2 * Math.PI * rotateDelta.y / PIXELS_PER_ROUND * scope.userRotateSpeed );

		rotateStart.copy( rotateEnd );

	}

	function onMouseUp( event ) {

		if ( ! scope.userRotate ) return;

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );

	}

	function onMouseWheel( event ) {

		if ( ! scope.userZoom ) return;

		if ( event.wheelDelta > 0 ) {
		
			scope.zoomOut();
		
		} else {
		
			scope.zoomIn();
		
		}
	
	}

	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	this.domElement.addEventListener( 'mousedown', onMouseDown, false );
	this.domElement.addEventListener( 'mousewheel', onMouseWheel, false );

};
