/**
 * @author bhouston / http://clara.io/
 * @author Oletus / http://oletus.fi/
 */

THREE.CubeTexturePass2 = function ( camera, envMap, opacity ) {

	THREE.Pass2.call( this );

	this.colorBufferConfig = new THREE.IntermediateBufferConfig();
	this.colorBufferConfig.clear = true;
	this.colorBufferConfig.isInput = true;

	this.bufferConfigs = [ this.colorBufferConfig ];

	this.camera = camera;

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

THREE.CubeTexturePass2.prototype = Object.assign( Object.create( THREE.Pass2.prototype ), {

	constructor: THREE.CubeTexturePass2,

	render: function ( renderer, buffers, deltaTime, maskActive ) {

		var colorBuffer = buffers[0];

		this.cubeCamera.projectionMatrix.copy( this.camera.projectionMatrix );
		this.cubeCamera.quaternion.setFromRotationMatrix( this.camera.matrixWorld );

		this.cubeMesh.material.uniforms[ "tCube" ].value = this.envMap;
		this.cubeMesh.material.uniforms[ "opacity" ].value = this.opacity;
		this.cubeMesh.material.transparent = ( this.opacity < 1.0 );

		THREE.Pass2.renderWithClear( renderer, this.cubeScene, this.cubeCamera, colorBuffer, this.colorBufferConfig.clear );

	}

} );
