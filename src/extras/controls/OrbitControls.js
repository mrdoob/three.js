/**
 * @author qiao / https://github.com/qiao
 */

THREE.OrbitControls = function( object, domElement ) {
	
	this.object = object;
	this.domElement = ( domElement !== undefined ? domElement : document );

	// API
	
	this.center = new THREE.Vector3( 0, 0, 0 );
	
	this.userZoom = true;
	this.userZoomSpeed = 1.0;

	this.userRotate = true;
	this.userRotateSpeed = 1.0;

	this.autoRotate = false;
	this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

	// internals
	
	var self = this;

	var EPS = 0.000001;
	var PIXELS_PER_ROUND = 1800;

	var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();
	var rotating = false;
	var phiDelta = 0;
	var thetaDelta = 0;
	var scale = 1;

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
	};


	function getAutoRotationAngle() {

		return 2 * Math.PI / 60 / 60 * self.autoRotateSpeed;

	}

	function getZoomScale() {
	
		return Math.pow( 0.95, self.userZoomSpeed );
	
	}

	function onMouseMove( event ) {

		if ( !rotating ) return;

		rotateEnd.set( event.clientX, event.clientY );
		rotateDelta.sub( rotateEnd, rotateStart );

		self.rotateLeft( 2 * Math.PI * rotateDelta.x / PIXELS_PER_ROUND * self.userRotateSpeed );
		self.rotateUp( 2 * Math.PI * rotateDelta.y / PIXELS_PER_ROUND * self.userRotateSpeed );

		rotateStart.copy( rotateEnd );

	}

	function onMouseDown( event ) {

		if ( !self.userRotate ) return;

		rotateStart.set( event.clientX, event.clientY );
		rotating = true;

	}

	function onMouseUp( event ) {

		if ( !self.userRotate ) return;

		rotating = false;

	}

	function onMouseWheel( event ) {

		if ( !self.userZoom ) return;

		if ( event.wheelDelta > 0 ) {
		
			self.zoomOut();
		
		} else {
		
			self.zoomIn();
		
		}
	
	}

	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	this.domElement.addEventListener( 'mousemove', onMouseMove, false );
	this.domElement.addEventListener( 'mousedown', onMouseDown, false );
	this.domElement.addEventListener( 'mouseup', onMouseUp, false );
	this.domElement.addEventListener( 'mousewheel', onMouseWheel, false );

};
