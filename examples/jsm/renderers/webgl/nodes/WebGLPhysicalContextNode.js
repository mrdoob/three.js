import ContextNode from 'three-nodes/core/ContextNode.js';
import NormalNode from 'three-nodes/accessors/NormalNode.js';
import ExpressionNode from 'three-nodes/core/ExpressionNode.js';
import FloatNode from 'three-nodes/inputs/FloatNode.js';

class WebGLPhysicalContextNode extends ContextNode {

	static Radiance = 'radiance';
	static Irradiance = 'irradiance';

	constructor( scope, node ) {

		super( node, 'vec3' );

		this.scope = scope;

	}

	generate( builder, output ) {

		const scope = this.scope;

		let roughness = null;

		if ( scope === WebGLPhysicalContextNode.Radiance ) {

			roughness = new ExpressionNode( 'roughnessFactor', 'float' );

		} else if ( scope === WebGLPhysicalContextNode.Irradiance ) {

			roughness = new FloatNode( 1.0 ).setConst( true );

			this.context.uv = new NormalNode( NormalNode.World );

		}

		this.context.roughness = roughness;

		return super.generate( builder, output );

	}

}

export default WebGLPhysicalContextNode;
