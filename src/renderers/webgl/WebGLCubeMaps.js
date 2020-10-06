import { CubeReflectionMapping, CubeRefractionMapping, EquirectangularReflectionMapping, EquirectangularRefractionMapping } from '../../constants.js';
import { WebGLCubeRenderTarget } from '../WebGLCubeRenderTarget.js';
import { PMREMGenerator } from '../../extras/PMREMGenerator.js';

function WebGLCubeMaps( renderer ) {

	let cubemaps = new WeakMap();
	let cubeUVmaps = new WeakMap();

	let pmremGenerator = null;

	function mapTextureMapping( texture, mapping ) {

		if ( mapping === EquirectangularReflectionMapping ) {

			texture.mapping = CubeReflectionMapping;

		} else if ( mapping === EquirectangularRefractionMapping ) {

			texture.mapping = CubeRefractionMapping;

		}

		return texture;

	}

	function get( texture, isPBR = false ) {

		if ( texture && texture.isTexture ) {

			const mapping = texture.mapping;

			const isEquirectMap = ( mapping === EquirectangularReflectionMapping || mapping === EquirectangularRefractionMapping );
			const isCubeMap = ( mapping === CubeReflectionMapping || mapping === CubeRefractionMapping );

			if ( isPBR && ( isEquirectMap || isCubeMap ) ) {

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

			} else if ( isEquirectMap ) {

				// equirect to cube map conversion

				if ( cubemaps.has( texture ) ) {

					const cubemap = cubemaps.get( texture ).texture;
					return mapTextureMapping( cubemap, texture.mapping );

				} else {

					const image = texture.image;

					if ( image && image.height > 0 ) {

						const currentRenderList = renderer.getRenderList();
						const currentRenderTarget = renderer.getRenderTarget();
						const currentRenderState = renderer.getRenderState();

						const renderTarget = new WebGLCubeRenderTarget( image.height / 2 );
						renderTarget.fromEquirectangularTexture( renderer, texture );
						cubemaps.set( texture, renderTarget );

						renderer.setRenderTarget( currentRenderTarget );
						renderer.setRenderList( currentRenderList );
						renderer.setRenderState( currentRenderState );

						texture.addEventListener( 'dispose', onTextureDispose );

						return mapTextureMapping( renderTarget.texture, texture.mapping );

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

		const cubemap = cubemaps.get( texture );

		if ( cubemap !== undefined ) {

			cubemaps.delete( texture );
			cubemap.dispose();

		}

		const cubemapUV = cubeUVmaps.get( texture );

		if ( cubemapUV !== undefined ) {

			cubemapUV.delete( texture );
			cubemapUV.dispose();

		}

	}

	function dispose() {

		cubemaps = new WeakMap();
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

export { WebGLCubeMaps };
