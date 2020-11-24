import { CubeReflectionMapping, CubeRefractionMapping, EquirectangularReflectionMapping, EquirectangularRefractionMapping } from '../../constants.js';
import { PMREMGenerator } from '../../extras/PMREMGenerator.js';

function WebGLCubeUVMaps( renderer ) {

	let cubeUVmaps = new WeakMap();

	let pmremGenerator = null;

	function get( texture ) {

		if ( texture && texture.isTexture && texture.isRenderTargetTexture === false ) {

			const mapping = texture.mapping;

			const isEquirectMap = ( mapping === EquirectangularReflectionMapping || mapping === EquirectangularRefractionMapping );
			const isCubeMap = ( mapping === CubeReflectionMapping || mapping === CubeRefractionMapping );

			if ( isEquirectMap || isCubeMap ) {

				// equirect/cube map to cubeUV conversion

				if ( cubeUVmaps.has( texture ) ) {

					return cubeUVmaps.get( texture ).texture;

				} else {

					const image = texture.image;

					if ( ( isEquirectMap && image && image.height > 0 ) || ( isCubeMap && image && image.length === 6 ) ) {

						const currentRenderList = renderer.getRenderList();
						const currentRenderTarget = renderer.getRenderTarget();
						const currentRenderState = renderer.getRenderState();

						if ( pmremGenerator === null ) pmremGenerator = new PMREMGenerator( renderer );

						const renderTarget = isEquirectMap ? pmremGenerator.fromEquirectangular( texture ) : pmremGenerator.fromCubemap( texture );
						cubeUVmaps.set( texture, renderTarget );

						renderer.setRenderTarget( currentRenderTarget );
						renderer.setRenderList( currentRenderList );
						renderer.setRenderState( currentRenderState );

						texture.addEventListener( 'dispose', onTextureDispose );

						return renderTarget.texture;

					} else {

						// image not yet ready. try the conversion next frame

						return null;

					}

				}

			}

		}

		return texture;

	}

	function onTextureDispose( event ) {

		const texture = event.target;

		texture.removeEventListener( 'dispose', onTextureDispose );

		const cubemapUV = cubeUVmaps.get( texture );

		if ( cubemapUV !== undefined ) {

			cubemapUV.delete( texture );
			cubemapUV.dispose();

		}

	}

	function dispose() {

		cubeUVmaps = new WeakMap();

		if ( pmremGenerator !== null ) {

			pmremGenerator.dispose();
			pmremGenerator = null;

		}

	}

	return {
		get: get,
		dispose: dispose
	};

}

export { WebGLCubeUVMaps };
