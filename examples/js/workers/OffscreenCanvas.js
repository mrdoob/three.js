self.importScripts( '../../../build/three.js' );

self.onmessage = function ( message ) {

	var data = message.data;
	init( data.drawingSurface, data.width, data.height, data.pixelRatio );

};

var camera, scene, renderer, mesh, clock;

function createBoxMesh( size, material ) {

	var material = new THREE.MeshBasicMaterial( material );
	var geometry = new THREE.BoxBufferGeometry( size, size, size );
	return new THREE.Mesh( geometry, material );

}

function init( offscreen, width, height, pixelRatio ) {

	camera = new THREE.PerspectiveCamera( 70, width / height, 1, 1000 );
	camera.position.z = 400;

	scene = new THREE.Scene();

	clock = new THREE.Clock();

	// we don't use ImageLoader since it has a DOM dependency (HTML5 image element)

	var loader = new THREE.ImageBitmapLoader();

	loader.load( '../../textures/crate.gif', function ( imageBitmap ) {

		var texture = new THREE.CanvasTexture( imageBitmap );
		mesh = createBoxMesh( 200, { map: texture } );
		scene.add( mesh );

		animate();

	}, null, function () {

		// On error use color instead of texture.

		mesh = createBoxMesh( 200, { color: 0x00ff00 } );
		scene.add( mesh );

		animate();

	} );

	renderer = new THREE.WebGLRenderer( { antialias: true, canvas: offscreen } );
	renderer.setPixelRatio( pixelRatio );
	renderer.setSize( width, height, false );

}

function animate() {

	var delta = clock.getDelta();

	mesh.rotation.x += delta * 0.2;
	mesh.rotation.y += delta * 0.5;

	renderer.render( scene, camera );

	if ( self.requestAnimationFrame ) {
		self.requestAnimationFrame( animate );
	} else if ( renderer.context.commit ) {
		renderer.context.commit().then( animate );
	}

}
