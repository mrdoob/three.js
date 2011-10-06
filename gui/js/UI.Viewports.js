UI.Viewports = function () {

	var _width, _height;
	var _xhalf = 0.5, _yhalf = 0.5;

	var _HOVERED, _SELECTED;
	var _offset = new THREE.Vector3();

	//

	var _domElement = document.createElement( 'div' );
	_domElement.style.position = 'absolute';
	_domElement.style.backgroundColor = '#808080';

	//

	var _views = [
		{ x: null, y: null, width: null, height: null, camera: null },
		{ x: null, y: null, width: null, height: null, camera: null },
		{ x: null, y: null, width: null, height: null, camera: null },
		{ x: null, y: null, width: null, height: null, camera: null }
	];

	_views[ 0 ].camera = new THREE.PerspectiveCamera( 50, 1, 1, 5000 ); // top
	_views[ 0 ].camera.position.y = 1000;
	_views[ 0 ].camera.rotation.x = - Math.PI / 2;

	_views[ 1 ].camera = new THREE.PerspectiveCamera( 50, 1, 1, 5000 ); // front
	_views[ 1 ].camera.position.z = 1000;

	_views[ 2 ].camera = new THREE.PerspectiveCamera( 50, 1, 1, 5000 ); // left
	_views[ 2 ].camera.position.x = - 1000;
	_views[ 2 ].camera.rotation.y = - Math.PI / 2;

	_views[ 3 ].camera = new THREE.PerspectiveCamera( 50, 1, 1, 5000 ); // perspective
	_views[ 3 ].camera.position.x = 1000;
	_views[ 3 ].camera.position.y = 1000;
	_views[ 3 ].camera.position.z = 1000;
	_views[ 3 ].camera.useTarget = true;

	// guides

	var _sceneHelpers = new THREE.Scene();

	var _grid = new THREE.Mesh( new THREE.PlaneGeometry( 1000, 1000, 20, 20 ), new THREE.MeshBasicMaterial( { color: 0x606060, wireframe: true, transparent: true } ) );
	_grid.rotation.x = Math.PI / 2;
	_sceneHelpers.add( _grid );

	//

	var _scene = new THREE.Scene();

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
	_sceneHelpers.add( _plane );

	var _projector = new THREE.Projector();

	var _renderer = new THREE.WebGLRenderer( { antialias: true } );
	_renderer.autoClear = false;
	_renderer.domElement.addEventListener( 'mousedown', function ( event ) {

		event.preventDefault();

		var mouse = getViewportMouse( event.clientX, event.clientY );

		var camera = _views[ mouse.view ].camera;
		var vector = new THREE.Vector3( mouse.x * 2 - 1, - mouse.y * 2 + 1, 0.5 );
		_projector.unprojectVector( vector, camera );

		var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );
		var intersects = ray.intersectScene( _scene );

		if ( intersects.length ) {

			_SELECTED = intersects[ 0 ].object;

			var intersects = ray.intersectObject( _plane );
			_offset.copy( intersects[ 0 ].point ).subSelf( _plane.position );

		}

	}, false );
	_renderer.domElement.addEventListener( 'mousemove', function ( event ) {

		event.preventDefault();

		var mouse = getViewportMouse( event.clientX, event.clientY );

		var camera = _views[ mouse.view ].camera;
		var vector = new THREE.Vector3( mouse.x * 2 - 1, - mouse.y * 2 + 1, 0.5 );
		_projector.unprojectVector( vector, camera );

		var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );
		var intersects = ray.intersectScene( _scene );

		if ( _SELECTED ) {

			var intersects = ray.intersectObject( _plane );
			_SELECTED.position.copy( intersects[ 0 ].point.subSelf( _offset ) );

			_render();

			signals.updated.dispatch( _scene );

			return;

		}

		if ( intersects.length ) {

			_HOVERED = intersects[ 0 ].object;

			_plane.position.set( 0, 0, 0 );
			_plane.lookAt( camera.position );
			_plane.position.copy( _HOVERED.position );

			_render();

		} else {

			_HOVERED = null;

		}

	}, false );
	_renderer.domElement.addEventListener( 'mouseup', function ( event ) {

		event.preventDefault();

		if ( _SELECTED ) {

			_plane.position.copy( _SELECTED.position );
			_SELECTED = null;

		}

	}, false );
	_renderer.domElement.addEventListener( 'mousewheel', function ( event ) {

		if ( event.wheelDeltaY ) {

			event.preventDefault();

			var mouse = getViewportMouse( event.clientX, event.clientY );
			var camera = _views[ mouse.view ].camera;
			var vector = camera.position.clone();
			var amount = event.wheelDeltaY * 0.2;

			if ( vector.length() - amount < 10 ) return;

			vector.normalize().multiplyScalar( amount );
			camera.position.subSelf( vector );

			_render();

		}

	}, false );
	_domElement.appendChild( _renderer.domElement );

	//

	var _xr = document.createElement( 'div' );
	_xr.style.position = 'absolute';
	_xr.style.top = '0px';
	_xr.style.width = '1px';
	_xr.style.borderLeft = '1px solid #808080';
	_xr.style.borderRight = '1px solid #808080';
	_xr.style.backgroundColor = '#404040';
	_xr.style.cursor = 'col-resize';
	_xr.addEventListener( 'mousedown', function ( event ) {

		event.preventDefault();

		document.body.style.cursor = 'col-resize';
		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'mouseup', onMouseUp, false );

		function onMouseMove( event ) {

			event.preventDefault();

			_xhalf = Math.max( 0, Math.min( 1, event.clientX / _width ) );

			_updateViews();
			_updateCameras();
			_render();

		}

		function onMouseUp( event ) {

			document.body.style.cursor = 'auto';
			document.removeEventListener( 'mousemove', onMouseMove, false );
			document.removeEventListener( 'mouseup', onMouseUp, false );

		}

	}, false );
	_xr.addEventListener( 'dblclick', function ( event ) {

		_xhalf = 0.5;

		_updateViews();
		_updateCameras();
		_render();

	}, false );
	_domElement.appendChild( _xr );

	var _yr = document.createElement( 'div' );
	_yr.style.position = 'absolute';
	_yr.style.height = '1px';
	_yr.style.borderTop = '1px solid #808080';
	_yr.style.borderBottom = '1px solid #808080';
	_yr.style.backgroundColor = '#404040';
	_yr.style.cursor = 'row-resize';
	_yr.addEventListener( 'mousedown', function ( event ) {

		event.preventDefault();

		document.body.style.cursor = 'row-resize';
		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'mouseup', onMouseUp, false );

		function onMouseMove( event ) {

			event.preventDefault();

			_yhalf = Math.max( 0, Math.min( 1, event.clientY / _height ) );

			_updateViews();
			_updateCameras();
			_render();

		}

		function onMouseUp( event ) {

			document.body.style.cursor = 'auto';
			document.removeEventListener( 'mousemove', onMouseMove, false );
			document.removeEventListener( 'mouseup', onMouseUp, false );

		}

	}, false );
	_yr.addEventListener( 'dblclick', function ( event ) {

		_yhalf = 0.5;

		_updateViews();
		_updateCameras();
		_render();

	}, false );
	_domElement.appendChild( _yr );

	function getViewportMouse( x, y ) {

		var width = _views[ 0 ].width;
		var height = _views[ 0 ].height;

		if ( x < width && y < height ) {

			return {

				view: 0,
				x: x / _views[ 0 ].width,
				y: y / _views[ 0 ].height

			};

		} else if ( x > width && y < height ) {

			return {

				view: 1,
				x: ( x - _views[ 1 ].x ) / _views[ 1 ].width,
				y: y / _views[ 1 ].height

			};

		} else if ( x < width && y > height ) {

			return {

				view: 2,
				x: x / _views[ 2 ].width,
				y: ( y - _views[ 2 ].y ) / _views[ 2 ].height

			};

		} else if ( x > width && y > height ) {

			return {

				view: 3,
				x: ( x - _views[ 3 ].x ) / _views[ 3 ].width,
				y: ( y - _views[ 3 ].y ) / _views[ 3 ].height

			};

		}

	}

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

		_updateViews();
		_updateCameras();

		_renderer.setSize( _width, _height );

		_render();

	};

	var _updateViews = function () {

		_views[ 0 ].x = 0;
		_views[ 0 ].y = 0;
		_views[ 0 ].width = _width * _xhalf;
		_views[ 0 ].height = _height * _yhalf;

		_views[ 1 ].x = _width * _xhalf;
		_views[ 1 ].y = 0;
		_views[ 1 ].width = _width - _width * _xhalf;
		_views[ 1 ].height = _height * _yhalf;

		_views[ 2 ].x = 0;
		_views[ 2 ].y = _height * _yhalf;
		_views[ 2 ].width = _width * _xhalf;
		_views[ 2 ].height = _height - _height * _yhalf;

		_views[ 3 ].x = _width * _xhalf;
		_views[ 3 ].y = _height * _yhalf;
		_views[ 3 ].width = _width - _width * _xhalf;
		_views[ 3 ].height = _height - _height * _yhalf;

	};

	var _updateCameras = function () {

		_views[ 0 ].camera.aspect = _views[ 0 ].width / _views[ 0 ].height;
		_views[ 0 ].camera.updateProjectionMatrix();

		_views[ 1 ].camera.aspect = _views[ 1 ].width / _views[ 1 ].height;
		_views[ 1 ].camera.updateProjectionMatrix();

		_views[ 2 ].camera.aspect = _views[ 2 ].width / _views[ 2 ].height;
		_views[ 2 ].camera.updateProjectionMatrix();

		_views[ 3 ].camera.aspect = _views[ 3 ].width / _views[ 3 ].height;
		_views[ 3 ].camera.updateProjectionMatrix();


	};

	var _render = function () {

		_xr.style.left = ( _width * _xhalf ) + 'px';
		_xr.style.height = _height + 'px';

		_yr.style.top = ( _height * _yhalf ) + 'px';
		_yr.style.width = _width + 'px';

		//

		_views[ 3 ].camera.lookAt( _scene.origin );

		_renderer.clear();

		_renderer.setViewport( 0, _height - _height * _yhalf, _views[ 0 ].width, _views[ 0 ].height );
		_renderer.render( _sceneHelpers, _views[ 0 ].camera );
		_renderer.render( _scene, _views[ 0 ].camera );

		_renderer.setViewport( _width * _xhalf, _height - _height * _yhalf, _views[ 1 ].width, _views[ 1 ].height );
		_renderer.render( _sceneHelpers, _views[ 1 ].camera );
		_renderer.render( _scene, _views[ 1 ].camera );

		_renderer.setViewport( 0, 0, _views[ 2 ].width, _views[ 2 ].height );
		_renderer.render( _sceneHelpers, _views[ 2 ].camera );
		_renderer.render( _scene, _views[ 2 ].camera );

		_renderer.setViewport( _width * _xhalf, 0, _views[ 3 ].width, _views[ 3 ].height );
		_renderer.render( _sceneHelpers, _views[ 3 ].camera );
		_renderer.render( _scene, _views[ 3 ].camera );

	};

}
