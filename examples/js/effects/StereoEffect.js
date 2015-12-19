/**
 * @author alteredq / http://alteredqualia.com/
 * @authod mrdoob / http://mrdoob.com/
 * @authod arodic / http://aleksandarrodic.com/
 * @authod fonserbc / http://fonserbc.github.io/
*/

THREE.StereoEffect = function ( renderer ) {

	var _width, _height;

	// initialization

	renderer.autoClear = false;

	this.setSize = function ( width, height ) {

		_width = width / 2;
		_height = height;

		renderer.setSize( width, height );

	};

	this.render = function ( scene, camera ) {

		if ( camera instanceof THREE.StereoCamera === false ) {

			console.error( 'THREE.StereoCamera.render(): camera should now be an insteance of THREE.StereoCamera.' );
			return;

		}

		scene.updateMatrixWorld();

		if ( camera.parent === null ) camera.updateMatrixWorld();

		renderer.clear();
		renderer.setScissorTest( true );

		renderer.setScissor( 0, 0, _width, _height );
		renderer.setViewport( 0, 0, _width, _height );
		renderer.render( scene, camera.cameraL );

		renderer.setScissor( _width, 0, _width, _height );
		renderer.setViewport( _width, 0, _width, _height );
		renderer.render( scene, camera.cameraR );

		renderer.setScissorTest( false );

	};

};
