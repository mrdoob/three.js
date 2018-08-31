/**
 * @author but0n / https://github.com/but0n
 */

THREE.ChromaticPass = function () {

	THREE.Pass.call( this );

	this.material = this.getVignettingMaterial();

	this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

	this.chromaticAberration = Number( 0 );

};

THREE.ChromaticPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.ChromaticPass,

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		this.material.uniforms[ "tDiffuse" ].value = readBuffer.texture;
		this.material.uniforms[ "uOffset" ].value = this.chromaticAberration/ 1000;
		this.material.uniforms[ "tSize" ].value.set( readBuffer.width, readBuffer.height );

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
				"uOffset": { value: null },
				"tSize":    { value: new THREE.Vector2( 256, 256 ) },
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
				uniform float uOffset;
				uniform vec2 tSize;

				void main() {
					vec2 uv = vUv * 2.0 - 1.0;
					float r = texture2D(tDiffuse, vUv + 1.0/tSize + uv * uOffset).r;
					float g = texture2D(tDiffuse, vUv).g;
					float b = texture2D(tDiffuse, vUv + 1.0/tSize - uv * uOffset).b;
					gl_FragColor = vec4(r, g, b, 1.0);
				}
				`
		} );

	},


} );
