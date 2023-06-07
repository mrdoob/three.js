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

		if ( scope === ExtendedMaterialNode.NORMAL || scope === ExtendedMaterialNode.CLEARCOAT_NORMAL ) {

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

		} else if ( scope === ExtendedMaterialNode.CLEARCOAT_NORMAL ) {

			node = material.clearcoatNormalMap ? normalMap( this.getTexture( 'clearcoatNormalMap' ), materialReference( 'clearcoatNormalScale', 'vec2' ) ) : normalView;

		}

		return node || super.construct( builder );

	}

}

ExtendedMaterialNode.NORMAL = 'normal';
ExtendedMaterialNode.CLEARCOAT_NORMAL = 'clearcoatNormal';

export default ExtendedMaterialNode;

export const materialNormal = nodeImmutable( ExtendedMaterialNode, ExtendedMaterialNode.NORMAL );
export const materialClearcoatNormal = nodeImmutable( ExtendedMaterialNode, ExtendedMaterialNode.CLEARCOAT_NORMAL );

addNodeClass( ExtendedMaterialNode );
