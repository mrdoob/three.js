import {
	DepthStencilFormat, DepthTexture, HalfFloatType, NearestFilter,
	UnsignedInt248Type, WebGLRenderTarget
} from 'three';

// Internal helpers for geometry-buffer consumers. Validation of the standard separate
// depth/normal contract is opt-in so GTAO retains its depth-only and combined inputs.
// An optional internal depth source (e.g. SSR's beauty depth) remains owned by its
// original render target. Otherwise the normal target owns a new depth texture.
function setGBuffer( pass, depthTexture, normalTexture, internalDepthTexture, retainInternalTarget = false ) {

	if ( depthTexture !== undefined ) {

		if ( ! retainInternalTarget ) {

			if ( pass.normalRenderTarget ) pass.normalRenderTarget.dispose();
			pass.normalRenderTarget = null;

		}

		pass.depthTexture = depthTexture;
		pass.normalTexture = normalTexture;
		pass._renderGBuffer = false;

	} else {

		if ( ! pass.normalRenderTarget ) {

			let depth = null;
			if ( internalDepthTexture === undefined ) {

				depth = new DepthTexture();
				depth.format = DepthStencilFormat;
				depth.type = UnsignedInt248Type;

			}

			pass.normalRenderTarget = new WebGLRenderTarget( pass.width, pass.height, {
				minFilter: NearestFilter,
				magFilter: NearestFilter,
				type: HalfFloatType,
				depthTexture: depth
			} );

		}

		pass.depthTexture = internalDepthTexture ?? pass.normalRenderTarget.depthTexture;
		pass.normalTexture = pass.normalRenderTarget.texture;
		pass._renderGBuffer = true;

	}

}

function validateGBuffer( pass, renderer ) {

	if ( pass._renderGBuffer ) return;

	if ( renderer.capabilities.reversedDepthBuffer || renderer.capabilities.logarithmicDepthBuffer ) {

		throw new Error( `THREE.${pass.constructor.name}: Shared inputs require conventional depth.` );

	}

	const depth = pass.depthTexture.image;
	const normal = pass.normalTexture.image;
	if ( depth?.width !== pass.width || depth?.height !== pass.height || normal?.width !== pass.width || normal?.height !== pass.height ) {

		throw new Error( `THREE.${pass.constructor.name}: Shared inputs must match the pass dimensions.` );

	}

}

function validateGBufferTextures( depthTexture, normalTexture, name ) {

	if ( depthTexture === undefined && normalTexture === undefined ) return;
	if ( ! depthTexture?.isDepthTexture || ! normalTexture?.isTexture || depthTexture === normalTexture ) {

		throw new Error( `THREE.${name}: Expected a separate depth texture and normal texture.` );

	}

}

// SSR uses #ifdef PERSPECTIVE_CAMERA; the AO/depth shaders use a numeric define.
function updatePerspectiveCamera( material, camera, presenceDefine = false ) {

	const perspective = camera.isPerspectiveCamera ? 1 : ( presenceDefine ? undefined : 0 );
	if ( material.defines.PERSPECTIVE_CAMERA === perspective ) return;

	if ( perspective === undefined ) delete material.defines.PERSPECTIVE_CAMERA;
	else material.defines.PERSPECTIVE_CAMERA = perspective;
	material.needsUpdate = true;

}

export { setGBuffer, validateGBuffer, validateGBufferTextures, updatePerspectiveCamera };
