/**
 * @author mrdoob / http://mrdoob.com/
 */

import { CubeReflectionMapping, CubeRefractionMapping, CubeUVReflectionMapping, CubeUVRefractionMapping, EquirectangularReflectionMapping, EquirectangularRefractionMapping } from '../../constants.js';
import { WebGLCubeRenderTarget } from "../WebGLCubeRenderTarget.js";

function WebGLCubeMaps( renderer ) {

	let cubemaps = new WeakMap();

	function mapTextureMapping( texture, mapping ) {

		if ( mapping === EquirectangularReflectionMapping ) {

			texture.mapping = CubeReflectionMapping;

		} else if ( mapping === EquirectangularRefractionMapping ) {

			texture.mapping = CubeRefractionMapping;

		}

	}

	function get( texture ) {

		if ( texture && ( texture.isCubeTexture || texture.isWebGLCubeTexture ) ) {

			return texture;

		} else if ( texture && texture.isTexture ) {

			const mapping = texture.mapping;
			const isDeprecatedEquirectangular = mapping === EquirectangularReflectionMapping || mapping === EquirectangularRefractionMapping;

			if ( mapping === CubeUVReflectionMapping || mapping === CubeUVRefractionMapping ) {

				return texture;

			} else if ( texture.isEquirectangularTexture || isDeprecatedEquirectangular ) {

				if ( cubemaps.has( texture ) ) {

					const cubemap = cubemaps.get( texture ).texture;
					mapTextureMapping( cubemap, texture.mapping );
					return cubemap;

				} else {

					const image = texture.image;

					if ( image.complete === true ) {

						const renderTarget = new WebGLCubeRenderTarget( image.height / 2 );
						renderTarget.fromEquirectangularTexture( renderer, texture );
						cubemaps.set( texture, renderTarget );

						const cubemap = renderTarget.texture;
						mapTextureMapping( cubemap, texture.mapping );
						return cubemap;

					}

				}

			}

		}

		return null;

	}

	function dispose() {

		cubemaps = new WeakMap();

	}

	return {
		get: get,
		dispose: dispose
	};

}

export { WebGLCubeMaps };
