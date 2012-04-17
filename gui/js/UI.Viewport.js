UI.Viewport = function () {

	var _width, _height;
	var _isMouseDown = false;
	var _snapToAxis = null;

	var _HOVERED, _SELECTED;
	var _offset = new THREE.Vector3();

	//

	var _domElement = document.createElement( 'div' );
	_domElement.style.position = 'absolute';
	_domElement.style.backgroundColor = '#808080';

	//

	var _camera = new THREE.PerspectiveCamera( 50, 1, 1, 5000 );
	_camera.position.x = 500;
	_camera.position.y = 250;
	_camera.position.z = 500;
	_camera.lookAt( new THREE.Vector3() );

	var _controls = new THREE.TrackballControls( _camera );
	_controls.rotateSpeed = 1.0;
	_controls.zoomSpeed = 1.2;
	_controls.panSpeed = 0.8;
	_controls.noZoom = false;
	_controls.noPan = false;
	_controls.staticMoving = true;
	_controls.dynamicDampingFactor = 0.3;

	// guides

	var _sceneHelpers = new THREE.Scene();

	var _grid = new THREE.Mesh( new THREE.PlaneGeometry( 1000, 1000, 20, 20 ), new THREE.MeshBasicMaterial( { color: 0x606060, wireframe: true, transparent: true } ) );
	_sceneHelpers.add( _grid );

	//

	var _scene = new THREE.Scene();

	_scene.add(_camera);

	/*
	var light = new THREE.AmbientLight( 0x404040 );
	_scene.add( light );

	var light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 1000, 1000, - 1000 );
	light.position.normalize();
	_scene.add( light );
	*/

	var _plane = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.25, transparent: true, wireframe: true } ) );
	_plane.visible = false;
	_plane.geometry.applyMatrix( new THREE.Matrix4().makeRotationX( Math.PI / 2 ) );

	_sceneHelpers.add( _plane );

	var _projector = new THREE.Projector();

	var _renderer = new THREE.WebGLRenderer();
	_renderer.autoClear = false;
	_renderer.domElement.addEventListener( 'mousedown', function ( event ) {

		event.preventDefault();

		_isMouseDown = true;

		var vector = new THREE.Vector3( ( event.clientX / _width ) * 2 - 1, - ( event.clientY / _height ) * 2 + 1, 0.5 );
		_projector.unprojectVector( vector, _camera );

		var ray = new THREE.Ray( _camera.position, vector.subSelf( _camera.position ).normalize() );
		var intersects = ray.intersectObjects( _scene.children );

		if ( intersects.length ) {

			_SELECTED = intersects[ 0 ].object;

			_controls.enabled = false;

			var intersects = ray.intersectObject( _plane );
			_offset.copy( intersects[ 0 ].point ).subSelf( _plane.position );

		}

	}, false );
	_renderer.domElement.addEventListener( 'mousemove', function ( event ) {

		event.preventDefault();

		var vector = new THREE.Vector3( ( event.clientX / _width ) * 2 - 1, - ( event.clientY / _height ) * 2 + 1, 0.5 );
		_projector.unprojectVector( vector, _camera );

		var ray = new THREE.Ray( _camera.position, vector.subSelf( _camera.position ).normalize() );
		var intersects = ray.intersectObjects( _scene.children );

		if ( _SELECTED ) {

			var intersects = ray.intersectObject( _plane );
			_SELECTED.position.copy( intersects[ 0 ].point.subSelf( _offset ) );

			switch ( _snapToAxis ) {

				case 'x':
					_SELECTED.position.y = _plane.position.y;
					_SELECTED.position.z = _plane.position.z;
					break;

				case 'y':
					_SELECTED.position.x = _plane.position.x;
					_SELECTED.position.z = _plane.position.z;
					break;

				case 'z':
					_SELECTED.position.x = _plane.position.x;
					_SELECTED.position.y = _plane.position.y;
					break;

			}

			_render();

			signals.updated.dispatch( _scene );

			return;

		}

		if ( intersects.length ) {

			_HOVERED = intersects[ 0 ].object;

			_plane.position.set( 0, 0, 0 );
			_plane.lookAt( _camera.position );
			_plane.position.copy( _HOVERED.position );

		} else {

			_HOVERED = null;

		}

		_render();

	}, false );
	_renderer.domElement.addEventListener( 'mouseup', function ( event ) {

		// event.preventDefault();

		_isMouseDown = false; 
		_snapToAxis = null;

		_controls.enabled = true;

		if ( _SELECTED ) {

			_plane.position.copy( _SELECTED.position );
			_SELECTED = null;

		}

	}, false );
	/*
	_renderer.domElement.addEventListener( 'mousewheel', function ( event ) {

		if ( event.wheelDeltaY ) {

			event.preventDefault();

			var vector = _camera.position.clone();
			var amount = event.wheelDeltaY * 0.2;

			if ( vector.length() - amount < 10 ) return;

			vector.normalize().multiplyScalar( amount );
			_camera.position.subSelf( vector );

			_render();

		}

	}, false );
	*/
	document.addEventListener( 'keydown', function ( event ) {

		if ( _isMouseDown ) {

			// console.log( event.keyCode );

			switch ( event.keyCode ) {

				case 88: // x
					_snapToAxis = 'x';
					break;

				case 89: // y
					_snapToAxis = 'y';
					break;

				case 90: // z
					_snapToAxis = 'z';
					break;

			}

		}

	}, false );
	_domElement.appendChild( _renderer.domElement );

	// signals

	signals.added.add( function ( object ) {

		_scene.add( object );
		_render();

		signals.updated.dispatch( _scene );

	} );

	//

	this.getDOMElement = function () {

		return _domElement;

	};

	this.setSize = function ( width, height ) {

		_width = width;
		_height = height;

		_camera.aspect = width / height;
		_camera.updateProjectionMatrix();

		_renderer.setSize( width, height );

		_render();

	};

	var _render = function () {

		_controls.update();

		_renderer.clear();
		_renderer.render( _sceneHelpers, _camera );
		_renderer.render( _scene, _camera );

	};

}
