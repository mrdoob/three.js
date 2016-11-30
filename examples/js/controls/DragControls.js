/*
 * @author zz85 / https://github.com/zz85
 * @author mrdoob / http://mrdoob.com
 * Running this will allow you to drag three.js objects around the screen.
 */

THREE.DragControls = function ( _objects, _camera, _domElement ) {

	if ( _objects instanceof THREE.Camera ) {

		console.warn( 'THREE.DragControls: Constructor now expects ( objects, camera, domElement )' );
		var temp = _objects; _objects = _camera; _camera = temp;

	}

	var _raycaster = new THREE.Raycaster();

	var _mouse = new THREE.Vector3(), _offset = new THREE.Vector3();
	var _selected, _hovered = null;

	var p3subp1 = new THREE.Vector3();
	var targetposition = new THREE.Vector3();

	this.enabled = true;

	//

	var scope = this;

	function activate() {

		_domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
		_domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
		_domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );

	}

	function deactivate() {

		_domElement.removeEventListener( 'mousemove', onDocumentMouseMove, false );
		_domElement.removeEventListener( 'mousedown', onDocumentMouseDown, false );
		_domElement.removeEventListener( 'mouseup', onDocumentMouseUp, false );

	}

	function dispose() {

		deactivate();

	}

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

			scope.dispatchEvent( { type: 'drag', object: _selected.object } );

			return;

		}

		_raycaster.setFromCamera( _mouse, _camera );

		var intersects = _raycaster.intersectObjects( _objects );

		if ( intersects.length > 0 ) {

			var object = intersects[ 0 ].object;

			if ( _hovered !== object ) {

				scope.dispatchEvent( { type: 'hoveron', object: object } );

				_domElement.style.cursor = 'pointer';
				_hovered = object;

			}

		} else {

			if ( _hovered !== null ) {

				scope.dispatchEvent( { type: 'hoveroff', object: _hovered } );

				_domElement.style.cursor = 'auto';
				_hovered = null;

			}

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

			scope.dispatchEvent( { type: 'dragstart', object: _selected.object } );

		}


	}

	function onDocumentMouseUp( event ) {

		event.preventDefault();

		if ( _selected ) {

			scope.dispatchEvent( { type: 'dragend', object: _selected.object } );
			_selected = null;

		}

		_domElement.style.cursor = 'auto';

	}

	activate();

	// API

	this.activate = activate;
	this.deactivate = deactivate;
	this.dispose = dispose;

	// Backward compatibility

	this.setObjects = function () {

		console.error( 'THREE.DragControls: setObjects() has been removed.' );

	};

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
		scope.dispatchEvent( { type: type } );

	};

};

THREE.DragControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.DragControls.prototype.constructor = THREE.DragControls;
