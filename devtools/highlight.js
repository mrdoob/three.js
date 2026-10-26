// Draws the object hovered in the panel over the page's canvas: a box around anything with a geometry,
// and for a light where it is, where it shines and the frustum of a directional shadow

( function () {

	const utils = __THREE_DEVTOOLS__.utils;

	// The 12 edges of a box, as pairs of indices into its 8 corners
	const EDGES = [[ 0, 1 ], [ 1, 3 ], [ 3, 2 ], [ 2, 0 ], [ 4, 5 ], [ 5, 7 ], [ 7, 6 ], [ 6, 4 ], [ 0, 4 ], [ 1, 5 ], [ 2, 6 ], [ 3, 7 ]];

	const CIRCLE_SEGMENTS = 64;
	const MARKER_RADIUS = 4; // In pixels, around a light's position

	let overlay = null;
	let path = null;
	let object = null;
	let frame = null;

	function createOverlay() {

		overlay = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
		overlay.style.cssText = 'position: fixed; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none; z-index: 999999;';

		path = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );
		path.setAttribute( 'stroke', '#ffff00' );
		path.setAttribute( 'fill', 'none' );

		overlay.appendChild( path );
		document.documentElement.appendChild( overlay );

	}

	// --- Shapes, as lines and points in world space ---

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

	function getBoxCorners( box, matrix ) {

		const corners = [];

		for ( let i = 0; i < 8; i ++ ) {

			corners.push( box.min.clone().set( i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z ).applyMatrix4( matrix ) );

		}

		return corners;

	}

	// The corners of what a camera sees, in the order of a box's. Where the near and far planes land
	// in clip space depends on the renderer and the depth buffer, so it is measured.
	function getFrustumCorners( camera ) {

		const Vector3 = camera.position.constructor;
		const near = new Vector3( 0, 0, - camera.near ).applyMatrix4( camera.projectionMatrix ).z;
		const far = new Vector3( 0, 0, - camera.far ).applyMatrix4( camera.projectionMatrix ).z;
		const corners = [];

		for ( let i = 0; i < 8; i ++ ) {

			corners.push( new Vector3( i & 1 ? 1 : - 1, i & 2 ? 1 : - 1, i & 4 ? far : near ).unproject( camera ) );

		}

		return corners;

	}

	function addBox( lines, corners ) {

		for ( const [ a, b ] of EDGES ) lines.push( [ corners[ a ], corners[ b ] ] );

	}

	// A circle around a center, in the plane of two perpendicular unit vectors
	function addCircle( lines, center, u, v, radius ) {

		let previous = null;

		for ( let i = 0; i <= CIRCLE_SEGMENTS; i ++ ) {

			const angle = i / CIRCLE_SEGMENTS * Math.PI * 2;
			const point = center.clone().addScaledVector( u, Math.cos( angle ) * radius ).addScaledVector( v, Math.sin( angle ) * radius );

			if ( previous !== null ) lines.push( [ previous, point ] );
			previous = point;

		}

	}

	// The cameras a light's shadow map is rendered from: one per cascade for a sun
	function getShadowCameras( shadow ) {

		if ( shadow.isSunLightShadow !== true ) return [ shadow.camera ];

		const cameras = [];
		for ( let i = 0; shadow.getCamera( i ) !== undefined; i ++ ) cameras.push( shadow.getCamera( i ) );

		return cameras;

	}

	// The light's position and the way it shines: towards its target, along a cone, as far as it reaches, out of a
	// rectangle or within a box. Ambient light and light probes come from everywhere, so they have no shape.
	function getLightShape( light, renderer ) {

		if ( light.isAmbientLight || light.isLightProbe ) return { lines: [], points: [] };

		const Vector3 = light.position.constructor;
		const position = new Vector3().setFromMatrixPosition( light.matrixWorld );
		const lines = [];

		if ( light.isSpotLight ) {

			const target = new Vector3().setFromMatrixPosition( light.target.matrixWorld );
			const direction = target.clone().sub( position );
			const length = light.distance > 0 ? light.distance : direction.length();
			const radius = length * Math.tan( light.angle );
			const center = position.clone().addScaledVector( direction.normalize(), length );

			// Any two vectors across the direction will do for the circle
			const basis = light.matrixWorld.clone().lookAt( position, target, light.up );
			const u = new Vector3().setFromMatrixColumn( basis, 0 );
			const v = new Vector3().setFromMatrixColumn( basis, 1 );

			addCircle( lines, center, u, v, radius );

			for ( const [ a, b ] of [[ 1, 0 ], [ 0, 1 ], [ - 1, 0 ], [ 0, - 1 ]] ) {

				lines.push( [ position, center.clone().addScaledVector( u, a * radius ).addScaledVector( v, b * radius ) ] );

			}

		} else if ( light.isDirectionalLight ) {

			lines.push( [ position, new Vector3().setFromMatrixPosition( light.target.matrixWorld ) ] );

		} else if ( light.isHemisphereLight ) {

			// The sky shines from its position towards the origin
			lines.push( [ position, new Vector3() ] );

		} else if ( light.isPointLight ) {

			const axes = [ new Vector3( 1, 0, 0 ), new Vector3( 0, 1, 0 ), new Vector3( 0, 0, 1 ) ];

			if ( light.distance > 0 ) for ( const [ u, v ] of [[ 0, 1 ], [ 0, 2 ], [ 1, 2 ]] ) addCircle( lines, position, axes[ u ], axes[ v ], light.distance );

		} else if ( light.isRectAreaLight ) {

			// The renderer takes the light's rotation from its world matrix, not its scale
			const u = new Vector3().setFromMatrixColumn( light.matrixWorld, 0 ).normalize().multiplyScalar( light.width / 2 );
			const v = new Vector3().setFromMatrixColumn( light.matrixWorld, 1 ).normalize().multiplyScalar( light.height / 2 );
			const corners = [[ - 1, - 1 ], [ 1, - 1 ], [ 1, 1 ], [ - 1, 1 ]].map( ( [ a, b ] ) => position.clone().addScaledVector( u, a ).addScaledVector( v, b ) );

			corners.forEach( ( corner, i ) => lines.push( [ corner, corners[ ( i + 1 ) % 4 ] ] ) );

		} else if ( light.isLightProbeGrid && ! light.boundingBox.isEmpty() ) {

			// Already in world space
			addBox( lines, getBoxCorners( light.boundingBox, new light.matrixWorld.constructor() ) );

		}

		// The box a directional shadow map covers, placed by the renderer as it draws it. A spot light's
		// frustum follows its cone, and a point light's covers every direction.
		if ( light.castShadow && renderer.shadowMap.enabled && ( light.isDirectionalLight || light.isSunLight ) ) {

			for ( const camera of getShadowCameras( light.shadow ) ) addBox( lines, getFrustumCorners( camera ) );

		}

		// A sun's position is only the direction it shines from, so it shows its cascades alone
		return { lines: lines, points: light.isSunLight ? [] : [ position ] };

	}

	function getShape( object, renderer ) {

		if ( object.isLight ) return getLightShape( object, renderer );

		const lines = [];
		addBox( lines, getBoxCorners( getBoundingBox( object ), object.matrixWorld ) );

		return { lines: lines, points: [] };

	}

	// --- Drawing ---

	// A point through a Matrix4, from its column major elements, keeping w for clipping and the perspective divide
	function transform( elements, { x, y, z } ) {

		return [
			elements[ 0 ] * x + elements[ 4 ] * y + elements[ 8 ] * z + elements[ 12 ],
			elements[ 1 ] * x + elements[ 5 ] * y + elements[ 9 ] * z + elements[ 13 ],
			elements[ 2 ] * x + elements[ 6 ] * y + elements[ 10 ] * z + elements[ 14 ],
			elements[ 3 ] * x + elements[ 7 ] * y + elements[ 11 ] * z + elements[ 15 ]
		];

	}

	// The part of a line in front of the camera's near plane, in clip space, where w is the depth
	// in front of a perspective camera, and always 1 for an orthographic one
	function clip( a, b, near ) {

		const da = a[ 3 ] - near;
		const db = b[ 3 ] - near;

		if ( da < 0 && db < 0 ) return null;

		const t = da / ( da - db );
		const crossing = a.map( ( value, i ) => value + ( b[ i ] - value ) * t );

		return [ da < 0 ? crossing : a, db < 0 ? crossing : b ];

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

	// A clip space point on the page, as SVG path coordinates
	function toPage( [ x, y, , w ], area ) {

		return `${ area.left + ( x / w * 0.5 + 0.5 ) * area.width } ${ area.top + ( 0.5 - y / w * 0.5 ) * area.height }`;

	}

	// The object's shape as seen by every camera it is drawn with: an ArrayCamera draws one view per sub camera
	function draw( object, view ) {

		const shape = getShape( object, view.renderer );
		const cameras = view.camera.isArrayCamera ? view.camera.cameras : [ view.camera ];
		const r = MARKER_RADIUS;
		let d = '';

		for ( const camera of cameras ) {

			if ( object.layers.test( camera.layers ) === false ) continue;

			const area = getArea( view, camera );
			const elements = camera.projectionMatrix.clone().multiply( camera.matrixWorldInverse ).elements;
			const near = camera.isPerspectiveCamera ? camera.near : 0;

			for ( const [ a, b ] of shape.lines ) {

				const line = clip( transform( elements, a ), transform( elements, b ), near );
				if ( line !== null ) d += `M${ toPage( line[ 0 ], area ) }L${ toPage( line[ 1 ], area ) }`;

			}

			for ( const point of shape.points ) {

				const projected = transform( elements, point );
				if ( projected[ 3 ] > near ) d += `M${ toPage( projected, area ) }m${ - r } 0a${ r } ${ r } 0 1 0 ${ 2 * r } 0a${ r } ${ r } 0 1 0 ${ - 2 * r } 0`;

			}

		}

		return d;

	}

	function update() {

		frame = requestAnimationFrame( update );

		const view = object === null ? null : utils.getSceneView( object );

		path.setAttribute( 'd', view === null ? '' : draw( object, view ) );

	}

	function isVisible( object ) {

		for ( let parent = object; parent !== null; parent = parent.parent ) {

			if ( parent.visible === false ) return false;

		}

		return true;

	}

	function highlight( uuid ) {

		const target = utils.findObjectInScenes( uuid );

		// Helpers and hidden objects are left out, and only objects with a geometry, and lights, have a shape
		object = target !== null && ! target.type.includes( 'Helper' ) && ( target.geometry !== undefined || target.isLight ) && isVisible( target ) ? target : null;

		if ( overlay === null ) createOverlay();
		if ( frame === null ) update();

		overlay.style.display = '';

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
