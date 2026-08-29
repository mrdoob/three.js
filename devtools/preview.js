// Renders an expanded object with its own material, using a renderer created from the page's own three.js

( function () {

	const SIZE = 160;
	const FOV = 40;
	const utils = __THREE_DEVTOOLS__.utils;

	let renderer = null;
	let ready = null;
	let scene = null;

	// The three.js base class of an instance, found right below the root class that defines rootMethod:
	// Mesh below Object3D (traverse) for a SkinnedMesh, Scene below Object3D for a page's own scene class
	function getBaseClass( instance, rootMethod ) {

		let prototype = Object.getPrototypeOf( instance );

		while ( ! Object.hasOwn( Object.getPrototypeOf( prototype ), rootMethod ) ) prototype = Object.getPrototypeOf( prototype );

		return prototype.constructor;

	}

	// The class of an instance that defines a method: InstancedMesh for setMatrixAt, LineSegments or Line for computeLineDistances
	function getClass( instance, method ) {

		let prototype = Object.getPrototypeOf( instance );

		while ( ! Object.hasOwn( prototype, method ) ) prototype = Object.getPrototypeOf( prototype );

		return prototype.constructor;

	}

	function setup( view ) {

		renderer = utils.unobserved( () => new view.renderer.constructor( { canvas: document.createElement( 'canvas' ), alpha: true, antialias: true } ) );
		renderer.setPixelRatio( 2 );
		renderer.setSize( SIZE, SIZE );

		// Scene itself, not a page subclass, since addLights derives Object3D from this class
		scene = utils.unobserved( () => new ( getBaseClass( view.scene, 'traverse' ) )() );

		// WebGPURenderer initializes asynchronously, the first preview waits for it
		ready = renderer.init ? renderer.init() : null;

	}

	// Studio lighting of our own, duck-typed since the page may not have light classes to borrow.
	// WebGL identifies lights by type, WebGPU by class, so there the page's own lights are cloned instead.
	function addLights( root ) {

		if ( renderer.isWebGLRenderer ) {

			const Object3D = Object.getPrototypeOf( scene.constructor );
			const key = Object.assign( new Object3D(), { isLight: true, isDirectionalLight: true, type: 'DirectionalLight', color: { r: 1, g: 1, b: 1 }, intensity: 3, target: new Object3D() } );
			const fill = Object.assign( new Object3D(), { isLight: true, isHemisphereLight: true, type: 'HemisphereLight', color: { r: 1, g: 1, b: 1 }, groundColor: { r: 0.3, g: 0.3, b: 0.3 }, intensity: 1 } );
			key.position.set( 1, 2, 3 );
			fill.position.set( 0, 1, 0 );
			scene.add( key, fill );

		} else {

			root.traverse( ( child ) => {

				if ( child.isLight ) scene.add( child.clone() );

			} );

		}

		// A render target texture (PMREM) can't be shared with another renderer
		scene.environment = root.environment && ! root.environment.isRenderTargetTexture ? root.environment : null;
		scene.environmentIntensity = root.environmentIntensity;

	}

	// Frame the object from a three quarter view and return the rendered image. The page's camera is
	// pointed at it for this one render and put back afterwards. Its matrices are written directly,
	// so none of its own settings, lens and zoom included, can reframe the preview.
	function snapshot( object, camera, center, radius ) {

		const Vector3 = center.constructor;
		const distance = radius / Math.sin( FOV * Math.PI / 360 ) * 1.1;
		const eye = new Vector3( 1, 0.6, 1.5 ).normalize().multiplyScalar( distance ).add( center );
		const near = distance / 100;
		const half = near * Math.tan( FOV * Math.PI / 360 );

		const saved = [ camera.projectionMatrix.clone(), camera.matrixWorld.clone(), camera.matrixWorldInverse.clone() ];
		const autoUpdate = camera.matrixWorldAutoUpdate;
		const isArrayCamera = camera.isArrayCamera;

		camera.projectionMatrix.makePerspective( - half, half, half, - half, near, distance * 10, renderer.coordinateSystem );
		camera.matrixWorld.lookAt( eye, center, new Vector3( 0, 1, 0 ) ).setPosition( eye );
		camera.matrixWorldInverse.copy( camera.matrixWorld ).invert();

		// The renderer recomputes the world matrix of a camera that has no parent
		camera.matrixWorldAutoUpdate = false;

		// An XR camera draws one view per eye, and a preview is a single square view
		if ( isArrayCamera ) camera.isArrayCamera = false;

		scene.add( object );

		try {

			renderer.render( scene, camera );

		} finally {

			scene.remove( object );

			camera.projectionMatrix.copy( saved[ 0 ] );
			camera.matrixWorld.copy( saved[ 1 ] );
			camera.matrixWorldInverse.copy( saved[ 2 ] );
			camera.matrixWorldAutoUpdate = autoUpdate;
			if ( isArrayCamera ) camera.isArrayCamera = true;

		}

		return renderer.domElement.toDataURL();

	}

	// A plain three.js object of the object's kind, so a page subclass's constructor and the object's own
	// transform stay out of the way. An InstancedMesh keeps a single instance at the origin, so a material
	// written for instancing still compiles. Skinning and batching are left out, the geometry previews well enough.
	function createPreviewObject( object ) {

		if ( object.isInstancedMesh ) return new ( getClass( object, 'setMatrixAt' ) )( object.geometry, object.material, 1 );

		const Class = object.isLine ? getClass( object, 'computeLineDistances' ) : getBaseClass( object, 'traverse' );

		return new Class( object.geometry, object.material );

	}

	utils.renderPreview = async function ( object ) {

		// Only meshes, lines and points have something to preview
		if ( ! object.isMesh && ! object.isLine && ! object.isPoints ) return null;

		// A ShaderMaterial shares its uniforms with the page's renderer, which wires its light uniforms
		// into them, so drawing it with another renderer breaks the page
		if ( [].concat( object.material ).some( material => material.isShaderMaterial ) ) return null;

		// The scene has to have been drawn once, so its renderer and camera are known
		const view = utils.getSceneView( object );
		if ( view === null ) return null;

		try {

			if ( renderer === null ) setup( view );
			await ready;

			renderer.toneMapping = view.renderer.toneMapping;
			renderer.toneMappingExposure = view.renderer.toneMappingExposure;
			renderer.outputColorSpace = view.renderer.outputColorSpace;

			scene.clear();
			addLights( view.scene );

			const geometry = object.geometry;
			if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

			return snapshot( createPreviewObject( object ), view.camera, geometry.boundingSphere.center, geometry.boundingSphere.radius );

		} catch ( error ) {

			// A material the page's renderer can draw is not always one another renderer can
			console.warn( 'DevTools: Preview failed:', error );
			return null;

		}

	};

} )();
