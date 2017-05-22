/**
 * @author takahirox / http://github.com/takahirox
 */

/**
 * @params {VRDisplay} vrDisplay
 * @params {THREE.ShaderPass} passLeft - ShaderPass instance for left eye sight.
 *                                       passLeft is also used for non presenting mode.
 * @params {THREE.ShaderPass} passRight - ShaderPass instance for right eye sight.
 *                                        If this isn't specified, passLeft will
 *                                        also be used for right eye sight.
 */
THREE.ShaderVRPass = function ( vrDisplay, passLeft, passRight ) {

	THREE.Pass.call( this );

	this.vrDisplay = vrDisplay;

	// using the parameter of passLeft so far
	this.enabled = passLeft.enabled;
	this.renderToScreen = passLeft.renderToScreen;

	this.passes = [];
	this.passes.push( passLeft );
	if ( passRight !== undefined ) this.passes.push( passRight );

	// material for separating
	var shader = THREE.CopyShader;
	this.materialSeparate = new THREE.ShaderMaterial( {
		defines: shader.defines || {},
		uniforms: THREE.UniformsUtils.clone( shader.uniforms ),
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader
	} );

	// material for combining
	var shader = THREE.VRCombineShader;
	this.materialCombine = new THREE.ShaderMaterial( {
		defines: shader.defines || {},
		uniforms: THREE.UniformsUtils.clone( shader.uniforms ),
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader
	} );

	this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this.scene = new THREE.Scene();

	var parameters = {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		format: THREE.RGBAFormat,
		stencilBuffer: false
	};

	// expects width and height will be updated later from EffectComposer.addPass()
	var renderTarget = new THREE.WebGLRenderTarget( 1, 1, parameters );

	// for separating
	this.renderTargetsFirst = [];
	this.renderTargetsFirst[ 0 ] = renderTarget;
	this.renderTargetsFirst[ 0 ].texture.name = "ShaderVRPass.firstLeft";
	this.renderTargetsFirst[ 1 ] = renderTarget.clone();
	this.renderTargetsFirst[ 1 ].texture.name = "ShaderVRPass.firstRight";

	// for applying pass
	this.renderTargetsSecond = [];
	this.renderTargetsSecond[ 0 ] = renderTarget.clone();
	this.renderTargetsSecond[ 0 ].texture.name = "ShaderVRPass.secondLeft";
	this.renderTargetsSecond[ 1 ] = renderTarget.clone();
	this.renderTargetsSecond[ 1 ].texture.name = "ShaderVRPass.secondRight";

	//
	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.quad.frustumCulled = false; // Avoid getting clipped
	this.scene.add( this.quad );

};

THREE.ShaderVRPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.ShaderVRPass,

	update: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		for ( var i = 0, il = this.passes.length; i < il; i ++ ) {

			this.passes[ i ].update( renderer, writeBuffer, readBuffer, delta, maskActive );

		}

	},

	setSize: function ( width, height ) {

		for ( var i = 0; i < 2; i ++ ) {

			// TODO: use the parameter of vrDisplay.getLayers()?
			this.renderTargetsFirst[ i ].setSize( width * 0.5, height );
			this.renderTargetsSecond[ i ].setSize( width * 0.5, height );

		}

		for ( var i = 0, il = this.passes.length; i < il; i ++ ) {

			this.passes[ i ].setSize( width, height );

		}

	},

	render: function( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		if ( this.vrDisplay.isPresenting ) {

			this.materialSeparate.uniforms.tDiffuse.value = readBuffer.texture;
			this.quad.material = this.materialSeparate;

			// 1. exports left/right half from the original

			for ( var i = 0; i < 2; i ++ ) {

				if ( i === 0 ) {

					this.updateUvsForLeft();

				} else {

					this.updateUvsForRight();

				}

				renderer.render( this.scene, this.camera, this.renderTargetsFirst[ i ] );

			}

			// 2. apply pass to the left/right half

			for ( var i = 0; i < 2; i ++ ) {

				var pass = this.passes.length >= 2 ? this.passes[ i ] : this.passes[ 0 ];

				var currentRenderToScreen = pass.renderToScreen;
				pass.renderToScreen = false;
				pass.render( renderer, this.renderTargetsSecond[ i ], this.renderTargetsFirst[ i ], delta, maskActive );
				pass.renderToScreen = currentRenderToScreen;

				// seems like this's necessary?
				if ( pass.needsSwap === true ) {

					var tmp = this.renderTargetsFirst[ i ];
					this.renderTargetsFirst[ i ] = this.renderTargetsSecond[ i ];
					this.renderTargetsSecond[ i ] = tmp;

				}

			}

			// 3. Combine left and right

			this.resetUvs();

			this.materialCombine.uniforms.left.value = this.renderTargetsFirst[ 0 ].texture;
			this.materialCombine.uniforms.right.value = this.renderTargetsFirst[ 1 ].texture;
			this.quad.material = this.materialCombine;

			if ( this.renderToScreen ) {

				renderer.render( this.scene, this.camera );

				this.vrDisplay.submitFrame();

			} else {

				renderer.render( this.scene, this.camera, writeBuffer, this.clear );

			}

			this.needsSwap = true;

		} else {

			// using passLeft for non presenting mode
			var pass = this.passes[ 0 ];
			var currentRenderToScreen = pass.renderToScreen;
			pass.renderToScreen = this.renderToScreen;
			pass.render( renderer, writeBuffer, readBuffer, delta, maskActive );
			pass.renderToScreen = currentRenderToScreen;

			this.needsSwap = pass.needsSwap;

		}

	},

	updateUvsForLeft: function () {

		var uv = this.quad.geometry.attributes.uv;
		var array = uv.array;

		// TODO: these parameters should be from vrDisplay.getLayers() maybe?

		array[ 0 ] = 0.0;
		array[ 2 ] = 0.5;
		array[ 4 ] = 0.0;
		array[ 6 ] = 0.5;

		uv.needsUpdate = true;

	},

	updateUvsForRight: function () {

		var uv = this.quad.geometry.attributes.uv;
		var array = uv.array;

		// TODO: these parameters should be from vrDisplay.getLayers() maybe?

		array[ 0 ] = 0.5;
		array[ 2 ] = 1.0;
		array[ 4 ] = 0.5;
		array[ 6 ] = 1.0;

		uv.needsUpdate = true;

	},

	resetUvs: function () {

		var uv = this.quad.geometry.attributes.uv;
		var array = uv.array;

		array[ 0 ] = 0.0;
		array[ 2 ] = 1.0;
		array[ 4 ] = 0.0;
		array[ 6 ] = 1.0;

		uv.needsUpdate = true;

	}

} );

// shader for combining left and right half
THREE.VRCombineShader = {

	uniforms: {

		"left": { value: null },
		"right": { value: null },
		"opacity":  { value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float opacity;",

		"uniform sampler2D left;",
		"uniform sampler2D right;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 texel = vUv.x < 0.5 ? texture2D( left, vec2( vUv.x * 2.0, vUv.y ) ) : texture2D( right, vec2( ( vUv.x - 0.5 ) * 2.0, vUv.y ) );",
			"gl_FragColor = opacity * texel;",

		"}"

	].join( "\n" )

};
