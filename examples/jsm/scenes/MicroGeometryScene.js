import {
	CanvasTexture, Color, DataTexture, DataUtils, DirectionalLight, DoubleSide, HalfFloatType, HemisphereLight, LinearFilter, Mesh, MeshStandardMaterial,
	PlaneGeometry, RepeatWrapping, RedFormat, Scene, SRGBColorSpace, TextureLoader
} from 'three';

// Shared procedural microgeometry for the WebGL and WebGPU AO examples.
async function createMicroGeometryScene() {

	const scene = new Scene();
	scene.background = new Color( 0x30343b );
	scene.add( new HemisphereLight( 0xffffff, 0x777777, 2 ) );
	const light = new DirectionalLight( 0xffffff, 2 );
	light.position.set( - 3, 5, 6 );
	scene.add( light );

	const canvas = document.createElement( 'canvas' );
	canvas.width = canvas.height = 128;
	const context = canvas.getContext( '2d' );
	context.fillStyle = '#ffffff';
	context.fillRect( 0, 0, 128, 128 );
	context.globalCompositeOperation = 'destination-out';
	for ( let y = 16; y < 128; y += 32 ) {

		for ( let x = 16; x < 128; x += 32 ) {

			context.beginPath();
			context.arc( x, y, 11, 0, Math.PI * 2 );
			context.fill();

		}

	}

	const map = new CanvasTexture( canvas );
	map.colorSpace = SRGBColorSpace;
	map.wrapS = map.wrapT = RepeatWrapping;

	const maskCanvas = document.createElement( 'canvas' );
	maskCanvas.width = maskCanvas.height = 128;
	const maskContext = maskCanvas.getContext( '2d' );
	maskContext.fillStyle = '#000000';
	maskContext.fillRect( 0, 0, 128, 128 );
	maskContext.fillStyle = '#ffffff';
	for ( let x = 0; x < 128; x += 32 ) maskContext.fillRect( x, 0, 12, 128 );

	const alphaMap = new CanvasTexture( maskCanvas );
	alphaMap.wrapS = alphaMap.wrapT = RepeatWrapping;
	alphaMap.channel = 1;
	alphaMap.repeat.set( 1.5, 2 );
	alphaMap.offset.set( 0.12, 0.08 );
	alphaMap.center.set( 0.5, 0.5 );
	alphaMap.rotation = 0.3;

	// Reuse the TAA example's brick color texture, its matching bump map,
	// and the checkerboard normal map from the mirror/refraction examples.
	const loader = new TextureLoader();
	const [ wallMap, bumpMap, normalMap ] = await Promise.all( [
		loader.loadAsync( 'textures/brick_diffuse.jpg' ),
		loader.loadAsync( 'textures/brick_bump.jpg' ),
		loader.loadAsync( 'textures/floors/FloorsCheckerboard_S_Normal.jpg' )
	] );
	wallMap.colorSpace = SRGBColorSpace;
	wallMap.wrapS = wallMap.wrapT = RepeatWrapping;
	wallMap.repeat.set( 2, 2 );
	bumpMap.wrapS = bumpMap.wrapT = RepeatWrapping;
	bumpMap.repeat.set( 2, 2 );
	normalMap.wrapS = normalMap.wrapT = RepeatWrapping;
	normalMap.repeat.set( 1, 1 );

	// A traveling wave displaces the tessellated blue material.
	const size = 128;
	const waveHeight = 0.5;
	const heights = new Uint16Array( size * size );
	const waveNormals = new Uint8Array( size * size * 4 );
	function fillWave( time ) {

		for ( let y = 0; y < size; y ++ ) {

			for ( let x = 0; x < size; x ++ ) {

				const phase = ( x + y * 0.5 ) / size * Math.PI * 4 - time;
				const height = DataUtils.toHalfFloat( 0.5 + 0.5 * Math.sin( phase ) );
				const texel = y * size + x;
				heights[ texel ] = height;
				const i = texel * 4;

				// Analytic tangent-space normal for a 2 x 2 plane displaced by the wave.
				const nx = - waveHeight * Math.PI * Math.cos( phase );
				const ny = nx * 0.5;
				const length = Math.sqrt( nx * nx + ny * ny + 1 );
				waveNormals[ i ] = Math.round( ( nx / length * 0.5 + 0.5 ) * 255 );
				waveNormals[ i + 1 ] = Math.round( ( ny / length * 0.5 + 0.5 ) * 255 );
				waveNormals[ i + 2 ] = Math.round( ( 1 / length * 0.5 + 0.5 ) * 255 );
				waveNormals[ i + 3 ] = 255;

			}

		}

	}

	fillWave( 0 );

	const displacementMap = new DataTexture( heights, size, size, RedFormat, HalfFloatType );
	displacementMap.wrapS = displacementMap.wrapT = RepeatWrapping;
	displacementMap.minFilter = displacementMap.magFilter = LinearFilter;
	displacementMap.needsUpdate = true;
	const waveNormalMap = new DataTexture( waveNormals, size, size );
	waveNormalMap.wrapS = waveNormalMap.wrapT = RepeatWrapping;
	waveNormalMap.minFilter = waveNormalMap.magFilter = LinearFilter;
	waveNormalMap.needsUpdate = true;
	const solid = new MeshStandardMaterial( {
		color: 0x5c9ead, side: DoubleSide, normalMap: waveNormalMap,
		displacementMap, displacementScale: waveHeight, displacementBias: - waveHeight
	} );

	const cutouts = [
		new MeshStandardMaterial( { color: 0xd87d4a, map, normalMap, alphaTest: 0.5, side: DoubleSide } ),
		new MeshStandardMaterial( { color: 0x80ad62, alphaMap, alphaTest: 0.5, side: DoubleSide } ),
		new MeshStandardMaterial( { color: 0xb191ce, map, alphaMap, opacity: 0.75, alphaTest: 0.5, side: DoubleSide } )
	];

	cutouts[ 0 ].normalScale.setScalar( 1 );

	const wall = new Mesh( new PlaneGeometry( 11, 7 ), new MeshStandardMaterial( { map: wallMap, bumpMap, bumpScale: 2, side: DoubleSide } ) );
	wall.position.set( 0, 1.5, - 0.22 );
	scene.add( wall );

	const geometry = new PlaneGeometry( 2, 2, 2, 1 );
	const displacedGeometry = new PlaneGeometry( 2, 2, 64, 64 );
	for ( const plane of [ geometry, displacedGeometry ] ) {

		const uv1 = plane.attributes.uv.clone();
		for ( let i = 0; i < uv1.count; i ++ ) uv1.setXY( i, uv1.getY( i ), 1 - uv1.getX( i ) );
		plane.setAttribute( 'uv1', uv1 );

	}

	for ( let row = 0; row < 2; row ++ ) {

		for ( let column = 0; column < 3; column ++ ) {

			const panelGeometry = ( row === 1 ? displacedGeometry : geometry ).clone();
			let material = cutouts[ column ];
			if ( row === 1 ) {

				// Reorder triangles so each half is one contiguous material group.
				const { widthSegments, heightSegments } = panelGeometry.parameters;
				const indices = [];
				for ( let half = 0; half < 2; half ++ ) {

					for ( let y = 0; y < heightSegments; y ++ ) {

						for ( let x = half * widthSegments / 2; x < ( half + 1 ) * widthSegments / 2; x ++ ) {

							const start = ( y * widthSegments + x ) * 6;
							for ( let i = 0; i < 6; i ++ ) indices.push( panelGeometry.index.getX( start + i ) );

						}

					}

				}

				panelGeometry.setIndex( indices );
				panelGeometry.addGroup( 0, indices.length / 2, 0 );
				panelGeometry.addGroup( indices.length / 2, indices.length / 2, 1 );
				material = [ solid, material ];

			}

			const panel = new Mesh( panelGeometry, material );
			panel.position.set( ( column - 1 ) * 2.8, 2.8 - row * 2.6, 0 );
			// The second row is viewed from the back to exercise double-sided coverage.
			if ( row === 1 ) panel.rotation.y = Math.PI;
			scene.add( panel );

		}

	}

	// Repeated materials should share cached overrides and shader programs.
	for ( let i = 0; i < 12; i ++ ) {

		const panel = new Mesh( geometry, cutouts[ i % 3 ] );
		panel.scale.setScalar( 0.18 );
		panel.position.set( ( i - 5.5 ) * 0.7, - 1.4, 0 );
		scene.add( panel );

	}

	function update( time ) {

		// Updating height data animates the same displacement in both renderers.
		fillWave( time );
		displacementMap.needsUpdate = true;
		waveNormalMap.needsUpdate = true;

	}

	return { scene, cutouts, update };

}

export { createMicroGeometryScene };
