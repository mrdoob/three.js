/*
 * @author zz85 / https://github.com/zz85
 * @author mrdoob / http://mrdoob.com
 * Running this will allow you to drag three.js objects around the screen.
 */

THREE.DragControls = function ( _camera, _objects, _domElement ) {

	var _raycaster = new THREE.Raycaster();

	var _mouse = new THREE.Vector3(),
		_offset = new THREE.Vector3();
	var _selected, _hovered;

	var p3subp1 = new THREE.Vector3();
	var targetposition = new THREE.Vector3();

	this.enabled = false;

	var scope = this;

	this.setObjects = function ( objects ) {

		if ( Array.isArray( objects ) === false ) {

			console.error( 'THREE.DragControls.setObjects() expects an Array.' );
			return;

		}

		_objects = objects;

	};

	this.setObjects( _objects );

	this.activate = function () {

		_domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
		_domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
		_domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );

	};

	this.deactivate = function () {

		_domElement.removeEventListener( 'mousemove', onDocumentMouseMove, false );
		_domElement.removeEventListener( 'mousedown', onDocumentMouseDown, false );
		_domElement.removeEventListener( 'mouseup', onDocumentMouseUp, false );

	};

	this.dispose = function () {

		scope.deactivate();

	};

	this.activate();

	function onDocumentMouseMove( event ) {

		event.preventDefault();

		_mouse.x = ( event.clientX / _domElement.width ) * 2 - 1;
		_mouse.y = - ( event.clientY / _domElement.height ) * 2 + 1;

		_raycaster.setFromCamera( _mouse, _camera );

		var ray = _raycaster.ray;

		if ( _selected && scope.enabled ) {

			var normal = _selected.normal;

			// I found this article useful about plane-line intersections
			// http://paulbourke.net/geometry/planeline/

			var denom = normal.dot( ray.direction );
			if ( denom == 0 ) {

				// bail
				console.log( 'no or infinite solutions' );
				return;

			}

			var num = normal.dot( p3subp1.copy( _selected.point ).sub( ray.origin ) );
			var u = num / denom;

			targetposition.copy( ray.direction ).multiplyScalar( u ).add( ray.origin ).sub( _offset );
			// _selected.object.position.copy(targetposition);

			var xLock, yLock;

			var moveX, moveY, moveZ;


			if ( xLock ) {

				moveX = true;
				moveY = false;
				moveZ = false;

			} else if ( yLock ) {

				moveX = false;
				moveY = true;
				moveZ = false;

			} else {

				moveX = moveY = moveZ = true;

			}

			// Reverse Matrix?
			if ( moveX ) _selected.object.position.x = targetposition.x;
			if ( moveY ) _selected.object.position.y = targetposition.y;
			if ( moveZ ) _selected.object.position.z = targetposition.z;

			scope.dispatchEvent( { type: 'drag', object: _selected } );

			return;

		}

		_raycaster.setFromCamera( _mouse, _camera );
		var intersects = _raycaster.intersectObjects( _objects );

		if ( intersects.length > 0 ) {

			_domElement.style.cursor = 'pointer';
			_hovered = intersects[ 0 ];

			scope.dispatchEvent( { type: 'hoveron', object: _hovered } );

		} else {

			scope.dispatchEvent( { type: 'hoveroff', object: _hovered } );

			_hovered = null;
			_domElement.style.cursor = 'auto';

		}

	}

	function onDocumentMouseDown( event ) {

		event.preventDefault();

		_mouse.x = ( event.clientX / _domElement.width ) * 2 - 1;
		_mouse.y = - ( event.clientY / _domElement.height ) * 2 + 1;

		_raycaster.setFromCamera( _mouse, _camera );
		var intersects = _raycaster.intersectObjects( _objects );
		var ray = _raycaster.ray;

		var normal = ray.direction; // normal ray to the camera position
		if ( intersects.length > 0 ) {

			_selected = intersects[ 0 ];
			_selected.ray = ray;
			_selected.normal = normal;
			_offset.copy( _selected.point ).sub( _selected.object.position );

			_domElement.style.cursor = 'move';

			scope.dispatchEvent( { type: 'dragstart', object: _selected } );

		}


	}

	function onDocumentMouseUp( event ) {

		event.preventDefault();

		if ( _selected ) {

			scope.dispatchEvent( { type: 'dragend', object: _selected } );
			_selected = null;

		}

		_domElement.style.cursor = 'auto';

	}

	// Backward compatibility

	this.on = function ( type, listener ) {

		console.warn( 'THREE.DragControls: on() has been deprecated. Use addEventListener() instead.' );
		scope.addEventListener( type, listener );

	};

	this.off = function ( type, listener ) {

		console.warn( 'THREE.DragControls: off() has been deprecated. Use removeEventListener() instead.' );
		scope.removeEventListener( type, listener );

	};

	this.notify = function ( type ) {

		console.error( 'THREE.DragControls: notify() has been deprecated. Use dispatchEvent() instead.' );
		scope.removeEventListener( type );

	};

};

THREE.DragControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.DragControls.prototype.constructor = THREE.DragControls;
