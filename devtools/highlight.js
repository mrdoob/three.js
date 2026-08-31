// Draws a box around the object hovered in the panel, over the page's canvas

( function () {

	const utils = __THREE_DEVTOOLS__.utils;

	// The 12 edges of a box, as pairs of indices into its 8 corners
	const EDGES = [[ 0, 1 ], [ 1, 3 ], [ 3, 2 ], [ 2, 0 ], [ 4, 5 ], [ 5, 7 ], [ 7, 6 ], [ 6, 4 ], [ 0, 4 ], [ 1, 5 ], [ 2, 6 ], [ 3, 7 ]];

	let overlay = null;
	let object = null;
	let frame = null;

	function createOverlay() {

		overlay = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
		overlay.style.cssText = 'position: fixed; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none; z-index: 999999;';
		document.documentElement.appendChild( overlay );

	}

	function createLine() {

		const line = document.createElementNS( 'http://www.w3.org/2000/svg', 'line' );
		line.setAttribute( 'stroke', '#ffff00' );
		overlay.appendChild( line );

	}

	// A point through a Matrix4, from its column major elements, keeping w for the perspective divide
	function transform( elements, point ) {

		const [ x, y, z ] = point;

		return [
			elements[ 0 ] * x + elements[ 4 ] * y + elements[ 8 ] * z + elements[ 12 ],
			elements[ 1 ] * x + elements[ 5 ] * y + elements[ 9 ] * z + elements[ 13 ],
			elements[ 2 ] * x + elements[ 6 ] * y + elements[ 10 ] * z + elements[ 14 ],
			elements[ 3 ] * x + elements[ 7 ] * y + elements[ 11 ] * z + elements[ 15 ]
		];

	}

	// A skinned, instanced or batched mesh keeps its own box, since it is drawn in a pose
	// or at positions its geometry alone knows nothing about
	function getBoundingBox( object ) {

		if ( object.computeBoundingBox !== undefined ) {

			object.computeBoundingBox();
			return object.boundingBox;

		}

		const geometry = object.geometry;
		if ( geometry.boundingBox === null ) geometry.computeBoundingBox();

		return geometry.boundingBox;

	}

	// The part of the page a camera draws into. A sub camera of an ArrayCamera carries its viewport in
	// canvas pixels, any other draws into the renderer's viewport in logical pixels, or fills the canvas
	// when the scene reaches it through a texture. GL viewports are measured from the bottom left corner.
	function getArea( view, camera ) {

		const canvas = view.renderer.domElement;
		const rect = canvas.getBoundingClientRect();
		const viewport = camera.viewport !== undefined ? camera.viewport.toArray() : view.viewport?.map( value => value * view.renderer.getPixelRatio() );

		if ( viewport === undefined ) return rect;

		const [ x, y, width, height ] = viewport;
		const scaleX = rect.width / canvas.width;
		const scaleY = rect.height / canvas.height;

		return { left: rect.left + x * scaleX, top: rect.bottom - ( y + height ) * scaleY, width: width * scaleX, height: height * scaleY };

	}

	// The corners of the object's bounding box, projected onto the area the camera draws into.
	// A corner behind the camera has no place on screen, so it comes back as null.
	function getCorners( object, camera, rect ) {

		const box = getBoundingBox( object );
		const corners = [];

		for ( let i = 0; i < 8; i ++ ) {

			const local = [ i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z ];
			const world = transform( object.matrixWorld.elements, local );
			const eye = transform( camera.matrixWorldInverse.elements, world );
			const [ x, y, , w ] = transform( camera.projectionMatrix.elements, eye );

			corners.push( w > 0 ? [ rect.left + ( x / w * 0.5 + 0.5 ) * rect.width, rect.top + ( 0.5 - y / w * 0.5 ) * rect.height ] : null );

		}

		// An object scaled to nothing, or too far away to cover a pixel, has no box worth drawing
		const onScreen = corners.filter( corner => corner !== null );
		const spread = ( axis ) => Math.max( ...onScreen.map( corner => corner[ axis ] ) ) - Math.min( ...onScreen.map( corner => corner[ axis ] ) );

		if ( onScreen.length === 0 || ( spread( 0 ) < 1 && spread( 1 ) < 1 ) ) return null;

		return corners;

	}

	// A box for every camera the object is drawn with: an ArrayCamera draws one view per sub camera
	function getBoxes( object, view ) {

		const cameras = view.camera.isArrayCamera ? view.camera.cameras : [ view.camera ];

		return cameras
			.filter( camera => object.layers.test( camera.layers ) )
			.map( camera => getCorners( object, camera, getArea( view, camera ) ) )
			.filter( corners => corners !== null );

	}

	function update() {

		frame = requestAnimationFrame( update );

		const view = object === null ? null : utils.getSceneView( object );
		const boxes = view === null ? [] : getBoxes( object, view );
		const lines = overlay.children;

		while ( lines.length < boxes.length * EDGES.length ) createLine();

		let drawn = 0;

		for ( let i = 0; i < lines.length; i ++ ) {

			const corners = boxes[ Math.floor( i / EDGES.length ) ];
			const [ a, b ] = EDGES[ i % EDGES.length ];
			const from = corners === undefined ? null : corners[ a ];
			const to = corners === undefined ? null : corners[ b ];
			const hidden = from === null || to === null;

			lines[ i ].style.display = hidden ? 'none' : '';
			if ( hidden ) continue;

			lines[ i ].setAttribute( 'x1', from[ 0 ] );
			lines[ i ].setAttribute( 'y1', from[ 1 ] );
			lines[ i ].setAttribute( 'x2', to[ 0 ] );
			lines[ i ].setAttribute( 'y2', to[ 1 ] );
			drawn ++;

		}

		overlay.style.display = drawn === 0 ? 'none' : '';

	}

	function isVisible( object ) {

		for ( let parent = object; parent !== null; parent = parent.parent ) {

			if ( parent.visible === false ) return false;

		}

		return true;

	}

	function highlight( uuid ) {

		const target = utils.findObjectInScenes( uuid );

		// Helpers, hidden objects and objects without geometry have no box to draw
		object = target !== null && ! target.type.includes( 'Helper' ) && target.geometry !== undefined && isVisible( target ) ? target : null;

		if ( overlay === null ) createOverlay();
		if ( frame === null ) update();

	}

	function unhighlight() {

		object = null;
		cancelAnimationFrame( frame );
		frame = null;

		if ( overlay !== null ) overlay.style.display = 'none';

	}

	// bridge.js calls these when the panel asks
	Object.assign( utils, { highlight, unhighlight } );

} )();
