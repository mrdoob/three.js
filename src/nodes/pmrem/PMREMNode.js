import { registerNode } from '../core/Node.js';
import TempNode from '../core/TempNode.js';
import { texture } from '../accessors/TextureNode.js';
import { textureCubeUV } from './PMREMUtils.js';
import { uniform } from '../core/UniformNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { nodeProxy, vec3 } from '../tsl/TSLBase.js';

import { WebGLCoordinateSystem } from '../../constants.js';
import { Texture } from '../../textures/Texture.js';

let _generator = null;

const _cache = new WeakMap();

function _generateCubeUVSize( imageHeight ) {

	const maxMip = Math.log2( imageHeight ) - 2;

	const texelHeight = 1.0 / imageHeight;

	const texelWidth = 1.0 / ( 3 * Math.max( Math.pow( 2, maxMip ), 7 * 16 ) );

	return { texelWidth, texelHeight, maxMip };

}

function _getPMREMFromTexture( texture ) {

	let cacheTexture = _cache.get( texture );

	const pmremVersion = cacheTexture !== undefined ? cacheTexture.pmremVersion : - 1;

	if ( pmremVersion !== texture.pmremVersion ) {

		const image = texture.image;

		if ( texture.isCubeTexture ) {

			if ( isCubeMapReady( image ) ) {

				cacheTexture = _generator.fromCubemap( texture, cacheTexture );

			} else {

				return null;

			}


		} else {

			if ( isEquirectangularMapReady( image ) ) {

				cacheTexture = _generator.fromEquirectangular( texture, cacheTexture );

			} else {

				return null;

			}

		}

		cacheTexture.pmremVersion = texture.pmremVersion;

		_cache.set( texture, cacheTexture );

	}

	return cacheTexture.texture;

}

class PMREMNode extends TempNode {

	constructor( value, uvNode = null, levelNode = null ) {

		super( 'vec3' );

		this._value = value;
		this._pmrem = null;

		this.uvNode = uvNode;
		this.levelNode = levelNode;

		this._generator = null;

		const defaultTexture = new Texture();
		defaultTexture.isRenderTargetTexture = true;

		this._texture = texture( defaultTexture );

		this._width = uniform( 0 );
		this._height = uniform( 0 );
		this._maxMip = uniform( 0 );

		this.updateBeforeType = NodeUpdateType.RENDER;

	}

	set value( value ) {

		this._value = value;
		this._pmrem = null;

	}

	get value() {

		return this._value;

	}

	updateFromTexture( texture ) {

		const cubeUVSize = _generateCubeUVSize( texture.image.height );

		this._texture.value = texture;
		this._width.value = cubeUVSize.texelWidth;
		this._height.value = cubeUVSize.texelHeight;
		this._maxMip.value = cubeUVSize.maxMip;

	}

	updateBefore() {

		let pmrem = this._pmrem;

		const pmremVersion = pmrem ? pmrem.pmremVersion : - 1;
		const texture = this._value;

		if ( pmremVersion !== texture.pmremVersion ) {

			if ( texture.isPMREMTexture === true ) {

				pmrem = texture;

			} else {

				pmrem = _getPMREMFromTexture( texture );

			}

			if ( pmrem !== null ) {

				this._pmrem = pmrem;

				this.updateFromTexture( pmrem );

			}

		}

	}

	setup( builder ) {

		if ( _generator === null ) {

			_generator = builder.createPMREMGenerator();

		}

		//

		this.updateBefore( builder );

		//

		let uvNode = this.uvNode;

		if ( uvNode === null && builder.context.getUV ) {

			uvNode = builder.context.getUV( this );

		}

		//

		const texture = this.value;

		if ( builder.renderer.coordinateSystem === WebGLCoordinateSystem && texture.isPMREMTexture !== true && texture.isRenderTargetTexture === true ) {

			uvNode = vec3( uvNode.x.negate(), uvNode.yz );

		}

		//

		let levelNode = this.levelNode;

		if ( levelNode === null && builder.context.getTextureLevel ) {

			levelNode = builder.context.getTextureLevel( this );

		}

		//

		return textureCubeUV( this._texture, uvNode, levelNode, this._width, this._height, this._maxMip );

	}

}

export default PMREMNode;

PMREMNode.type = /*@__PURE__*/ registerNode( 'PMREM', PMREMNode );

function isCubeMapReady( image ) {

	if ( image === null || image === undefined ) return false;

	let count = 0;
	const length = 6;

	for ( let i = 0; i < length; i ++ ) {

		if ( image[ i ] !== undefined ) count ++;

	}

	return count === length;


}

function isEquirectangularMapReady( image ) {

	if ( image === null || image === undefined ) return false;

	return image.height > 0;

}

export const pmremTexture = /*@__PURE__*/ nodeProxy( PMREMNode );
