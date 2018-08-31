/**
 * @author but0n / https://github.com/but0n
 */

THREE.VignettePass = function () {

	THREE.Pass.call( this );

	this.material = this.getVignettingMaterial();

	this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

	this.vignetting = Number( 0.0 );
	this.hardness = Number( 0 );

};

THREE.VignettePass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.VignettePass,

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		this.material.uniforms[ "tDiffuse" ].value = readBuffer.texture;
		this.material.uniforms[ "uVignetting" ].value = 1.0 / ( 1.0 - this.vignetting ) - 1.0;
		this.material.uniforms[ "uHardness" ].value = 100/(100-this.hardness);

		this.quad.material = this.material;

		if ( this.renderToScreen ) {

			renderer.render( this.scene, this.camera );

		} else {

			renderer.render( this.scene, this.camera, writeBuffer, this.clear );

		}

	},

	getVignettingMaterial: function () {
		return new THREE.ShaderMaterial( {

			defines: {
			},

			uniforms: {
				"tDiffuse": { value: null },
				"uVignetting": { value: null },
				"uHardness": { value: null }
			},

			vertexShader:
				`
				varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}
				`,

			fragmentShader:
				`
				varying vec2 vUv;
				uniform sampler2D tDiffuse;
				uniform float uVignetting;
				uniform float uHardness;

				void main() {
					vec2 uv = vUv * 2.0 - 1.0;
					float mask = 1.0 - dot(uv, uv) * uVignetting;
					mask = clamp(0.5 + (mask - 0.5) * uHardness, 0.0, 1.0);
					vec4 color = texture2D(tDiffuse, vUv);
					gl_FragColor = mask * color;
				}
				`
		} );

	},


} );
