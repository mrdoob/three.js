/**
 * Camera for rendering cube maps
 *	- renders scene into axis-aligned cube
 *
 * @author alteredq / http://alteredqualia.com/
 */

THREE.CubeCamera = function ( near, far, cubeResolution ) {

	this.position = new THREE.Vector3();

	var fov = 90, aspect = 1;

	var cameraPX = new THREE.PerspectiveCamera( fov, aspect, near, far );
	var cameraNX = new THREE.PerspectiveCamera( fov, aspect, near, far );

	var cameraPY = new THREE.PerspectiveCamera( fov, aspect, near, far );
	var cameraNY = new THREE.PerspectiveCamera( fov, aspect, near, far );

	var cameraPZ = new THREE.PerspectiveCamera( fov, aspect, near, far );
	var cameraNZ = new THREE.PerspectiveCamera( fov, aspect, near, far );

	cameraPX.position = this.position;
	cameraPX.up.set( 0, -1, 0 );
	cameraPX.lookAt( new THREE.Vector3( 1, 0, 0 ) );

	cameraNX.position = this.position;
	cameraNX.up.set( 0, -1, 0 );
	cameraNX.lookAt( new THREE.Vector3( -1, 0, 0 ) );

	cameraPY.position = this.position;
	cameraPY.up.set( 0, 0, 1 );
	cameraPY.lookAt( new THREE.Vector3( 0, 1, 0 ) );

	cameraNY.position = this.position;
	cameraNY.up.set( 0, 0, -1 );
	cameraNY.lookAt( new THREE.Vector3( 0, -1, 0 ) );

	cameraPZ.position = this.position;
	cameraPZ.up.set( 0, -1, 0 );
	cameraPZ.lookAt( new THREE.Vector3( 0, 0, 1 ) );

	cameraNZ.position = this.position;
	cameraNZ.up.set( 0, -1, 0 );
	cameraNZ.lookAt( new THREE.Vector3( 0, 0, -1 ) );

	// cube render target

	this.renderTarget = new THREE.WebGLRenderTargetCube( cubeResolution, cubeResolution, { format: THREE.RGBFormat, magFilter: THREE.LinearFilter, minFilter: THREE.LinearFilter } );

	this.updateCubeMap = function ( renderer, scene ) {

		var cubeTarget = this.renderTarget;

		var oldGenerateMipmaps = cubeTarget.generateMipmaps;

		cubeTarget.generateMipmaps = false;

		cubeTarget.activeCubeFace = 0;
		renderer.render( scene, cameraPX, cubeTarget );

		cubeTarget.activeCubeFace = 1;
		renderer.render( scene, cameraNX, cubeTarget );

		cubeTarget.activeCubeFace = 2;
		renderer.render( scene, cameraPY, cubeTarget );

		cubeTarget.activeCubeFace = 3;
		renderer.render( scene, cameraNY, cubeTarget );

		cubeTarget.activeCubeFace = 4;
		renderer.render( scene, cameraPZ, cubeTarget );

		cubeTarget.generateMipmaps = oldGenerateMipmaps;

		cubeTarget.activeCubeFace = 5;
		renderer.render( scene, cameraNZ, cubeTarget );

	};

};
