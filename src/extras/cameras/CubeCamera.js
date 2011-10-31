/**
 * Camera for rendering cube maps
 *	- renders scene into axis-aligned cube
 *
 * @author alteredq / http://alteredqualia.com/
 */

THREE.CubeCamera = function ( near, far, heightOffset, cubeResolution ) {

	this.heightOffset = heightOffset;
	this.position = new THREE.Vector3( 0, heightOffset, 0 );

	// cameras

	var fov = 90, aspect = 1;

	this.cameraPX = new THREE.PerspectiveCamera( fov, aspect, near, far );
	this.cameraNX = new THREE.PerspectiveCamera( fov, aspect, near, far );

	this.cameraPY = new THREE.PerspectiveCamera( fov, aspect, near, far );
	this.cameraNY = new THREE.PerspectiveCamera( fov, aspect, near, far );

	this.cameraPZ = new THREE.PerspectiveCamera( fov, aspect, near, far );
	this.cameraNZ = new THREE.PerspectiveCamera( fov, aspect, near, far );

	this.cameraPX.position = this.position;
	this.cameraNX.position = this.position;

	this.cameraPY.position = this.position;
	this.cameraNY.position = this.position;

	this.cameraPZ.position = this.position;
	this.cameraNZ.position = this.position;

	this.cameraPX.up.set( 0, -1, 0 );
	this.cameraNX.up.set( 0, -1, 0 );

	this.cameraPY.up.set( 0, 0, 1 );
	this.cameraNY.up.set( 0, 0, -1 );

	this.cameraPZ.up.set( 0, -1, 0 );
	this.cameraNZ.up.set( 0, -1, 0 );

	// targets

	this.targetPX = new THREE.Vector3( 0, 0, 0 );
	this.targetNX = new THREE.Vector3( 0, 0, 0 );

	this.targetPY = new THREE.Vector3( 0, 0, 0 );
	this.targetNY = new THREE.Vector3( 0, 0, 0 );

	this.targetPZ = new THREE.Vector3( 0, 0, 0 );
	this.targetNZ = new THREE.Vector3( 0, 0, 0 );

	// cube render target

	this.renderTarget = new THREE.WebGLRenderTargetCube( cubeResolution, cubeResolution, { format: THREE.RGBFormat, magFilter: THREE.LinearFilter, minFilter: THREE.LinearFilter } );

	this.updatePosition = function ( position ) {

		this.position.copy( position );

		this.position.y += this.heightOffset;

		this.targetPX.copy( this.position );
		this.targetNX.copy( this.position );

		this.targetPY.copy( this.position );
		this.targetNY.copy( this.position );

		this.targetPZ.copy( this.position );
		this.targetNZ.copy( this.position );

		this.targetPX.x += 1;
		this.targetNX.x -= 1;

		this.targetPY.y += 1;
		this.targetNY.y -= 1;

		this.targetPZ.z += 1;
		this.targetNZ.z -= 1;

		this.cameraPX.lookAt( this.targetPX );
		this.cameraNX.lookAt( this.targetNX );

		this.cameraPY.lookAt( this.targetPY );
		this.cameraNY.lookAt( this.targetNY );

		this.cameraPZ.lookAt( this.targetPZ );
		this.cameraNZ.lookAt( this.targetNZ );

	};

	this.updateCubeMap = function ( renderer, scene ) {

		var cubeTarget = this.renderTarget;

		cubeTarget.activeCubeFace = 0;
		renderer.render( scene, this.cameraPX, cubeTarget );

		cubeTarget.activeCubeFace = 1;
		renderer.render( scene, this.cameraNX, cubeTarget );

		cubeTarget.activeCubeFace = 2;
		renderer.render( scene, this.cameraPY, cubeTarget );

		cubeTarget.activeCubeFace = 3;
		renderer.render( scene, this.cameraNY, cubeTarget );

		cubeTarget.activeCubeFace = 4;
		renderer.render( scene, this.cameraPZ, cubeTarget );

		cubeTarget.activeCubeFace = 5;
		renderer.render( scene, this.cameraNZ, cubeTarget );

	};

};