import TempNode from '../core/TempNode.js';
import { addNodeClass } from '../core/Node.js';
import { normalWorld } from '../accessors/NormalNode.js';
import { positionWorld } from '../accessors/PositionNode.js';
import { texture } from '../accessors/TextureNode.js';
import { addNodeElement, nodeProxy, float } from '../shadernode/ShaderNode.js';

class TriplanarTexturesNode extends TempNode {

	constructor( textureXNode, textureYNode = null, textureZNode = null, scaleNode = float( 1 ), positionNode = positionWorld, normalNode = normalWorld ) {

		super( 'vec4' );

		this.textureXNode = textureXNode;
		this.textureYNode = textureYNode;
		this.textureZNode = textureZNode;

		this.scaleNode = scaleNode;

		this.positionNode = positionNode;
		this.normalNode = normalNode;

	}

	setup() {

		const { textureXNode, textureYNode, textureZNode, scaleNode, positionNode, normalNode } = this;

		// Ref: https://github.com/keijiro/StandardTriplanar

		// Blending factor of triplanar mapping
		let bf = normalNode.abs().normalize();
		bf = bf.div( bf.x.add( bf.y, bf.z ) );

		// Triplanar mapping
		const tx = positionNode.yz.mul( scaleNode );
		const ty = positionNode.zx.mul( scaleNode );
		const tz = positionNode.xy.mul( scaleNode );

		// Base color
		const textureX = textureXNode.value;
		const textureY = textureYNode !== null ? textureYNode.value : textureX;
		const textureZ = textureZNode !== null ? textureZNode.value : textureX;

		const cx = texture( textureX, tx ).mul( bf.x );
		const cy = texture( textureY, ty ).mul( bf.y );
		const cz = texture( textureZ, tz ).mul( bf.z );

		return cx.add( cy, cz );

	}

}

export default TriplanarTexturesNode;

export const triplanarTextures = nodeProxy( TriplanarTexturesNode );
export const triplanarTexture = ( ...params ) => triplanarTextures( ...params );

addNodeElement( 'triplanarTexture', triplanarTexture );

addNodeClass( 'TriplanarTexturesNode', TriplanarTexturesNode );
