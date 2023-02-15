// @TODO: Is this needed? Can it be moved in MaterialNode?

import MaterialNode from './MaterialNode.js';
import { materialReference } from './MaterialReferenceNode.js';
import { normalView } from './NormalNode.js';
import { normalMap } from '../display/NormalMapNode.js';
import { addNodeClass } from '../core/Node.js';
import { nodeImmutable } from '../shadernode/ShaderNode.js';

class ExtendedMaterialNode extends MaterialNode {

	constructor( scope ) {

		super( scope );

	}

	getNodeType( builder ) {

		const scope = this.scope;
		let type = null;

		if ( scope === ExtendedMaterialNode.NORMAL ) {

			type = 'vec3';

		}

		return type || super.getNodeType( builder );

	}

	construct( builder ) {

		const material = builder.material;
		const scope = this.scope;

		let node = null;

		if ( scope === ExtendedMaterialNode.NORMAL ) {

			node = material.normalMap ? normalMap( this.getTexture( 'normalMap' ), materialReference( 'normalScale', 'vec2' ) ) : normalView;

		}

		return node || super.construct( builder );

	}

}

ExtendedMaterialNode.NORMAL = 'normal';

export default ExtendedMaterialNode;

export const materialNormal = nodeImmutable( ExtendedMaterialNode, ExtendedMaterialNode.NORMAL );

addNodeClass( ExtendedMaterialNode );
