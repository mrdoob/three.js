/**
 * @author bhouston / http://clara.io/
 */

THREE.CubeTexturePass = function ( camera, envMap, opacity ) {

	THREE.Pass.call( this );

	this.camera = camera;

	this.needsSwap = false;

	this.cubeShader = THREE.ShaderLib[ 'cube' ];
	this.cubeMesh = new THREE.Mesh(
		new THREE.BoxBufferGeometry( 10, 10, 10 ),
		new THREE.ShaderMaterial( {
			uniforms: this.cubeShader.uniforms,
			vertexShader: this.cubeShader.vertexShader,
			fragmentShader: this.cubeShader.fragmentShader,
			depthTest: false,
			depthWrite: false,
			side: THREE.BackSide
		} )
	);

	this.envMap = envMap;
	this.opacity = ( opacity !== undefined ) ? opacity : 1.0;

	this.cubeScene = new THREE.Scene();
	this.cubeCamera = new THREE.PerspectiveCamera();
	this.cubeScene.add( this.cubeMesh );

};

THREE.CubeTexturePass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.CubeTexturePass,

	render: function ( renderer, writeBuffer, readBuffer, deltaTime, maskActive ) {

		var oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;

		this.cubeCamera.projectionMatrix.copy( this.camera.projectionMatrix );
		this.cubeCamera.quaternion.setFromRotationMatrix( this.camera.matrixWorld );

		this.cubeMesh.material.uniforms[ "tCube" ].value = this.envMap;
		this.cubeMesh.material.uniforms[ "opacity" ].value = this.opacity;
		this.cubeMesh.material.transparent = ( this.opacity < 1.0 );

		renderer.render( this.cubeScene, this.cubeCamera, this.renderToScreen ? null : readBuffer, this.clear );

		renderer.autoClear = oldAutoClear;

	}

} );
