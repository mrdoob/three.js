import TempNode from '../core/TempNode.js';
import { addNodeClass } from '../core/Node.js';
import { texture } from '../accessors/TextureNode.js';
import { textureCubeUV } from './PMREMUtils.js';
import { uniform } from '../core/UniformNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { nodeProxy, float } from '../shadernode/ShaderNode.js';

function generateCubeUVSize( imageHeight ) {

	const maxMip = Math.log2( imageHeight ) - 2;

	const texelHeight = 1.0 / imageHeight;

	const texelWidth = 1.0 / ( 3 * Math.max( Math.pow( 2, maxMip ), 7 * 16 ) );

	return { texelWidth, texelHeight, maxMip };

}

class PMREMNode extends TempNode {

	constructor( value, uvNode, rougnessNode ) {

		super( 'vec3' );

		this._value = value;
		this._cubeUVSize = null;

		this.uvNode = uvNode;
		this.rougnessNode = rougnessNode;

		this._texture = texture( null );
		this._width = uniform( 0 );
		this._height = uniform( 0 );
		this._maxMip = uniform( 0 );

		this.updateType = NodeUpdateType.RENDER;

	}

	set value( value ) {

		this._value = value;
		this._cubeUVSize = null;

	}

	get value() {

		return this._value;

	}

	update() {

		let cubeUVSize = this._cubeUVSize;

		if ( cubeUVSize === null ) {

			this._cubeUVSize = cubeUVSize = generateCubeUVSize( this._value.image.height );

		}

		this._texture.value = this._value;
		this._width.value = cubeUVSize.texelWidth;
		this._height.value = cubeUVSize.texelHeight;
		this._maxMip.value = cubeUVSize.maxMip;

	}

	setup() {

		this.update();

		return textureCubeUV( this._texture, this.uvNode, this.rougnessNode || float( 0 ), this._width, this._height, this._maxMip );

	}

}

addNodeClass( 'PMREMNode', PMREMNode );

export const pmrem = nodeProxy( PMREMNode );

export default PMREMNode;
