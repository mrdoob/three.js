/**
 * @author bhouston / http://clara.io/ *
 */

THREE.TAARenderPass = function ( scene, camera, params ) {

	if ( THREE.ManualMSAARenderPass === undefined ) {

		console.error( "THREE.TAARenderPass relies on THREE.ManualMSAARenderPass" );

	}
	THREE.ManualMSAARenderPass.call( this, scene, camera, params );

	this.sampleLevel = 1;
	this.accumulate = false;

	if ( THREE.CompositeShader === undefined ) {

		console.error( "THREE.TAARenderPass relies on THREE.CompositeShader" );

	}

	var accumulateShader = THREE.CompositeShader;
	this.accumulateUniforms = THREE.UniformsUtils.clone( accumulateShader.uniforms );

	this.materialAccumulate = new THREE.ShaderMaterial(	{

		uniforms: this.accumulateUniforms,
		vertexShader: accumulateShader.vertexShader,
		fragmentShader: accumulateShader.fragmentShader,
		transparent: true,
		blending: THREE.CustomBlending,
		blendSrc: THREE.OneFactor,
		blendDst: THREE.OneMinusSrcAlphaFactor,
		blendEquation: THREE.AddEquation,
		depthTest: false,
		depthWrite: false

	} );

	this.camera3 = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this.scene3	= new THREE.Scene();
	this.quad3 = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), this.materialAccumulate );
	this.scene3.add( this.quad3 );

};

THREE.TAARenderPass.prototype = Object.create( THREE.ManualMSAARenderPass.prototype );
THREE.TAARenderPass.prototype.constructor = THREE.TAARenderPass;
THREE.TAARenderPass.JitterVectors = THREE.ManualMSAARenderPass.JitterVectors;

THREE.TAARenderPass.prototype.render = function ( renderer, writeBuffer, readBuffer, delta ) {

	if( ! this.accumulate ) {

			THREE.ManualMSAARenderPass.prototype.render.call( this, renderer, writeBuffer, readBuffer, delta );

			this.accumulateIndex = 0;
			return;

	}

	var jitterOffsets = THREE.TAARenderPass.JitterVectors[ 4 ];

	var camera = ( this.camera || this.scene.camera );

	if ( ! this.sampleRenderTarget ) {

		this.sampleRenderTarget = new THREE.WebGLRenderTarget( readBuffer.width, readBuffer.height, this.params );

	}


	if( this.accumulateIndex < jitterOffsets.length ) {
		var autoClear = renderer.autoClear;
		renderer.autoClear = false;

		this.accumulateUniforms[ "scale" ].value = 1.0 / ( jitterOffsets.length );
		this.accumulateUniforms[ "tForeground" ].value = writeBuffer;

		// render the scene multiple times, each slightly jitter offset from the last and accumulate the results.
		var numSamplesPerFrame = Math.pow( 2, this.sampleLevel );
		for ( var i = 0; i < numSamplesPerFrame; i ++ ) {

			var j = this.accumulateIndex;
			// only jitters perspective cameras.	TODO: add support for jittering orthogonal cameras
			var jitterOffset = jitterOffsets[j];
			if ( camera.setViewOffset ) {
				camera.setViewOffset( readBuffer.width, readBuffer.height,
					jitterOffset[ 0 ] * 0.0625, jitterOffset[ 1 ] * 0.0625,   // 0.0625 = 1 / 16
					readBuffer.width, readBuffer.height );
			}

			renderer.render( this.scene, this.camera, writeBuffer, true );

			this.accumulateUniforms[ "scale" ].value = 1.0 / ( this.accumulateIndex + 1 );
			renderer.render( this.scene3, this.camera3, this.sampleRenderTarget, ( this.accumulateIndex == 0 ) );

			this.accumulateIndex ++;
			if( this.accumulateIndex >= jitterOffsets.length ) break;
		}

		// reset jitter to nothing.	TODO: add support for orthogonal cameras
		if ( camera.setViewOffset ) camera.setViewOffset( undefined, undefined, undefined, undefined, undefined, undefined );

		renderer.autoClear = true;

	}

	this.accumulateUniforms[ "scale" ].value = 1.0;
	this.accumulateUniforms[ "tForeground" ].value = this.sampleRenderTarget;
	renderer.render( this.scene3, this.camera3, writeBuffer );

}
