import { registerNode } from '../core/Node.js';
import MaterialNode from './MaterialNode.js';
import { nodeImmutable } from '../tsl/TSLBase.js';

class InstancedPointsMaterialNode extends MaterialNode {

	setup( /*builder*/ ) {

		return this.getFloat( this.scope );

	}

}

InstancedPointsMaterialNode.POINT_WIDTH = 'pointWidth';

export default InstancedPointsMaterialNode;

InstancedPointsMaterialNode.type = /*@__PURE__*/ registerNode( 'InstancedPointsMaterial', InstancedPointsMaterialNode );

export const materialPointWidth = /*@__PURE__*/ nodeImmutable( InstancedPointsMaterialNode, InstancedPointsMaterialNode.POINT_WIDTH );
