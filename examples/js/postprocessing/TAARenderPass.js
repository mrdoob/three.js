/**
 *
 * Temporal Anti-Aliasing Render Pass
 *
 * When there is no motion in the scene, the TAA render pass accumulates jittered camera samples across frames to create a high quality anti-aliased result.
 *
 * References:
 *
 * TODO: Add support for motion vector pas so that accumulation of samples across frames can occur on dynamics scenes.
 *
 */

THREE.TAARenderPass = function ( scene, camera, clearColor, clearAlpha ) {

	if ( THREE.SSAARenderPass === undefined ) {

		console.error( "THREE.TAARenderPass relies on THREE.SSAARenderPass" );

	}

	THREE.SSAARenderPass.call( this, scene, camera, clearColor, clearAlpha );

	this.sampleLevel = 0;
	this.accumulate = false;

};

THREE.TAARenderPass.JitterVectors = THREE.SSAARenderPass.JitterVectors;

THREE.TAARenderPass.prototype = Object.assign( Object.create( THREE.SSAARenderPass.prototype ), {

	constructor: THREE.TAARenderPass,

	render: function ( renderer, writeBuffer, readBuffer, deltaTime ) {

		if ( ! this.accumulate ) {

			THREE.SSAARenderPass.prototype.render.call( this, renderer, writeBuffer, readBuffer, deltaTime );

			this.accumulateIndex = - 1;
			return;

		}

		var jitterOffsets = THREE.TAARenderPass.JitterVectors[ 5 ];

		if ( ! this.sampleRenderTarget ) {

			this.sampleRenderTarget = new THREE.WebGLRenderTarget( readBuffer.width, readBuffer.height, this.params );
			this.sampleRenderTarget.texture.name = "TAARenderPass.sample";

		}

		if ( ! this.holdRenderTarget ) {

			this.holdRenderTarget = new THREE.WebGLRenderTarget( readBuffer.width, readBuffer.height, this.params );
			this.holdRenderTarget.texture.name = "TAARenderPass.hold";

		}

		if ( this.accumulate && this.accumulateIndex === - 1 ) {

			THREE.SSAARenderPass.prototype.render.call( this, renderer, this.holdRenderTarget, readBuffer, deltaTime );

			this.accumulateIndex = 0;

		}

		var autoClear = renderer.autoClear;
		renderer.autoClear = false;

		var sampleWeight = 1.0 / ( jitterOffsets.length );

		if ( this.accumulateIndex >= 0 && this.accumulateIndex < jitterOffsets.length ) {

			this.copyUniforms[ "opacity" ].value = sampleWeight;
			this.copyUniforms[ "tDiffuse" ].value = writeBuffer.texture;

			// render the scene multiple times, each slightly jitter offset from the last and accumulate the results.
			var numSamplesPerFrame = Math.pow( 2, this.sampleLevel );
			for ( var i = 0; i < numSamplesPerFrame; i ++ ) {

				var j = this.accumulateIndex;
				var jitterOffset = jitterOffsets[ j ];

				if ( this.camera.setViewOffset ) {

					this.camera.setViewOffset( readBuffer.width, readBuffer.height,
						jitterOffset[ 0 ] * 0.0625, jitterOffset[ 1 ] * 0.0625, // 0.0625 = 1 / 16
						readBuffer.width, readBuffer.height );

				}

				renderer.setRenderTarget( writeBuffer );
				renderer.clear();
				renderer.render( this.scene, this.camera );

				renderer.setRenderTarget( this.sampleRenderTarget );
				if ( this.accumulateIndex === 0 ) renderer.clear();
				this.fsQuad.render( renderer );

				this.accumulateIndex ++;

				if ( this.accumulateIndex >= jitterOffsets.length ) break;

			}

			if ( this.camera.clearViewOffset ) this.camera.clearViewOffset();

		}

		var accumulationWeight = this.accumulateIndex * sampleWeight;

		if ( accumulationWeight > 0 ) {

			this.copyUniforms[ "opacity" ].value = 1.0;
			this.copyUniforms[ "tDiffuse" ].value = this.sampleRenderTarget.texture;
			renderer.setRenderTarget( writeBuffer );
			renderer.clear();
			this.fsQuad.render( renderer );

		}

		if ( accumulationWeight < 1.0 ) {

			this.copyUniforms[ "opacity" ].value = 1.0 - accumulationWeight;
			this.copyUniforms[ "tDiffuse" ].value = this.holdRenderTarget.texture;
			renderer.setRenderTarget( writeBuffer );
			if ( accumulationWeight === 0 ) renderer.clear();
			this.fsQuad.render( renderer );

		}

		renderer.autoClear = autoClear;

	}

} );
