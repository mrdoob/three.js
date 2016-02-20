/**
 *
 * Temporal Anti-Aliasing Render Pass
 *
 * @author bhouston / http://clara.io/
 *
 * When there is no motion in the scene, the TAA render pass accumulates jittered camera samples across frames to create a high quality anti-aliased result.
 *
 * References:
 *
 * TODO: Add support for motion vector pas so that accumulation of samples across frames can occur on dynamics scenes.
 *
 */

THREE.TAARenderPass = function ( scene, camera, params ) {

	if ( THREE.ManualMSAARenderPass === undefined ) {

		console.error( "THREE.TAARenderPass relies on THREE.ManualMSAARenderPass" );

	}
	THREE.ManualMSAARenderPass.call( this, scene, camera, params );

	this.sampleLevel = 0;
	this.accumulate = false;
	
};

THREE.TAARenderPass.prototype = Object.create( THREE.ManualMSAARenderPass.prototype );
THREE.TAARenderPass.prototype.constructor = THREE.TAARenderPass;
THREE.TAARenderPass.JitterVectors = THREE.ManualMSAARenderPass.JitterVectors;

THREE.TAARenderPass.prototype.render = function ( renderer, writeBuffer, readBuffer, delta ) {

	if( ! this.accumulate ) {

			THREE.ManualMSAARenderPass.prototype.render.call( this, renderer, writeBuffer, readBuffer, delta );

			this.accumulateIndex = -1;
			return;

	}

	var jitterOffsets = THREE.TAARenderPass.JitterVectors[ 5 ];

	var camera = ( this.camera || this.scene.camera );

	if ( ! this.sampleRenderTarget ) {

		this.sampleRenderTarget = new THREE.WebGLRenderTarget( readBuffer.width, readBuffer.height, this.params );

	}

	if ( ! this.holdRenderTarget ) {

		this.holdRenderTarget = new THREE.WebGLRenderTarget( readBuffer.width, readBuffer.height, this.params );

	}

	if( this.accumulate && this.accumulateIndex === -1 ) {

			THREE.ManualMSAARenderPass.prototype.render.call( this, renderer, this.holdRenderTarget, readBuffer, delta );

			this.accumulateIndex = 0;

	}

	var autoClear = renderer.autoClear;
	renderer.autoClear = false;

	var sampleWeight = 1.0 / ( jitterOffsets.length );

	if( this.accumulateIndex >= 0 && this.accumulateIndex < jitterOffsets.length ) {

		this.compositeUniforms[ "scale" ].value = sampleWeight;
		this.compositeUniforms[ "tForeground" ].value = writeBuffer;

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

			renderer.render( this.scene2, this.camera2, this.sampleRenderTarget, ( this.accumulateIndex == 0 ) );

			this.accumulateIndex ++;
			if( this.accumulateIndex >= jitterOffsets.length ) break;
		}

		// reset jitter to nothing.	TODO: add support for orthogonal cameras
		if ( camera.setViewOffset ) camera.setViewOffset( undefined, undefined, undefined, undefined, undefined, undefined );

	}

	var accumulationWeight = this.accumulateIndex * sampleWeight;

	if( accumulationWeight > 0 ) {
		this.compositeUniforms[ "scale" ].value = 1.0;
		this.compositeUniforms[ "tForeground" ].value = this.sampleRenderTarget;
		renderer.render( this.scene2, this.camera2, writeBuffer, true );
	}

	if( accumulationWeight < 1.0 ) {
		this.compositeUniforms[ "scale" ].value = 1.0 - accumulationWeight;
		this.compositeUniforms[ "tForeground" ].value = this.holdRenderTarget;
		renderer.render( this.scene2, this.camera2, writeBuffer, ( accumulationWeight === 0 ) );
	}

	renderer.autoClear = autoClear;


}
