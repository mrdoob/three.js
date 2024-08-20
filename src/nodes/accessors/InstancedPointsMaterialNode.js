import MaterialNode from './MaterialNode.js';
import { nodeImmutable } from '../tsl/TSLBase.js';

class InstancedPointsMaterialNode extends MaterialNode {

	setup( /*builder*/ ) {

		return this.getFloat( this.scope );

	}

}

InstancedPointsMaterialNode.POINT_WIDTH = 'pointWidth';

export default InstancedPointsMaterialNode;

export const materialPointWidth = nodeImmutable( InstancedPointsMaterialNode, InstancedPointsMaterialNode.POINT_WIDTH );
