/**
*	@author ScieCode - Guilherme Avila - https://github.com/sciecode
*
*	@class TexturePainter
*		@param	{WebGLRenderer}				renderer
*		@param	{PerspectiveCamera}		camera
*		@param	{Mesh}								object
*
* - Updating:
*			Requires .update() method to get called at every animation frame.
*			Requires .resize() method to get called on viewport resize.
*
*	- Important:
*			Mesh parameter must contain texture bound to material.map.
*			Occlusion Culling not implemented. This results in paint-through scenarios on non-convex geometries.
*
**/

THREE.TexturePainter = function ( renderer, camera, object ) {

	// controls alpha falloff as faces normal rotate away from camera.
	this.enableFalloff = true;
	this.falloff = Math.PI/4.0;

	// bleed paint outside of face clip, small amounts can remove artifacts
	this.enableBleed = true;
	this.bleed = 0.015;

	// brush color
	this.color = new THREE.Color( '#cccb26' );

	// brush opacity
	this.opacity = 0.5;

	// default paint button - LEFT_CLICK
	this.DEFAULT_BUTTON = THREE.MOUSE.LEFT;

	this.update = function( ) {

		if ( ! _camera.position.equals( _cameraPosition ) ) _cameraUpdated = true;

		if ( _drawEnabled ) draw( getDrawLocations() );

		if ( _readyToMerge ) mergeBrushes();

		_renderer.autoClear = false;
		_renderer.render( _scene, _orthoCamera );

	};

	this.resize = function ( ) {

		_aspect = window.innerWidth / window.innerHeight;

		_cursorUnits = _brushSize / _frustumSize / _aspect;

		_orthoCamera.left = - _frustumSize * _aspect / 2;
		_orthoCamera.right = _frustumSize * _aspect / 2;
		_orthoCamera.top = _frustumSize / 2;
		_orthoCamera.bottom = - _frustumSize / 2;

		_orthoCamera.updateProjectionMatrix();

		_cameraUpdated = true;

	};

	this.setTexture = function( texture ) {

		_background.src = texture;

	};

	this.setBrushSize = function( size ) {

		_brushSize = size;
		_cursorUnits = _brushSize / _frustumSize / _aspect,
		_cursorMesh.scale.set( _brushSize, _brushSize, 1 );

		_cursorContext.lineWidth = 8;
		_cursorContext.strokeStyle = "rgba(0, 0, 0, 0.7)";

		_cursorContext.clearRect( 0, 0, _cursorCanvas.width, _cursorCanvas.height );

		_cursorContext.ellipse(
			_cursorCanvas.width/2, // x
			_cursorCanvas.height/2, // y
			_cursorCanvas.width/2 - _cursorContext.lineWidth, // radiusX
			_cursorCanvas.height/2 - _cursorContext.lineWidth, // radiusY
			0, // rotation
			0, // angle start
			Math.PI*2 // angle end
		);

		_cursorContext.stroke();

		_cursorTexture.needsUpdate = true;

	};

	this.setMesh = function( object ) {

		if ( object === undefined || !( object instanceof THREE.Mesh ) )
		console.error("TexturePainter: must provide a valid Mesh.");

		if ( object.material.map === undefined )
		console.error("TexturePainter: no .map texture on Mesh Material.");

		_geometry = object.geometry;

		_texture = object.material.map;
		_texture.image = _textureCanvas;

		_mesh = object;

	}

	//
	// internals
	//

	var scope = this,

	_renderer = renderer,
	_camera = camera;
	_object = object;

	var initialize = function( ) {

		if ( _renderer === undefined || !( _renderer instanceof THREE.WebGLRenderer ) )
		console.error("TexturePainter: must provide a valid WebGLRenderer.");

		if ( _camera === undefined || !( _camera instanceof THREE.PerspectiveCamera ) )
		console.error("TexturePainter: must provide a valid PerspectiveCamera.");

		if ( _object === undefined || !( _object instanceof THREE.Mesh ) )
		console.error("TexturePainter: must provide a valid Mesh.");

		if ( _object.material.map === undefined )
		console.error("TexturePainter: no .map texture on Mesh Material.");

		_drawEnabled = false,
		_readyToMerge = false,
		_cameraUpdated = true,

		_brushSize = 5,
		_frustumSize = 100,
		_reference = new THREE.Vector3(),
		_aspect = window.innerWidth / window.innerHeight,
		_cursorUnits = _brushSize / _frustumSize / _aspect;

		canvasInitialize();

		cursorInitialize();

		scope.setMesh( _object );

		var textureSource = 'textures/UV_Grid_Sm.jpg';
		scope.setTexture( textureSource );

		_cameraPosition = _camera.position.clone();

	} ();

	// canvas-functions
	function canvasInitialize() {

		_textureCanvas = document.createElement( "canvas" );
		_textureContext = _textureCanvas.getContext( "2d" );

		_sumCanvas = document.createElement( "canvas" );
		_sumContext = _sumCanvas.getContext( "2d" );

		_brushesCanvas = document.createElement( "canvas" );
		_brushesContext = _brushesCanvas.getContext( "2d" );

		_currentCanvas = document.createElement( "canvas" );
		_currentContext = _currentCanvas.getContext( "2d" );

		_background = document.createElement( "img" );
		_background.crossOrigin = '';

		_background.addEventListener( "load", function () {

		CANVAS_WIDTH = _textureCanvas.width = _sumCanvas.width = _brushesCanvas.width = _currentCanvas.width = _background.naturalWidth;
		CANVAS_HEIGHT = _textureCanvas.height = _sumCanvas.height = _brushesCanvas.height = _currentCanvas.height = _background.naturalWidth;

		_textureContext.drawImage( _background, 0, 0 );
		_texture.needsUpdate = true;

		}, false );

	}

	function cursorInitialize() {

		_scene = new THREE.Scene();
		_scene.background = null;

		_orthoCamera = new THREE.OrthographicCamera( _frustumSize * _aspect / - 2, _frustumSize * _aspect / 2, _frustumSize / 2, _frustumSize / - 2, 0, 10 );
		_orthoCamera.position.z = 50;
		_orthoCamera.lookAt( _scene.position );

		_cursorTexture = new THREE.Texture( undefined, THREE.UVMapping, THREE.MirroredRepeatWrapping, THREE.MirroredRepeatWrapping );
		var cursorMaterial = new THREE.MeshBasicMaterial( { map: _cursorTexture, transparent: true } );
		var cursorGeometry = new THREE.PlaneBufferGeometry( 1, 1, 1, 1 );

		_cursorMesh = new THREE.Mesh( cursorGeometry, cursorMaterial );
		_cursorMesh.position.copy( _orthoCamera.position );
		_cursorMesh.rotation.copy( _orthoCamera.rotation );
		_scene.add( _cursorMesh );

		_cursorCanvas = document.createElement( "canvas" );
		_cursorCanvas.width = _cursorCanvas.height = 128;
		_cursorContext = _cursorCanvas.getContext( "2d" );

		_cursorTexture.image = _cursorCanvas;

		scope.setBrushSize( _brushSize );

	}

	function bleedVertices( center, clip ) {

		var sub;

		sub = clip[0].clone().sub( center );
		clip[0] = center.clone().add( sub.normalize().multiplyScalar( clip[0].distanceTo( center ) * ( 1 + scope.bleed ) ) );

		sub = clip[1].clone().sub( center );
		clip[1] = center.clone().add( sub.normalize().multiplyScalar( clip[1].distanceTo( center ) * ( 1 + scope.bleed ) ) );

		sub = clip[2].clone().sub( center );
		clip[2] = center.clone().add( sub.normalize().multiplyScalar( clip[2].distanceTo( center ) * ( 1 + scope.bleed ) ) );

	}

	function faceClip( context, center, clip ) {

		if ( scope.enableBleed ) {
			bleedVertices( center, clip );
		}

		context.beginPath();
		context.moveTo( clip[0].x * CANVAS_WIDTH, clip[0].y * CANVAS_HEIGHT );
		context.lineTo( clip[1].x * CANVAS_WIDTH, clip[1].y * CANVAS_HEIGHT );
		context.lineTo( clip[2].x * CANVAS_WIDTH, clip[2].y * CANVAS_HEIGHT );
		context.closePath();
		context.clip();

	};

	function faceDraw( context, vectors, alpha ) {

		var length = vectors.length / 2;

		if ( context == _brushesContext ) {
			context.globalCompositeOperation = "destination-out";
			context.fillStyle = "rgba( 255, 255, 255," + Math.max(0.0, (1 - 1.5*scope.opacity) )+ ")";
		}
		else {
			context.fillStyle = "rgba( " + 255*scope.color.r + ", " + 255*scope.color.g + ", " + 255*scope.color.b + ", " + alpha*scope.opacity + ")";
		}

		context.beginPath();
		context.moveTo( vectors[length-1].x * CANVAS_WIDTH, vectors[length-1].y * CANVAS_HEIGHT );

		for (i = 0; i < length; i ++) {
			context.quadraticCurveTo(
				vectors[ length + i ].x * CANVAS_WIDTH, // cp1.x
				vectors[ length + i ].y * CANVAS_HEIGHT, // cp1.y
				vectors[ i ].x * CANVAS_WIDTH, // p2.x
				vectors[ i ].y * CANVAS_HEIGHT // p2.y
			);
		}

		context.fill();

	};

	function mergeBrushes() {

		_readyToMerge = false;

		_sumContext.drawImage( _brushesCanvas, 0, 0 );
		_brushesContext.clearRect( 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT );

	};

	function draw( faces ) {

		if ( ! _drawEnabled || ! faces ) return;

		faces.forEach( function( face ) {

			_currentContext.save();

			faceClip( _currentContext, face.center, face.clip );
			faceDraw( _currentContext, face.vectors, face.alpha.toFixed(2) );

			_currentContext.restore();

			_brushesContext.save();

			faceClip( _brushesContext, face.center, face.clip );
			faceDraw( _brushesContext, face.vectors, face.alpha.toFixed(2) );

			_brushesContext.restore();

		});

		_brushesContext.drawImage( _currentCanvas, 0, 0 )
		_currentContext.clearRect( 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT );

		_textureContext.drawImage( _background, 0, 0 );
		_textureContext.drawImage( _sumCanvas, 0, 0 );
		_textureContext.drawImage( _brushesCanvas, 0, 0 );

		_texture.needsUpdate = true;

	};

	// scene-functions
	function verticesReset( ) {
		var length;

		length = ( _geometry.isBufferGeometry ) ?
		_geometry.attributes.position.array.length / 3 :
		_geometry.vertices.length;

		_verticesDict = Array( length ).fill( undefined );
		_cameraPosition.copy( _camera.position );
		_cameraUpdated = false;
	};

	function getVertex( vertexID ) {

		if ( ! _verticesDict[ vertexID ] ) {

			var vertex = ( _geometry.isBufferGeometry ) ?
			new THREE.Vector3().fromArray( _geometry.attributes.position.array, vertexID * 3 ) :
			_geometry.vertices[ vertexID ].clone();

			_verticesDict[ vertexID ] = _mesh.localToWorld( vertex );

		}

		return _verticesDict[ vertexID ];

	}

	function getClipVertex( vertexID ) {

		return getVertex( vertexID ).clone().project( _camera ).sub( _reference );

	};

	function faceIntersectsClip( clip, face ) {

		var vA = getClipVertex( face.a );
		var vB = getClipVertex( face.b );
		var vC = getClipVertex( face.c );

		if ( clip.intersectsTriangle( new THREE.Triangle( vA, vB, vC ) ) )  return true;
		return false;

	};

	function getDirectionFromCamera( x, y, origin ) {

		var v1 = new THREE.Vector3();

		v1.set( _reference.x + x, _reference.y + y * _aspect, 0.5 );
		v1.unproject( _camera ).sub( origin );

		return v1.normalize();

	};

	function getDirections( directions, origin ) {

		var sign, x, y;

		for ( var i = 0; i < 4; i++ ) {

			sign = ( i < 2 ) ? 1 : -1;

			x = ( i % 2 ) * sign * _cursorUnits;
			y = ( ( i + 1 ) % 2) * sign * _cursorUnits;

			directions.push( getDirectionFromCamera( x, y, origin ) );

		}

		for ( var i = 0; i < 4; i++ ) {

			x = ( ( ( i % 3 ) == 0 ) ? -1 : 1 ) * _cursorUnits;
			y = ( ( i < 2 ) ? 1 : -1 ) * _cursorUnits;

			directions.push( getDirectionFromCamera( x, y, origin ) );

		}

		directions.push( getDirectionFromCamera( 0, 0, origin ) );

	};

	function projectDirection( ray, origin, dir, plane, vA, vB, vC, uvclip ) {

		ray.set( origin, dir );

		if ( ! ray.intersectsPlane( plane ) ) return undefined;

		// find brush projected point in world-space.
		point = ray.intersectPlane( plane, new THREE.Vector3() );

		// brush point in uv texture-space.
		return THREE.Triangle.getUV( point, vA, vB, vC, uvclip[0], uvclip[1], uvclip[2], new THREE.Vector2() );

	}

	function getBufferGeometryFace( index ) {

		let i = index * 3;

		let a = _geometry.index.getX( i );
		let b = _geometry.index.getX( i + 1 );
		let c = _geometry.index.getX( i + 2 );

		let vA = getVertex( a );
		let vB = getVertex( b );
		let vC = getVertex( c );

		var face = new THREE.Face3( a, b, c );
		THREE.Triangle.getNormal( vA, vB, vC, face.normal );

		return face;

	}

	function getDrawLocations( ) {

		var point, uv;
		var face, faceLength;
		var loc, deltaAngle;

		var locations = [];
		var intersects = [];
		var directions = [];
		var alpha = [];

		var vA, vB, vC;
		var ray = new THREE.Ray();
		var uv_a = new THREE.Vector2();
		var uv_b = new THREE.Vector2();
		var uv_c = new THREE.Vector2();
		var origin = new THREE.Vector3().setFromMatrixPosition( _camera.matrixWorld );

		// set clip-space.
		var min = new THREE.Vector3( - _cursorUnits, - _cursorUnits * _aspect, - 0.1 );
		var max = new THREE.Vector3( + _cursorUnits, + _cursorUnits * _aspect, + _camera.far );
		var clip = new THREE.Box3( min, max );

		// get brush vector directions from camera;
		getDirections( directions, origin );

		if ( _cameraUpdated ) verticesReset();

		facesLength = ( _geometry.isBufferGeometry ) ? _geometry.index.array.length / 3 : _geometry.faces.length;

		// get faces that intersect with mouse clip-space.
		for ( var i = 0; i < facesLength; i++ ) {

			face = ( _geometry.isBufferGeometry ) ? getBufferGeometryFace( i ) : _geometry.faces[i];

			deltaAngle = getDirectionFromCamera( 0, 0, origin ).dot( face.normal );

			// skip - if doesn't appear on camera
			if ( deltaAngle >= 0  )  continue;

			if ( faceIntersectsClip( clip, face ) )  {
				intersects.push( i );

				if ( scope.enableFalloff ) {
					var normalOffset = Math.acos( - deltaAngle ) - scope.falloff;
					var falloff = ( normalOffset <= 0 ) ? 1 : ( 1 - ( normalOffset  / ( Math.PI/2  - scope.falloff ) ) );
					alpha.push( falloff );
				}
				else {
					alpha.push( 1 );
				}

			}

		}

		// set draw locations for each intersecting face.
		for ( var i = 0; i < intersects.length; i++ ) {
			var uvclip = [];
			var vectors = [];

			if ( _geometry.isBufferGeometry ) {

				face = getBufferGeometryFace( intersects[i] );

				uv_a.fromBufferAttribute( _geometry.attributes.uv, face.a );
				uv_b.fromBufferAttribute( _geometry.attributes.uv, face.b );
				uv_c.fromBufferAttribute( _geometry.attributes.uv, face.c );

				_mesh.material.map.transformUv( uv_a );
				_mesh.material.map.transformUv( uv_b );
				_mesh.material.map.transformUv( uv_c );

				uvclip.push( uv_a.clone(), uv_b.clone(), uv_c.clone() );

			}
			else {

				face = _geometry.faces[ intersects[i] ];

				// vertices in uv texture-space.
				for ( var k = 0; k < 3; k++ ) {
					node = _geometry.faceVertexUvs[0][ intersects[i] ][k].clone();
					_mesh.material.map.transformUv( node );
					uvclip.push( node );
				}

			}

			vA = getVertex( face.a );
			vB = getVertex( face.b );
			vC = getVertex( face.c );

			plane = new THREE.Plane().setFromNormalAndCoplanarPoint( face.normal, vA );

			for ( var v = 0; v < 8; v++ ) {

				uv = projectDirection( ray, origin, directions[v], plane, vA, vB, vC, uvclip );

				if ( uv === undefined ) break;

				vectors.push( uv );

			}

			if ( vectors.length != 8 ) continue;

			uvCenter = projectDirection( ray, origin, directions[8], plane, vA, vB, vC, uvclip );

			loc = { vectors: vectors, clip: uvclip, alpha: alpha[i], center: uvCenter };

			// push to list of canvas draw locations.
			locations.push( loc );

		}

		return locations;

	};

	// mouse-functions
	function updateMouse( evt ) {

		var rect = _renderer.domElement.getBoundingClientRect();
		var array = [ ( evt.clientX - rect.left ) / rect.width, ( evt.clientY - rect.top ) / rect.height ];

		_reference.set( ( array[0] * 2 ) - 1, - ( array[1] * 2 ) + 1, 0 );

	};

	function updateCursor( ) {

		_cursorMesh.position.copy( _orthoCamera.position );
		_cursorMesh.translateX( _aspect * _reference.x * 50 );
		_cursorMesh.translateY( _reference.y * 50 );

	};

	// listener functions
	function onMouseMove( evt ) {

		updateMouse( evt );
		updateCursor();

	}

	function onMouseDown( evt ) {

		if ( evt.button != scope.DEFAULT_BUTTON ) return;

		_drawEnabled = true;

	}

	function onMouseUp( evt ) {

		if ( evt.button != scope.DEFAULT_BUTTON ) return;

		_drawEnabled = false;
		_readyToMerge = true;

	};

	function onMouseOut( evt ) {

		_drawEnabled = false;
		_readyToMerge = true;

	};

	// bind listeners
	_renderer.domElement.addEventListener( 'mousemove', onMouseMove, false );
	_renderer.domElement.addEventListener( 'mousedown', onMouseDown, false );
	_renderer.domElement.addEventListener( 'mouseup', onMouseUp, false );
	_renderer.domElement.addEventListener( 'mouseout', onMouseOut, false );

};
