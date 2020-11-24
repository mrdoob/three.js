THREE.DragControls = function ( _objects, _camera, _domElement ) {

	var _plane = new THREE.Plane();
	var _raycaster = new THREE.Raycaster();

	var _mouse = new THREE.Vector2();
	var _offset = new THREE.Vector3();
	var _intersection = new THREE.Vector3();
	var _worldPosition = new THREE.Vector3();
	var _inverseMatrix = new THREE.Matrix4();
	var _intersections = [];

	var _selected = null, _hovered = null;

	//

	var scope = this;

	function activate() {

		_domElement.addEventListener( 'pointermove', onPointerMove, false );
		_domElement.addEventListener( 'pointerdown', onPointerDown, false );
		_domElement.addEventListener( 'pointerup', onPointerCancel, false );
		_domElement.addEventListener( 'pointerleave', onPointerCancel, false );
		_domElement.addEventListener( 'touchmove', onTouchMove, false );
		_domElement.addEventListener( 'touchstart', onTouchStart, false );
		_domElement.addEventListener( 'touchend', onTouchEnd, false );

	}

	function deactivate() {

		_domElement.removeEventListener( 'pointermove', onPointerMove, false );
		_domElement.removeEventListener( 'pointerdown', onPointerDown, false );
		_domElement.removeEventListener( 'pointerup', onPointerCancel, false );
		_domElement.removeEventListener( 'pointerleave', onPointerCancel, false );
		_domElement.removeEventListener( 'touchmove', onTouchMove, false );
		_domElement.removeEventListener( 'touchstart', onTouchStart, false );
		_domElement.removeEventListener( 'touchend', onTouchEnd, false );

		_domElement.style.cursor = '';

	}

	function dispose() {

		deactivate();

	}

	function getObjects() {

		return _objects;

	}

	function onPointerMove( event ) {

		event.preventDefault();

		switch ( event.pointerType ) {

			case 'mouse':
			case 'pen':
				onMouseMove( event );
				break;

			// TODO touch

		}

	}

	function onMouseMove( event ) {

		var rect = _domElement.getBoundingClientRect();

		_mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
		_mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;

		_raycaster.setFromCamera( _mouse, _camera );

		if ( _selected && scope.enabled ) {

			if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

				_selected.position.copy( _intersection.sub( _offset ).applyMatrix4( _inverseMatrix ) );

			}

			scope.dispatchEvent( { type: 'drag', object: _selected } );

			return;

		}

		_intersections.length = 0;

		_raycaster.setFromCamera( _mouse, _camera );
		_raycaster.intersectObjects( _objects, true, _intersections );

		if ( _intersections.length > 0 ) {

			var object = _intersections[ 0 ].object;

			_plane.setFromNormalAndCoplanarPoint( _camera.getWorldDirection( _plane.normal ), _worldPosition.setFromMatrixPosition( object.matrixWorld ) );

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

	function onPointerDown( event ) {

		event.preventDefault();

		switch ( event.pointerType ) {

			case 'mouse':
			case 'pen':
				onMouseDown( event );
				break;

			// TODO touch

		}

	}

	function onMouseDown( event ) {

		event.preventDefault();

		_intersections.length = 0;

		_raycaster.setFromCamera( _mouse, _camera );
		_raycaster.intersectObjects( _objects, true, _intersections );

		if ( _intersections.length > 0 ) {

			_selected = ( scope.transformGroup === true ) ? _objects[ 0 ] : _intersections[ 0 ].object;

			if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

				_inverseMatrix.copy( _selected.parent.matrixWorld ).invert();
				_offset.copy( _intersection ).sub( _worldPosition.setFromMatrixPosition( _selected.matrixWorld ) );

			}

			_domElement.style.cursor = 'move';

			scope.dispatchEvent( { type: 'dragstart', object: _selected } );

		}


	}

	function onPointerCancel( event ) {

		event.preventDefault();

		switch ( event.pointerType ) {

			case 'mouse':
			case 'pen':
				onMouseCancel( event );
				break;

			// TODO touch

		}

	}

	function onMouseCancel( event ) {

		event.preventDefault();

		if ( _selected ) {

			scope.dispatchEvent( { type: 'dragend', object: _selected } );

			_selected = null;

		}

		_domElement.style.cursor = _hovered ? 'pointer' : 'auto';

	}

	function onTouchMove( event ) {

		event.preventDefault();
		event = event.changedTouches[ 0 ];

		var rect = _domElement.getBoundingClientRect();

		_mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
		_mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;

		_raycaster.setFromCamera( _mouse, _camera );

		if ( _selected && scope.enabled ) {

			if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

				_selected.position.copy( _intersection.sub( _offset ).applyMatrix4( _inverseMatrix ) );

			}

			scope.dispatchEvent( { type: 'drag', object: _selected } );

			return;

		}

	}

	function onTouchStart( event ) {

		event.preventDefault();
		event = event.changedTouches[ 0 ];

		var rect = _domElement.getBoundingClientRect();

		_mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
		_mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;

		_intersections.length = 0;

		_raycaster.setFromCamera( _mouse, _camera );
		 _raycaster.intersectObjects( _objects, true, _intersections );

		if ( _intersections.length > 0 ) {

			_selected = ( scope.transformGroup === true ) ? _objects[ 0 ] : _intersections[ 0 ].object;

			_plane.setFromNormalAndCoplanarPoint( _camera.getWorldDirection( _plane.normal ), _worldPosition.setFromMatrixPosition( _selected.matrixWorld ) );

			if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

				_inverseMatrix.copy( _selected.parent.matrixWorld ).invert();
				_offset.copy( _intersection ).sub( _worldPosition.setFromMatrixPosition( _selected.matrixWorld ) );

			}

			_domElement.style.cursor = 'move';

			scope.dispatchEvent( { type: 'dragstart', object: _selected } );

		}


	}

	function onTouchEnd( event ) {

		event.preventDefault();

		if ( _selected ) {

			scope.dispatchEvent( { type: 'dragend', object: _selected } );

			_selected = null;

		}

		_domElement.style.cursor = 'auto';

	}

	activate();

	// API

	this.enabled = true;
	this.transformGroup = false;

	this.activate = activate;
	this.deactivate = deactivate;
	this.dispose = dispose;
	this.getObjects = getObjects;

};

THREE.DragControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.DragControls.prototype.constructor = THREE.DragControls;
