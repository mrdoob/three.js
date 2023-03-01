import Node from '../core/Node.js';
import { float, vec3, add, mul, div, dot, normalize, abs, texture, positionWorld, normalWorld } from '../shadernode/ShaderNodeBaseElements.js';

class TriplanarTexturesNode extends Node {

	constructor( textureXNode, textureYNode = null, textureZNode = null, scaleNode = float( 1 ), positionNode = positionWorld, normalNode = normalWorld ) {

		super( 'vec4' );

		this.textureXNode = textureXNode;
		this.textureYNode = textureYNode;
		this.textureZNode = textureZNode;

		this.scaleNode = scaleNode;

		this.positionNode = positionNode;
		this.normalNode = normalNode;

	}

	construct() {

		const { textureXNode, textureYNode, textureZNode, scaleNode, positionNode, normalNode } = this;

		// Ref: https://github.com/keijiro/StandardTriplanar

		// Blending factor of triplanar mapping
		let bf = normalize( abs( normalNode ) );
		bf = div( bf, dot( bf, vec3( 1.0 ) ) );

		// Triplanar mapping
		const tx = mul( positionNode.yz, scaleNode );
		const ty = mul( positionNode.zx, scaleNode );
		const tz = mul( positionNode.xy, scaleNode );

		// Base color
		const textureX = textureXNode.value;
		const textureY = textureYNode !== null ? textureYNode.value : textureX;
		const textureZ = textureZNode !== null ? textureZNode.value : textureX;

		const cx = mul( texture( textureX, tx ), bf.x );
		const cy = mul( texture( textureY, ty ), bf.y );
		const cz = mul( texture( textureZ, tz ), bf.z );

		return add( cx, cy, cz );

	}

}

export default TriplanarTexturesNode;
