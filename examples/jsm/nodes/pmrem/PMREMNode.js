import TempNode from '../core/TempNode.js';
import { addNodeClass } from '../core/Node.js';
import { texture } from '../accessors/TextureNode.js';
import { textureCubeUV } from './PMREMUtils.js';
import { uniform } from '../core/UniformNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { nodeProxy, vec3 } from '../shadernode/ShaderNode.js';
import { WebGLCoordinateSystem } from 'three';

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

		if ( texture.isCubeTexture ) {

			if ( texture.source.data.some( ( texture ) => texture === undefined ) ) {

				throw new Error( 'PMREMNode: Undefined texture in CubeTexture. Use onLoad callback or async loader' );

			}

			cacheTexture = _generator.fromCubemap( texture, cacheTexture );

		} else {

			if ( texture.image === undefined ) {

				throw new Error( 'PMREMNode: Undefined image in Texture. Use onLoad callback or async loader' );

			}

			cacheTexture = _generator.fromEquirectangular( texture, cacheTexture );

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
		this._texture = texture( null );
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

			this._pmrem = pmrem;

			this.updateFromTexture( pmrem );

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

export const pmremTexture = nodeProxy( PMREMNode );

addNodeClass( 'PMREMNode', PMREMNode );

export default PMREMNode;
