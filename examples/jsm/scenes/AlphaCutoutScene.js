import {
	CanvasTexture, Color, DoubleSide, HemisphereLight, Mesh, MeshStandardMaterial,
	PlaneGeometry, RepeatWrapping, Scene, SRGBColorSpace
} from 'three';

// The same procedural coverage scene is used by the WebGL and WebGPU examples.
function createAlphaCutoutScene() {

	const scene = new Scene();
	scene.background = new Color( 0x30343b );
	scene.add( new HemisphereLight( 0xffffff, 0x777777, 3 ) );

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

	const solid = new MeshStandardMaterial( { color: 0x5c9ead, side: DoubleSide } );
	const cutouts = [
		new MeshStandardMaterial( { color: 0xd87d4a, map, alphaTest: 0.5, side: DoubleSide } ),
		new MeshStandardMaterial( { color: 0x80ad62, alphaMap, alphaTest: 0.5, side: DoubleSide } ),
		new MeshStandardMaterial( { color: 0xb191ce, map, alphaMap, opacity: 0.75, alphaTest: 0.5, side: DoubleSide } )
	];

	const wall = new Mesh( new PlaneGeometry( 11, 7 ), new MeshStandardMaterial( { color: 0xe4ddd2, side: DoubleSide } ) );
	wall.position.set( 0, 1.5, - 0.22 );
	scene.add( wall );

	const geometry = new PlaneGeometry( 2, 2, 2, 1 );
	const uv1 = geometry.attributes.uv.clone();
	for ( let i = 0; i < uv1.count; i ++ ) uv1.setXY( i, uv1.getY( i ), 1 - uv1.getX( i ) );
	geometry.setAttribute( 'uv1', uv1 );

	for ( let row = 0; row < 2; row ++ ) {

		for ( let column = 0; column < 3; column ++ ) {

			const panelGeometry = geometry.clone();
			let material = cutouts[ column ];
			if ( row === 1 ) {

				panelGeometry.addGroup( 0, 6, 0 );
				panelGeometry.addGroup( 6, 6, 1 );
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

	return { scene, cutouts, map, alphaMap };

}

export { createAlphaCutoutScene };
