import MaterialNode from './MaterialNode.js';
import { addNodeClass } from '../core/Node.js';
import { nodeImmutable } from '../shadernode/ShaderNode.js';

class InstancedPointsMaterialNode extends MaterialNode {

	setup( /*builder*/ ) {

		return this.getFloat( this.scope );

	}

}

InstancedPointsMaterialNode.POINTWIDTH = 'pointWidth';

export default InstancedPointsMaterialNode;

export const materialPointWidth = nodeImmutable( InstancedPointsMaterialNode, InstancedPointsMaterialNode.POINTWIDTH );

addNodeClass( 'FatPointsMaterialNode', InstancedPointsMaterialNode );
