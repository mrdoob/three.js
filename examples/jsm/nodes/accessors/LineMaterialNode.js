import MaterialNode from './MaterialNode.js';
import { addNodeClass } from '../core/Node.js';
import { nodeImmutable } from '../shadernode/ShaderNode.js';

class LineMaterialNode extends MaterialNode {

	constructor( scope ) {

		super( scope );

	}

	construct( builder ) {

		return this.getFloat( builder, this.scope );

	}

}

LineMaterialNode.SCALE = 'scale';
LineMaterialNode.DASH_SIZE = 'dashSize';
LineMaterialNode.GAP_SIZE = 'gapSize';

export default LineMaterialNode;

export const materialLineScale = nodeImmutable( LineMaterialNode, LineMaterialNode.SCALE );
export const materialLineDashSize = nodeImmutable( LineMaterialNode, LineMaterialNode.DASH_SIZE );
export const materialLineGapSize = nodeImmutable( LineMaterialNode, LineMaterialNode.GAP_SIZE );

addNodeClass( LineMaterialNode );
