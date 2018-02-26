self.importScripts( '../../../build/three.js' );

self.onmessage = function ( message ) {

	var data = message.data;
	init( data.drawingSurface, data.width, data.height, data.pixelRatio );

};

var camera, scene, renderer, mesh, clock;

function init( offscreen, width, height, pixelRatio ) {

	camera = new THREE.PerspectiveCamera( 70, width / height, 1, 1000 );
	camera.position.z = 400;

	scene = new THREE.Scene();

	clock = new THREE.Clock();

	// we don't use ImageLoader since it has a DOM dependency (HTML5 image element)

	var loader = new THREE.ImageBitmapLoader();

	loader.load( '../../textures/crate.gif', function ( imageBitmap ) {

		var texture = new THREE.CanvasTexture( imageBitmap );
		var material = new THREE.MeshBasicMaterial( { map: texture } );

		var geometry = new THREE.BoxBufferGeometry( 200, 200, 200 );
		mesh = new THREE.Mesh( geometry, material );

		scene.add( mesh );

		animate();

	} );

	//

	renderer = new THREE.WebGLRenderer( { antialias: true, canvas: offscreen } );
	renderer.setPixelRatio( pixelRatio );
	renderer.setSize( width, height, false );

}

function animate() {

	var delta = clock.getDelta();

	mesh.rotation.x += delta * 0.2;
	mesh.rotation.y += delta * 0.5;

	renderer.render( scene, camera );

	renderer.context.commit().then( animate );

}
