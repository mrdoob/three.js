function WebGLProperties() {

	let properties = new WeakMap();

	function has( object ) {

		return properties.has( object );

	}

	function get( object ) {

		let map = properties.get( object );

		if ( map === undefined ) {

			if ( object.isMaterial ) {

				map = createMaterialProperties();

			} else if ( object.isTexture ) {

				map = createTextureProperties();

			} else if ( object.isWebGLRenderTarget ) {

				map = createRenderTargetProperties();

			} else {

				map = {};

			}

			properties.set( object, map );

		}

		return map;

	}

	function createMaterialProperties() {

		return {
			outputColorSpace: undefined,
			batching: undefined,
			batchingColor: undefined,
			instancing: undefined,
			instancingColor: undefined,
			instancingMorph: undefined,
			skinning: undefined,
			morphTargets: undefined,
			morphNormals: undefined,
			morphColors: undefined,
			morphTargetsCount: undefined,
			numClippingPlanes: undefined,
			numIntersection: undefined,
			vertexAlphas: undefined,
			vertexTangents: undefined,
			toneMapping: undefined,
			fog: undefined,
			environment: undefined,
			envMap: undefined,
			envMapRotation: undefined,
			programs: undefined,
			currentProgram: undefined,
			uniforms: undefined,
			uniformsList: undefined,
			needsLights: undefined,
			lightsStateVersion: undefined,
			receiveShadow: undefined,
			light: undefined,
			clippingState: undefined,
			__version: undefined
		};

	}

	function createTextureProperties() {

		return {
			__init: undefined,
			__webglTexture: undefined,
			__cacheKey: undefined,
			__version: undefined,
			__currentAnisotropy: undefined,
			__renderTarget: undefined
		};

	}

	function createRenderTargetProperties() {

		return {
			__webglFramebuffer: undefined,
			__webglDepthbuffer: undefined,
			__webglMultisampledFramebuffer: undefined,
			__webglColorRenderbuffer: undefined,
			__webglDepthRenderbuffer: undefined,
			__hasExternalTextures: undefined,
			__boundDepthTexture: undefined,
			__depthDisposeCallback: undefined,
			__autoAllocateDepthBuffer: undefined,
			__useRenderToTexture: undefined,
			__useDefaultFramebuffer: undefined
		};

	}

	function remove( object ) {

		properties.delete( object );

	}

	function update( object, key, value ) {

		properties.get( object )[ key ] = value;

	}

	function dispose() {

		properties = new WeakMap();

	}

	return {
		has: has,
		get: get,
		remove: remove,
		update: update,
		dispose: dispose
	};

}


export { WebGLProperties };
