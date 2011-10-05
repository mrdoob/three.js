/**
 * Camera for rendering cube maps
 *	- renders scene into axis-aligned cube
 *
 * @author alteredq / http://alteredqualia.com/
 */

THREE.CubeCamera = function ( near, far, height, resolution ) {

	var fov = 90, aspect = 1;

	this.cameraPX = new THREE.PerspectiveCamera( fov, aspect, near, far );
	this.cameraNX = new THREE.PerspectiveCamera( fov, aspect, near, far );
	this.cameraPY = new THREE.PerspectiveCamera( fov, aspect, near, far );
	this.cameraNY = new THREE.PerspectiveCamera( fov, aspect, near, far );
	this.cameraPZ = new THREE.PerspectiveCamera( fov, aspect, near, far );
	this.cameraNZ = new THREE.PerspectiveCamera( fov, aspect, near, far );

	this.cameraPXTarget = new THREE.Vector3( 0, 0, 0 );
	this.cameraNXTarget = new THREE.Vector3( 0, 0, 0 );
	this.cameraPYTarget = new THREE.Vector3( 0, 0, 0 );
	this.cameraNYTarget = new THREE.Vector3( 0, 0, 0 );
	this.cameraPZTarget = new THREE.Vector3( 0, 0, 0 );
	this.cameraNZTarget = new THREE.Vector3( 0, 0, 0 );

	this.height = height;
	this.position = new THREE.Vector3( 0, height, 0 );

	this.cameraPX.position = this.position;
	this.cameraNX.position = this.position;
	this.cameraPY.position = this.position;
	this.cameraNY.position = this.position;
	this.cameraPZ.position = this.position;
	this.cameraNZ.position = this.position;

	this.cameraPY.up.set( 0, 0, 1 );
	this.cameraPZ.up.set( 0, -1, 0 );
	this.cameraNZ.up.set( 0, -1, 0 );

	this.renderTarget = new THREE.WebGLRenderTargetCube( resolution, resolution, { format: THREE.RGBFormat, magFilter: THREE.LinearFilter, minFilter: THREE.LinearFilter } );

	this.updatePosition = function ( position ) {

		this.position.x = position.x;
		this.position.z = position.z;

		this.cameraPXTarget.add( this.position, new THREE.Vector3( -1,  0,  0 ) );
		this.cameraNXTarget.add( this.position, new THREE.Vector3(  1,  0,  0 ) );

		this.cameraPYTarget.add( this.position, new THREE.Vector3(  0,  1,  0 ) );
		this.cameraNYTarget.add( this.position, new THREE.Vector3(  0, -1,  0 ) );

		this.cameraPZTarget.add( this.position, new THREE.Vector3(  0,  0,  1 ) );
		this.cameraNZTarget.add( this.position, new THREE.Vector3(  0,  0, -1 ) );

		this.cameraPX.lookAt( this.cameraPXTarget );
		this.cameraNX.lookAt( this.cameraNXTarget );

		this.cameraPY.lookAt( this.cameraPYTarget );
		this.cameraNY.lookAt( this.cameraNYTarget );

		this.cameraPZ.lookAt( this.cameraPZTarget );
		this.cameraNZ.lookAt( this.cameraNZTarget );

	};

	this.updateCubeMap = function ( renderer, scene ) {

		var cubeTarget = this.renderTarget;

		renderer.setFaceCulling( "back", "cw" );

		scene.scale.y = -1;
		scene.position.y = 2 * this.height;
		scene.updateMatrix();

		cubeTarget.activeCubeFace = 0;
		renderer.render( scene, this.cameraPX, cubeTarget );

		cubeTarget.activeCubeFace = 1;
		renderer.render( scene, this.cameraNX, cubeTarget );

		scene.scale.y = 1;
		scene.position.y = 0;
		scene.updateMatrix();

		scene.scale.x = -1;
		scene.updateMatrix();

		cubeTarget.activeCubeFace = 2;
		renderer.render( scene, this.cameraPY, cubeTarget );

		scene.scale.x = 1;
		scene.updateMatrix();

		renderer.setFaceCulling( "back", "ccw" );

		cubeTarget.activeCubeFace = 3;
		renderer.render( scene, this.cameraNY, cubeTarget );

		scene.scale.x = -1;
		scene.updateMatrix();

		renderer.setFaceCulling( "back", "cw" );

		cubeTarget.activeCubeFace = 4;
		renderer.render( scene, this.cameraPZ, cubeTarget );

		cubeTarget.activeCubeFace = 5;
		renderer.render( scene, this.cameraNZ, cubeTarget );

		scene.scale.x = 1;
		scene.updateMatrix();

		renderer.setFaceCulling( "back", "ccw" );

	};

};

