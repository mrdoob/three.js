import MaterialNode from './MaterialNode.js';
import { addNodeClass } from '../core/Node.js';
import { nodeImmutable } from '../shadernode/ShaderNode.js';

class LineMaterialNode extends MaterialNode {

	setup( /*builder*/ ) {

		return this.getFloat( this.scope );

	}

}

LineMaterialNode.SCALE = 'scale';
LineMaterialNode.DASH_SIZE = 'dashSize';
LineMaterialNode.GAP_SIZE = 'gapSize';
LineMaterialNode.LINEWIDTH = 'linewidth';
LineMaterialNode.DASH_OFFSET = 'dashOffset';

export default LineMaterialNode;

export const materialLineScale = nodeImmutable( LineMaterialNode, LineMaterialNode.SCALE );
export const materialLineDashOffset = nodeImmutable( LineMaterialNode, LineMaterialNode.DASH_OFFSET );
export const materialLineDashSize = nodeImmutable( LineMaterialNode, LineMaterialNode.DASH_SIZE );
export const materialLineGapSize = nodeImmutable( LineMaterialNode, LineMaterialNode.GAP_SIZE );
export const materialLineWidth = nodeImmutable( LineMaterialNode, LineMaterialNode.LINEWIDTH );

addNodeClass( 'LineMaterialNode', LineMaterialNode );
