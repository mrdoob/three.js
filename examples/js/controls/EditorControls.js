/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author arodic / http://akirodic.com/
 */

THREE.EditorControls = function ( object, domElement ) {

	domElement = ( domElement !== undefined ) ? domElement : document;

	// API

	this.enabled = true;
	this.center = new THREE.Vector3();

	// internals

	var scope = this;
	var vector = new THREE.Vector3();
	var matrix = new THREE.Matrix3();

	var STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2 };
	var state = STATE.NONE;

	var center = this.center;

	// pointer data

	var touches = [];

	// pointers are expressed in -1 to 1 coordinate space relative to domElement.

	var pointers = [ new THREE.Vector2(), new THREE.Vector2() ];
	var pointersOld = [ new THREE.Vector2(), new THREE.Vector2() ];
	var pointersDelta = [ new THREE.Vector2(), new THREE.Vector2() ];

	// events

	var changeEvent = { type: 'change' };

	// hepler functions

	var getClosestPoint = function( point, pointArray ) {

		if ( pointArray[ 0 ].distanceTo( point) < pointArray[ 1 ].distanceTo( point) ) {

			return pointArray[ 0 ];
		
		}

		return pointArray[ 1 ];

	};

	var setPointers = function( event ) {

		// Set pointes from mouse/touch events and convert to -1 to 1 coordinate space.

		var parentRect = event.path[ 0 ].getBoundingClientRect();

		// Filter touches that originate from the same element as the event.   

		touches.length = 0;

		if ( event.touches ) {

			for ( var i = 0; i < event.touches.length; i++ ) {

				if ( event.touches[ i ].target === event.path[ 0 ] ) {

					touches.push( event.touches[ i ] );

				}

			}

		}
		
		// Set pointer[0] from mouse event.clientX/Y

		if ( touches.length == 0 ) {

			pointers[ 0 ].set(
				( event.clientX - parentRect.left ) / parentRect.width * 2 - 1,
				( event.clientY - parentRect.top ) / parentRect.height * 2 - 1
			);

		// Set both pointer[0] and pointer[1] from a single touch.

		} else if ( touches.length == 1 ) {

			pointers[ 0 ].set(
				( touches[ 0 ].pageX - parentRect.left ) / parentRect.width * 2 - 1,
				( touches[ 0 ].pageY - parentRect.top ) / parentRect.height * 2 - 1
			);
			pointers[ 1 ].copy( pointers[ 0 ] );
		
		// Set pointer[0] and pointer[1] from two touches.

		} else if ( touches.length == 2 ) {

			pointers[ 0 ].set(
				( touches[ 0 ].pageX - parentRect.left ) / parentRect.width * 2 - 1,
				( touches[ 0 ].pageY - parentRect.top ) / parentRect.height * 2 - 1
			);
			pointers[ 1 ].set(
				( touches[ 1 ].pageX - parentRect.left ) / parentRect.width * 2 - 1,
				( touches[ 1 ].pageY - parentRect.top) / parentRect.height * 2 - 1
			);

		}

	};

	this.focus = function ( target, frame ) {

		// Collection of all centers and radii in the hierarchy of the target.

		var targets = [];
		
		// Bounding box (minCenter/maxCenter) encompassing all centers in hierarchy.

		var minCenter;
		var maxCenter;

		target.traverse( function( child ) {

			child.updateMatrixWorld();

			var center = new THREE.Vector3();
			var scale = new THREE.Vector3();
			var radius = 0;

			child.matrixWorld.decompose( center, new THREE.Quaternion(), scale );
			scale = ( scale.x + scale.y + scale.z ) / 3;

			if ( child.geometry ) {

				child.geometry.computeBoundingSphere();
				center.add( child.geometry.boundingSphere.center.clone().multiplyScalar( scale ) );
				radius = child.geometry.boundingSphere.radius * scale;

			}

			targets.push( { center: center, radius: radius } );

			if ( !minCenter ) minCenter = center.clone();
			if ( !maxCenter ) maxCenter = center.clone();

			minCenter.min( center );
			maxCenter.max( center );

		} );

		// Center of the bounding box.

		var cumulativeCenter = minCenter.clone().add( maxCenter ).multiplyScalar( 0.5 );
		
		// Furthest ( center distance + radius ) from CumulativeCenter.
		
		var cumulativeRadius = 0;

		targets.forEach( function( target ) {
			
			var radius = cumulativeCenter.distanceTo( target.center ) + target.radius;
			cumulativeRadius = Math.max( cumulativeRadius, radius );
		
		} );

		if ( object instanceof THREE.PerspectiveCamera ) {

			// Look towards cumulativeCenter

			center.copy( cumulativeCenter );
			object.lookAt( center );

			if ( frame && cumulativeRadius ) {

				// Adjust distance to frame cumulativeRadius

				var fovFactor = Math.tan( ( object.fov / 2) * Math.PI / 180.0 );
				var pos = object.position.clone().sub( center ).normalize().multiplyScalar( cumulativeRadius  / fovFactor );

				object.position.copy( center ).add( pos );

			}

		} else if ( object instanceof THREE.OrthographicCamera ) {

			// Align camera center with cumulativeCenter

			var initialCenterOffset = object.position.clone().sub( center );
			center.copy( cumulativeCenter );
			object.position.copy( center ).add( initialCenterOffset );

			if ( frame && cumulativeRadius ) {

				// Adjust camera boundaries to frame cumulativeRadius

				var cw = object.right - object.left;
				var ch = object.top - object.bottom;
				var aspect = cw / ch;

				if ( aspect < 1 ) {

					object.top = cumulativeRadius / aspect;
					object.right = cumulativeRadius;
					object.bottom = -cumulativeRadius / aspect;
					object.left = -cumulativeRadius;

				} else {

					object.top = cumulativeRadius;
					object.right = cumulativeRadius * aspect;
					object.bottom = -cumulativeRadius;
					object.left = -cumulativeRadius * aspect;

				}

			}

		}

		scope.dispatchEvent( changeEvent );

	};

	this.pan = function ( delta ) {

		var distance = object.position.distanceTo( center );

		vector.set( -delta.x, delta.y, 0 );

		if ( object instanceof THREE.PerspectiveCamera ) {

			var fovFactor = distance * Math.tan( ( object.fov / 2 ) * Math.PI / 180.0 );
			vector.multiplyScalar( fovFactor );
			vector.x *= object.aspect;

		} else if ( object instanceof THREE.OrthographicCamera ) {

			vector.x *= ( object.right - object.left ) / 2;
			vector.y *= ( object.top - object.bottom ) / 2;

		}

		vector.applyMatrix3( matrix.getNormalMatrix( object.matrix ) );
		object.position.add( vector );
		center.add( vector );

		scope.dispatchEvent( changeEvent );

	};

	this.zoom = function ( delta ) {

		if ( object instanceof THREE.PerspectiveCamera ) {

			var distance = object.position.distanceTo( center );

			vector.set( 0, 0, delta.y );

			vector.multiplyScalar( distance );

			if ( vector.length() > distance ) return;

			vector.applyMatrix3(matrix.getNormalMatrix( object.matrix ) );

			object.position.add( vector );

		} else if ( object instanceof THREE.OrthographicCamera ) {

			object.top *= 1 + delta.y;
			object.right *= 1 + delta.y;
			object.bottom *= 1 + delta.y;
			object.left *= 1 + delta.y;

		}

		scope.dispatchEvent( changeEvent );

	};

	this.rotate = function ( delta ) {

		vector.copy( object.position ).sub( center );

		var theta = Math.atan2( vector.x, vector.z );
		var phi = Math.atan2( Math.sqrt( vector.x * vector.x + vector.z * vector.z ), vector.y );

		theta -= delta.x;
		phi -= delta.y;

		var EPS = 0.000001;

		phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );

		var radius = vector.length();

		vector.x = radius * Math.sin( phi ) * Math.sin( theta );
		vector.y = radius * Math.cos( phi );
		vector.z = radius * Math.sin( phi ) * Math.cos( theta );

		object.position.copy( center ).add( vector );

		object.lookAt( center );

		scope.dispatchEvent( changeEvent );

	};

	// mouse

	function onMouseDown( event ) {

		if ( scope.enabled === false ) return;

		if ( event.button === 0 ) {

			state = STATE.ROTATE;

			if ( object instanceof THREE.OrthographicCamera ) {
				
				state = STATE.PAN;
			
			};

		} else if ( event.button === 1 ) {

			state = STATE.ZOOM;

		} else if ( event.button === 2 ) {

			state = STATE.PAN;

		}

		setPointers( event );

		pointersOld[ 0 ].copy( pointers[ 0 ] );

		domElement.addEventListener( 'mousemove', onMouseMove, false );
		domElement.addEventListener( 'mouseup', onMouseUp, false );
		domElement.addEventListener( 'mouseout', onMouseUp, false );
		domElement.addEventListener( 'dblclick', onMouseUp, false );

	}

	function onMouseMove( event ) {

		if ( scope.enabled === false ) return;

		setPointers( event );

		pointersDelta[ 0 ].subVectors( pointers[ 0 ], pointersOld[ 0 ] );
		pointersOld[ 0 ].copy( pointers[ 0 ] );

		if ( state === STATE.ROTATE ) {

			scope.rotate( pointersDelta[ 0 ] );

		} else if ( state === STATE.ZOOM ) {

			scope.zoom( pointersDelta[ 0 ] );

		} else if ( state === STATE.PAN ) {

			scope.pan( pointersDelta[ 0 ] );

		}

	}

	function onMouseUp( event ) {

		domElement.removeEventListener( 'mousemove', onMouseMove, false );
		domElement.removeEventListener( 'mouseup', onMouseUp, false );
		domElement.removeEventListener( 'mouseout', onMouseUp, false );
		domElement.removeEventListener( 'dblclick', onMouseUp, false );

		state = STATE.NONE;

	}

	function onMouseWheel( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

		var delta = 0;

		if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9

			delta = - event.wheelDelta;

		} else if ( event.detail ) { // Firefox

			delta = event.detail * 10;

		}

		scope.zoom( new THREE.Vector2( 0, delta / 1000 ) );

	}

	domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	domElement.addEventListener( 'mousedown', onMouseDown, false );
	domElement.addEventListener( 'mousewheel', onMouseWheel, false );
	domElement.addEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox

	function touchStart( event ) {

		if ( scope.enabled === false ) return;

		setPointers( event );

		pointersOld[ 0 ].copy( pointers[ 0 ] );
		pointersOld[ 1 ].copy( pointers[ 1 ] );

	}


	function touchMove( event ) {

		if ( scope.enabled === false ) return;

		setPointers( event );

		switch ( touches.length ) {

			case 1:

				pointersDelta[ 0 ].subVectors( pointers[ 0 ], getClosestPoint( pointers[ 0 ], pointersOld ) );
				pointersDelta[ 1 ].subVectors( pointers[ 1 ], getClosestPoint( pointers[ 1 ], pointersOld ) );
				
				if ( object instanceof THREE.PerspectiveCamera ) {
				
					scope.rotate( pointersDelta[ 0 ] );
				
				} else if ( object instanceof THREE.OrthographicCamera ) {
				
					scope.pan( pointersDelta[ 0 ] );
				
				}
				break;

			case 2:

				pointersDelta[ 0 ].subVectors( pointers[ 0 ], getClosestPoint( pointers[ 0 ], pointersOld ) );
				pointersDelta[ 1 ].subVectors( pointers[ 1 ], getClosestPoint( pointers[ 1 ], pointersOld ) );
				
				var prevDistance = pointersOld[ 0 ].distanceTo( pointersOld[ 1 ] );
				var distance = pointers[ 0 ].distanceTo( pointers[ 1 ] );
				
				if ( prevDistance ) {
				
					scope.zoom( new THREE.Vector2(0, prevDistance - distance ) );
					scope.pan( pointersDelta[ 0 ].clone().add( pointersDelta[ 1 ] ).multiplyScalar(0.5) );
				
				}

				break;
		}

		pointersOld[ 0 ].copy( pointers[ 0 ] );
		pointersOld[ 1 ].copy( pointers[ 1 ] );

	}

	domElement.addEventListener( 'touchstart', touchStart, false );
	domElement.addEventListener( 'touchmove', touchMove, false );

};

THREE.EditorControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.EditorControls.prototype.constructor = THREE.EditorControls;
