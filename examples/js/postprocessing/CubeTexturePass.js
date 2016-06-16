/**
 * @author bhouston / http://clara.io/
 */

THREE.CubeTexturePass = function ( scene, camera ) {

	THREE.Pass.call( this );

	this.scene = scene;
	this.camera = camera;

	this.cubeShader = THREE.ShaderLib[ 'cube' ];
	this.cubeMesh = new THREE.Mesh(
		new THREE.BoxBufferGeometry( 5, 5, 5 ),
		new THREE.ShaderMaterial( {
			uniforms: this.cubeShader.uniforms,
			vertexShader: this.cubeShader.vertexShader,
			fragmentShader: this.cubeShader.fragmentShader,
			depthTest: false,
			depthWrite: false,
			side: THREE.BackSide
		} )
	);

	this.envMap = null;

	this.cubeScene = new THREE.Scene();
	this.cubeCamera = new THREE.PerspectiveCamera();
	this.cubeScene.add( this.cubeMesh );

};

THREE.CubeTexturePass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.CubeTexturePass,

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		this.cubeCamera.projectionMatrix.copy( this.camera.projectionMatrix );
		this.cubeCamera.matrixWorld.extractRotation( this.camera.matrixWorld );
		this.cubeCamera.matrixWorldInverse.getInverse( this.cubeCamera.matrixWorld );

		this.cubeMesh.material.uniforms[ "tCube" ].value = this.envMap;
		this.cubeMesh.modelViewMatrix.multiplyMatrices( this.cubeCamera.matrixWorldInverse, this.cubeCamera.matrixWorld );

		renderer.render( this.cubeScene, this.cubeCamera, this.renderToScreen ? null : writeBuffer, this.clear );

	}

} );
