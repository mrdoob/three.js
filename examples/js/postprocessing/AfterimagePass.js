/**
 * @author HypnosNova / https://www.threejs.org.cn/gallery/
 */

THREE.AfterimagePass = function ( damp ) {

	THREE.Pass.call( this );

	if ( THREE.AfterimageShader === undefined )
		console.error( "THREE.AfterimagePass relies on THREE.AfterimageShader" );

	this.shader = THREE.AfterimageShader;

	this.uniforms = THREE.UniformsUtils.clone( this.shader.uniforms );

	this.uniforms[ "damp" ].value = damp !== undefined ? damp : 0.96;

	this.textureComp = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, {

		minFilter: THREE.LinearFilter,
		magFilter: THREE.NearestFilter,
		format: THREE.RGBAFormat

	} );

	this.textureOld = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, {

		minFilter: THREE.LinearFilter,
		magFilter: THREE.NearestFilter,
		format: THREE.RGBAFormat

	} );

	this.shaderMaterial = new THREE.ShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: this.shader.vertexShader,
		fragmentShader: this.shader.fragmentShader

	} );

	this.sceneComp = new THREE.Scene();
	this.scene = new THREE.Scene();

	this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
	this.camera.position.z = 1;

	var geometry = new THREE.PlaneBufferGeometry( 2, 2 );

	this.quadComp = new THREE.Mesh( geometry, this.shaderMaterial );
	this.sceneComp.add( this.quadComp );

	var material = new THREE.MeshBasicMaterial( { 
		map: this.textureComp.texture
	} );

	var quadScreen = new THREE.Mesh( geometry, material );
	this.scene.add( quadScreen );

};

THREE.AfterimagePass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.AfterimagePass,

	render: function ( renderer, writeBuffer, readBuffer ) {

		this.uniforms[ "tOld" ].value = this.textureOld.texture;
		this.uniforms[ "tNew" ].value = readBuffer.texture;

		this.quadComp.material = this.shaderMaterial;

		renderer.setRenderTarget( this.textureComp );
		renderer.render( this.sceneComp, this.camera );

		renderer.setRenderTarget( this.textureOld );
		renderer.render( this.scene, this.camera );

		if ( this.renderToScreen ) {

			renderer.setRenderTarget( null );
			renderer.render( this.scene, this.camera );

		} else {

			renderer.setRenderTarget( writeBuffer );

			if ( this.clear ) renderer.clear();

			renderer.render( this.scene, this.camera );

		}

	}

} );
