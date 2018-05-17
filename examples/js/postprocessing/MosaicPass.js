/**
 * @author HypnosNova / https://github.com/HypnosNova/Nova
 */

THREE.MosaicPass = function ( tScaleX, tScaleY, vec1, vec2 ) {

	THREE.Pass.call( this );

	if ( THREE.MosaicShader === undefined )
		console.error( "THREE.MosaicPass relies on THREE.MosaicShader" );

	var shader = THREE.MosaicShader;

	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	this.uniforms[ "tScaleX" ].value = tScaleX || 0.5;
	this.uniforms[ "tScaleY" ].value = tScaleY || 0.5;

	this.uniforms[ "vector1" ].value = vec1 || new THREE.Vector2( 0.0 , 0.0 );
	this.uniforms[ "vector2" ].value = vec2 || new THREE.Vector2( 1 , 1 );

	this.material = new THREE.ShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader

	} );

	this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.quad.frustumCulled = false; // Avoid getting clipped
	this.scene.add( this.quad );

};

THREE.MosaicPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.MosaicPass,

	render: function ( renderer, writeBuffer, readBuffer ) {

		this.uniforms[ "tDiffuse" ].value = readBuffer.texture;

		this.quad.material = this.material;

		if ( this.renderToScreen ) {

			renderer.render( this.scene, this.camera );

		} else {

			renderer.render( this.scene, this.camera, writeBuffer, this.clear );

		}

	}

} );
