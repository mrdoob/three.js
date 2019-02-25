import {
  CanvasTexture,
  Color,
  Fog,
  Group,
  IcosahedronBufferGeometry,
  ImageBitmapLoader,
  Mesh,
  MeshMatcapMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer
} from '../../../build/three.module.js';
var camera, scene, renderer, group;

function init( canvas, width, height, pixelRatio, path ) {

	camera = new PerspectiveCamera( 40, width / height, 1, 1000 );
	camera.position.z = 200;

	scene = new Scene();
	scene.fog = new Fog( 0x444466, 100, 400 );
	scene.background = new Color( 0x444466 );

	group = new Group();
	scene.add( group );

	// we don't use ImageLoader since it has a DOM dependency (HTML5 image element)

	var loader = new ImageBitmapLoader().setPath( path );
	loader.load( 'textures/matcaps/matcap-porcelain-white.jpg', function ( imageBitmap ) {

		var texture = new CanvasTexture( imageBitmap );

		var geometry = new IcosahedronBufferGeometry( 5, 3 );
		var materials = [
			new MeshMatcapMaterial( { color: 0xaa24df, matcap: texture } ),
			new MeshMatcapMaterial( { color: 0x605d90, matcap: texture } ),
			new MeshMatcapMaterial( { color: 0xe04a3f, matcap: texture } ),
			new MeshMatcapMaterial( { color: 0xe30456, matcap: texture } )
		];

		for ( var i = 0; i < 100; i ++ ) {

			var material = materials[ i % materials.length ];
			var mesh = new Mesh( geometry, material );
			mesh.position.x = random() * 200 - 100;
			mesh.position.y = random() * 200 - 100;
			mesh.position.z = random() * 200 - 100;
			mesh.scale.setScalar( random() + 1 );
			group.add( mesh );

		}

		renderer = new WebGLRenderer( { antialias: true, canvas: canvas } );
		renderer.setPixelRatio( pixelRatio );
		renderer.setSize( width, height, false );

		animate();

	} );

}

function animate() {

	// group.rotation.x = Date.now() / 4000;
	group.rotation.y = - Date.now() / 4000;

	renderer.render( scene, camera );

	if ( self.requestAnimationFrame ) {

		self.requestAnimationFrame( animate );

	} else {

		// Firefox

	}

}

// PRNG

var seed = 1;

function random() {

	var x = Math.sin( seed ++ ) * 10000;

	return x - Math.floor( x );

}

export {
  scene
};