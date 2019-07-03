/**
 * @author bhouston / http://clara.io/
 */

THREE.CubeTexturePass = function ( camera, envMap, opacity ) {

	THREE.Pass.call( this );

	this.camera = camera;

	this.needsSwap = false;

	this.cubeMaterial = new THREE.SkyboxMaterial();

	this.cubeMesh = new THREE.Mesh(
		new THREE.BoxBufferGeometry( 10, 10, 10 ),
		this.cubeMaterial
	);

	this.envMap = envMap;
	this.envMapIntensity = 1.0;
	this.opacity = ( opacity !== undefined ) ? opacity : 1.0;
	this.roughness = 0.0;

	this.cubeScene = new THREE.Scene();
	this.cubeCamera = new THREE.PerspectiveCamera();
	this.cubeScene.add( this.cubeMesh );

};

THREE.CubeTexturePass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.CubeTexturePass,

	render: function ( renderer, writeBuffer, readBuffer/*, deltaTime, maskActive*/ ) {

		var camera = this.camera;

		var oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;

		this.cubeCamera.projectionMatrix.copy( camera.projectionMatrix );
		this.cubeCamera.near = 0.01;
		this.cubeCamera.far = 20;
		this.cubeCamera.aspect = camera.aspect;
		this.cubeCamera.updateProjectionMatrix();
		this.cubeCamera.quaternion.setFromRotationMatrix( camera.matrixWorld );
		if( this.cubeMaterial.envMap != this.envMap ) {
			this.cubeMaterial.envMap = this.envMap;
			this.cubeMaterial.needsUpdate = true;
		}
		this.cubeMaterial.envMapIntensity = this.envMapIntensity;
		this.cubeMaterial.roughness = this.roughness;
		this.cubeMaterial.opacity = this.opacity;
		this.cubeMaterial.transparent = ( this.opacity < 1.0 );

		renderer.setRenderTarget(this.renderToScreen ? null : readBuffer);
		if(this.clear) renderer.clear();
		renderer.render( this.cubeScene, this.cubeCamera);

		renderer.autoClear = oldAutoClear;

	}

} );
