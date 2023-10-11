import MaterialNode from './MaterialNode.js';
import { addNodeClass } from '../core/Node.js';
import { nodeImmutable } from '../shadernode/ShaderNode.js';

class FatPointsMaterialNode extends MaterialNode {

	setup( /*builder*/ ) {

		return this.getFloat( this.scope );

	}

}

FatPointsMaterialNode.POINTWIDTH = 'pointWidth';

export default FatPointsMaterialNode;

export const materialPointWidth = nodeImmutable( FatPointsMaterialNode, FatPointsMaterialNode.POINTWIDTH );

addNodeClass( 'FatPointsMaterialNode', FatPointsMaterialNode );
