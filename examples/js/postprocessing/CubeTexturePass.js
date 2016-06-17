/**
 * @author bhouston / http://clara.io/
 */

THREE.CubeTexturePass = function ( scene, camera, envMap, opacity ) {

	THREE.Pass.call( this );

	this.scene = scene;
	this.camera = camera;

	this.needsSwap = false;

	this.cubeMaterial = new THREE.MeshCubeMaterial();

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

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		var oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;

		this.cubeCamera.projectionMatrix.copy( this.camera.projectionMatrix );
		this.cubeCamera.quaternion.setFromRotationMatrix( this.camera.matrixWorld );

		if( this.cubeMaterial.envMap != this.envMap ) {
			this.cubeMaterial.envMap = this.envMap;
			this.cubeMaterial.needsUpdate = true;
		}
		this.cubeMaterial.envMapIntensity = this.envMapIntensity;
		this.cubeMaterial.roughness = this.roughness;
		this.cubeMaterial.opacity = this.opacity;
		this.cubeMaterial.transparent = ( this.opacity < 1.0 );
	
		renderer.render( this.cubeScene, this.cubeCamera, this.renderToScreen ? null : readBuffer, this.clear );

		renderer.autoClear = oldAutoClear;

	}

} );
