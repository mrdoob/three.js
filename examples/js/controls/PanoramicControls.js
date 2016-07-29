THREE.PanoramicControls = function( camera, domElement )
{
	this.camera = ( camera !== undefined ) ? camera : console.error( "PanoramicControls required a THREE.PerspectiveCamera in first argument." );
	this.domElement = ( domElement !== undefined ) ? domElement : document.body;
	this.target = new THREE.Vector3();

	this.autoRotateSpeed = 1.0;

	this.minPolarAngle = 0.0;// degrees
	this.maxPolarAngle = 180.0;// degrees

	this.deceleration = 0.88;
	this.steps = 6.0;

	this.zoomSpeed = 0.2;
	this.zoomSteps = 1.0;
	this.minZoom = this.camera.fov;
	this.maxZoom = 30.0;

	this.enabledZoom = true;

	var scope = this;

	var isDown = false;

	var mouseDown = new THREE.Vector2();
	var mouseMove = new THREE.Vector2();

	var dollyStart = new THREE.Vector2();
	var dollyEnd = new THREE.Vector2();
	var dollyDelta = new THREE.Vector2();
	
	var phiDelta = 0.0;
	var thetaDelta = 0.0;
	var phi = 90.0;
	var theta = 90.0;

	var fov = this.camera.fov;

	var offset = 0.000001;

	this.update = function() 
	{
		if ( isDown ) {

			thetaDelta = ( mouseDown.x - mouseMove.x ) / scope.steps;
			phiDelta = ( mouseDown.y - mouseMove.y ) / scope.steps;

		};

		phi += phiDelta;
		theta += thetaDelta;

		phi = Math.max( scope.minPolarAngle + offset, Math.min( scope.maxPolarAngle - offset, phi ) );
		
		thetaDelta *= scope.deceleration;
		phiDelta *= scope.deceleration;

		scope.target.x = offset * Math.sin( phi * Math.PI / 180 ) * Math.cos( theta * Math.PI / 180 );
		scope.target.y = offset * Math.cos( phi * Math.PI / 180 );
		scope.target.z = offset * Math.sin( phi * Math.PI / 180 ) * Math.sin( theta * Math.PI / 180 );
		
		scope.camera.lookAt( scope.target );

		mouseDown.copy( mouseMove );
		
	};

	function onMouseDown( event ) {

		event.preventDefault();

		isDown = true;

		if ( event.changedTouches || event.touches ) {

			switch ( event.touches.length ) {

				case 1:

					mouseDown.set( event.changedTouches[ 0 ].pageX, event.changedTouches[ 0 ].pageY );
					mouseMove.copy( mouseDown );

					break;
				case 2:

					if ( scope.enabledZoom === false ) return;

					var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
					var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
					var distance = Math.sqrt( dx * dx + dy * dy );
					dollyStart.set( 0, distance );

					break;
			
			};

		} else {

			mouseDown.set( event.clientX, event.clientY );
			mouseMove.copy( mouseDown );
		
		};

		event.stopPropagation();

	};

	function onMouseMove( event ) {

		event.preventDefault();

		if ( event.changedTouches || event.touches ) {

			switch( event.touches.length ) {

				case 1:

					mouseMove.set( event.changedTouches[ 0 ].pageX, event.changedTouches[ 0 ].pageY );

					break;
				case 2:

					if ( scope.enabledZoom === false ) return;

					var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
					var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
					var distance = Math.sqrt( dx * dx + dy * dy );

					dollyEnd.set( 0, distance );
					dollyDelta.subVectors( dollyEnd, dollyStart );

					if ( dollyDelta.y > 0 ) {

						fov *= Math.pow( 0.95, scope.zoomSpeed ) * scope.zoomSteps; 

					} else {

						fov /= Math.pow( 0.95, scope.zoomSpeed ) * scope.zoomSteps;

					}

					dollyStart.copy( dollyEnd );

					if ( fov <= scope.maxZoom ) fov = scope.maxZoom;
					if ( fov >= scope.minZoom ) fov = scope.minZoom;

					scope.camera.fov += ( fov - scope.camera.fov ) * scope.zoomSpeed;
					scope.camera.updateProjectionMatrix();

					break;

			};
			
		} else {

			mouseMove.set( event.clientX, event.clientY );

		};

		event.stopPropagation();

	};

	function onMouseUp( event ) {

		event.preventDefault();

		isDown = false;

		event.stopPropagation();
	};

	function onMouseWheel( event ) {

		if ( scope.enabledZoom === false ) return;

		event.preventDefault();
		event.stopPropagation();
		
		event = event ? event : window.event;

		fov = scope.camera.fov - ( event.detail ? event.detail * -scope.zoomSteps : event.wheelDelta / scope.zoomSteps );

		if ( fov <= scope.maxZoom ) fov = scope.maxZoom;
		if ( fov >= scope.minZoom ) fov = scope.minZoom;

		scope.camera.fov += ( fov - scope.camera.fov ) * scope.zoomSpeed;
		scope.camera.updateProjectionMatrix();

	};

	this.enabled = function( value ) 
	{
		if ( value ) {

			this.domElement.addEventListener( 'mousedown', onMouseDown, false );
			this.domElement.addEventListener( 'mousemove', onMouseMove, false );
			this.domElement.addEventListener( 'mouseup', onMouseUp, false );
			this.domElement.addEventListener( 'touchstart', onMouseDown, false );
			this.domElement.addEventListener( 'touchmove', onMouseMove, false );
			this.domElement.addEventListener( 'touchend', onMouseUp, false );

			this.domElement.addEventListener( 'mousewheel', onMouseWheel, false );
			this.domElement.addEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox
		
		} else {

			this.domElement.removeEventListener( 'mousedown', onMouseDown, false );
			this.domElement.removeEventListener( 'mousemove', onMouseMove, false );
			this.domElement.removeEventListener( 'mouseup', onMouseUp, false );
			this.domElement.removeEventListener( 'touchstart', onMouseDown, false );
			this.domElement.removeEventListener( 'touchmove', onMouseMove, false );
			this.domElement.removeEventListener( 'touchend', onMouseUp, false );

			this.domElement.removeEventListener( 'mousewheel', onMouseWheel, false );
			this.domElement.removeEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox
		
		};

	};

	this.domElement.addEventListener( 'contextmenu', function( event ) { event.preventDefault(); return false; }, false );

	this.update();
	this.enabled( true );

};

