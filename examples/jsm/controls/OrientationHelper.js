import {
	AmbientLight,
	BoxBufferGeometry,
	CanvasTexture,
	DirectionalLight,
	DoubleSide,
	EventDispatcher,
	Group,
	Mesh,
	MeshPhysicalMaterial,
	PerspectiveCamera,
	Raycaster,
	RingGeometry,
	Scene,
	Vector2,
	Vector3,
	WebGLRenderer
} from '../../../build/three.module.js';
import { OrbitControls } from '../controls/OrbitControls.js';

/**
 * Creates a THREE interactive "Cube" or Rotation Helper like those found in most of the editing programs.
 * @param {Object} camera An instance of the camera
 * @param {Object} controls An instance of OrbitControls
 * @param {Object} options An object with options
 * @param {Object} labels An object with the labels for the default cube's faces
 */
var OrientationHelper = function ( camera, controls, options, labels ) {

	var scope = this;

	var _options = Object.assign( {
		width: 100,
		height: 100,
		className: '',
		backgroundColor: 0xffffff,
		backgroundOpacity: 0,
		cameraFov: 50,
		cameraNear: 1,
		cameraFar: 1000,
		cameraDistance: 150,
		boxBackground: '#ddd',
		boxColor: '#222',
		boxCanvasSide: 128,
		boxFontSize: 28,
		boxFontFamily: 'Arial',
		model3D: null,
		addRing: true,
		addLights: true,
		addOrbitControls: true
	}, options );

	var _lbls = Object.assign( {
		px: 'East',
		nx: 'West',
		pz: 'South',
		nz: 'North',
		py: 'Above',
		ny: 'Below'
	}, labels );

	_options.labels = [ 'px', 'nx', 'py', 'ny', 'pz', 'nz' ].map( function ( id ) {

		return _lbls[ id ];

	} );

	var _enabled = true;
	var _visible = true;

	Object.defineProperty( scope, 'enabled', {

		get() {

			return _enabled;

		},

		set( v ) {

			_enabled = !! v;
			if ( scope._internalControls ) { scope._internalControls = _enabled; }
			scope.dispatchEvent( { type: 'enabled', value: _enabled } );

		}

	} );

	Object.defineProperty( scope, 'visible', {

		get() {

			return _visible;

		},

		set( v ) {

			_visible = !! v;
			scope._renderer.domElement.style.display = _visible ? 'initial' : 'none';

		}

	} );	

	Object.defineProperty( scope, 'scene', {

		get() {

			return scope._scene;

		},

	} );

	Object.defineProperty( scope, 'domElement', {

		get() {

			return scope._renderer.domElement;

		}

	} );

	var cameraPosition = camera.position;
	var controlsTarget = controls && controls.target || new Vector3();

	var _vector3Helper = new Vector3(),
		_mouseVectorWebGL = new Vector2(),
		_mouseVectorScreen = new Vector2(),
		_viewportClientRect = null,
		gizmo;

	function init() {

		scope._scene = new Scene();
		scope._scene.name = 'orientation-helper-scene';

		scope._renderer = new WebGLRenderer( { antialias: true, alpha: _options.backgroundOpacity < 1 } );
		scope._renderer.setClearColor( _options.backgroundColor, _options.backgroundOpacity );
		scope._renderer.setPixelRatio( window.devicePixelRatio );
		scope._renderer.setSize( _options.width, _options.height );
		scope._renderer.domElement.className = 'orientation-helper-scene ' + _options.className;

		scope._camera = new PerspectiveCamera( _options.cameraFov, _options.width / _options.height, _options.cameraNear, _options.cameraFar );

		scope._raycaster = new Raycaster();
		scope._raycaster.layers.enable( 1 );

		scope._camera.position.copy( _calcCameraPosition() );

		if ( ! controls ) {

			console.warn( 'No controls provided. Will use 0,0,0 as target.' );

		} else {

			controls.addEventListener( 'change', function () {

				update();

			} );

		}

		// Adds OrbitControls to this scene, to be able to control the rotation of the parent scene from this component.
		if ( _options.addOrbitControls ) {

			var _internalControls = new OrbitControls( scope._camera, scope._renderer.domElement );

			_internalControls.enableDamping = true;
			_internalControls.dampingFactor = 0.2;
			_internalControls.minPolarAngle = 0;
			_internalControls.maxPolarAngle = Math.PI;
			_internalControls.maxDistance = _options.cameraDistance;
			_internalControls.minDistance = _options.cameraDistance;
			_internalControls.enableKeys = false;
			_internalControls.enablePan = false;
			_internalControls.enableZoom = false;
			_internalControls.screenSpacePanning = true;

			_internalControls.addEventListener( 'change', function () {

				scope.dispatchEvent( {

					type: 'change',
					direction: scope._camera.position.clone().normalize()
	
				} );
			
			} );

			scope._internalControls = _internalControls;

		}

		gizmo = new Group();
		gizmo.name = "orientation-helper-gizmo";
		scope._scene.add( gizmo );

		setGizmo( _options.model3D, _options.addRing );		

		if ( _options.addLights ) {

			scope._scene.add( _addLights() );

		}

	}

	function activate() {

		var domElement = scope._renderer.domElement;

		scope._mouseDown = function ( ev ) {

			_mouseVectorScreen.set( ev.clientX, ev.clientY );

		};

		scope._mouseUp = function ( ev ) {

			if ( ! _enabled ) {

				return;

			}

			var isDragging = Math.abs( _mouseVectorScreen.x - ev.clientX ) > 5
				|| Math.abs( _mouseVectorScreen.y !== ev.clientY ) > 5;

			if ( isDragging ) {

				return;

			}

			if ( ! _viewportClientRect ) {

				scope._onResize();

			}

			_mouseVectorWebGL.x = ( ( ev.clientX - _viewportClientRect.left ) / _viewportClientRect.width ) * 2 - 1;
			_mouseVectorWebGL.y = ( ( ev.clientY - _viewportClientRect.top ) / _viewportClientRect.height ) * 2 - 1;

			scope._raycaster.setFromCamera( _mouseVectorWebGL, scope._camera );

			var intersects = scope._raycaster.intersectObjects( gizmo.children, false );

			if ( ! intersects.length ) {

				return;

			}

			var normal = new Vector3()
				.copy( intersects[ 0 ].face.normal )
				.normalize();

			scope.dispatchEvent( {

				type: 'click',
				normal: normal,
				direction: scope._camera.position.clone().normalize()

			} );

		};

		scope._onResize = function () {

			_viewportClientRect = domElement.getBoundingClientRect();

		};

		domElement.addEventListener( 'pointerdown', scope._mouseDown );
		domElement.addEventListener( 'pointerup', scope._mouseUp );
		domElement.addEventListener( 'resize', scope._onResize );

	}

	function deactivate() {

		var domElement = scope._renderer.domElement;

		domElement.removeEventListener( 'pointerdown', scope._mouseDown );
		domElement.removeEventListener( 'pointerup', scope._mouseUp );
		domElement.removeEventListener( 'resize', scope._onResize );

	}

	function _calcCameraPosition() {

		return _vector3Helper.subVectors( cameraPosition, controlsTarget )
			.normalize()
			.multiplyScalar( _options.cameraDistance );

	}

	function setGizmo( model3D, addRing ) {

		// Remove old gizmo objects
		for ( var i = gizmo.children.length; i >= 0; i -= 1 ) {
			gizmo.remove( gizmo.children[ i ] );
		}

		// Default: Cube
		if ( ! model3D ) {

			var cube = _createCube( 1 );
			cube.layers.enable( 1 );
			gizmo.add( cube );

		} else {

			// Before adding it to this OrientationHelper:
			// 1. the model3D should be positioned at 0,0,0 (or around) and scaled down to fit the camera fov.
			// 2. If clickable, set its relevant layers to 1: model3D.layers.set( 1 );
			gizmo.add( model3D );

		}

		if ( addRing ) {

			var ring = _createCircle();
			ring.layers.set( 0 );
			gizmo.add( ring );	

		}

		scope._renderer.render( scope._scene, scope._camera );

		function _createCube( opacity ) {

			var side = _options.boxCanvasSide,
				sideHalf = side * 0.5,
				font = _options.boxFontSize + 'px ' + _options.boxFontFamily;
	
			var opacityOptions = opacity < 1 ? { transparent: true, opacity: opacity } : {};
	
			function _createCanvasSide( background, color, text ) {
	
				var cnv = document.createElement( 'canvas' ),
					ctx = cnv.getContext( '2d' ),
					dpi = Math.round( window.devicePixelRatio );
	
				cnv.width = side * dpi;
				cnv.height = side * dpi;
				ctx.scale( dpi, dpi );
	
				ctx.beginPath();
				ctx.fillStyle = background;
				ctx.rect( 0, 0, side, side );
				ctx.fill();
				ctx.fillStyle = color;
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.font = font;
				ctx.fillText( text, sideHalf, sideHalf );
	
				var texture = new CanvasTexture( cnv );
				var material = new MeshPhysicalMaterial( Object.assign( { map: texture }, opacityOptions ) );
				material.name = 'mat-' + text;
				material.needsUpdate = true;
	
				return material;
	
			}
	
			var materials = _options.labels.map(
	
				function ( label ) {
	
					return _createCanvasSide( _options.boxBackground, _options.boxColor, label );
	
				}
	
			);
	
			var cube = new Mesh( new BoxBufferGeometry( 50, 50, 50, 1, 1, 1 ), materials );
			cube.name = 'orientation-helper-cube';
			
			cube.geometry.computeBoundingBox();
			cube.updateMatrixWorld();
			cube.matrixAutoUpdate = false;
	
			return cube;
	
		}
	
		function _createCircle() {
	
			var geometry = new RingGeometry( 50, 60, 32 );
			var material = new MeshPhysicalMaterial( {
				color: 0xdddddd,
				side: DoubleSide,
				transparent: true,
				opacity: 0.45
			} );
	
			var circle = new Mesh( geometry, material );
			circle.name = 'orientation-helper-ring';
			circle.rotation.x = Math.PI / 2;
			circle.position.y = - 20;
			circle.updateMatrixWorld();
			circle.matrixAutoUpdate = false;
	
			return circle;
	
		}
	}

	function _addLights() {

		var lightsGroup = new Group();
		lightsGroup.name = 'orientation-helper-lights';

		var light = new DirectionalLight( 0xffe7b2, 0.15 );
		light.position.set( 500, 300, - 500 );
		lightsGroup.add( light );

		light = new DirectionalLight( 0xfff5aa, 0.15 );
		light.position.set( - 500, - 300, 500 );
		lightsGroup.add( light );

		lightsGroup.add( new AmbientLight( '#fff', 0.95 ) );

		return lightsGroup;

	}

	function update() {

		scope._camera.position.copy( _calcCameraPosition() );
		scope._camera.lookAt( 0, 0, 0 );
		scope._renderer.render( scope._scene, scope._camera );

	}

	function takePicture( imageFormat = 'image/png' ) {

		return new Promise( function ( resolve ) {

			scope._renderer.render( scope._scene, scope._camera );
			resolve( scope._renderer.domElement.toDataURL( imageFormat ) );

		} );

	}

	scope.update = update;
	scope.takePicture = takePicture;
	scope.setGizmo = setGizmo;
	scope.activate = activate;
	scope.deactivate = deactivate;
	scope.dispose = deactivate;

	//Start
	init();
	activate();
	update();

};

OrientationHelper.prototype = Object.create( EventDispatcher.prototype );
OrientationHelper.prototype.constructor = OrientationHelper;

export { OrientationHelper };
