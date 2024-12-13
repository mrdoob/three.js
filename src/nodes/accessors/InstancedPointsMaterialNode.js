import MaterialNode from './MaterialNode.js';
import { nodeImmutable } from '../tsl/TSLBase.js';

/** @module InstancedPointsMaterialNode **/

/**
 * An extension of material node to provide pre-defined
 * TSL objects in context of `InstancedPointsNodeMaterial`.
 *
 * @augments module:MaterialNode~MaterialNode
 */
class InstancedPointsMaterialNode extends MaterialNode {

	static get type() {

		return 'InstancedPointsMaterialNode';

	}

	setup( /*builder*/ ) {

		return this.getFloat( this.scope );

	}

}

InstancedPointsMaterialNode.POINT_WIDTH = 'pointWidth';

export default InstancedPointsMaterialNode;

/**
 * TSL object that represents the point width of the current points material.
 *
 * @type {InstancedPointsMaterialNode<float>}
 */
export const materialPointWidth = /*@__PURE__*/ nodeImmutable( InstancedPointsMaterialNode, InstancedPointsMaterialNode.POINT_WIDTH );
