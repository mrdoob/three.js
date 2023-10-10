import MaterialNode from './MaterialNode.js';
import { materialReference } from './MaterialReferenceNode.js';
import { normalView } from './NormalNode.js';
import { normalMap } from '../display/NormalMapNode.js';
import { bumpMap } from '../display/BumpMapNode.js';
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

	setup( builder ) {

		const material = builder.material;
		const scope = this.scope;

		let node = null;

		if ( scope === ExtendedMaterialNode.NORMAL ) {

			if ( material.normalMap ) {

				node = normalMap( this.getTexture( 'normalMap' ), materialReference( 'normalScale', 'vec2' ) );

			} else if ( material.bumpMap ) {

				node = bumpMap( this.getTexture( 'bumpMap' ).r, materialReference( 'bumpScale', 'float' ) );

			} else {

				node = normalView;

			}

		} else if ( scope === ExtendedMaterialNode.CLEARCOAT_NORMAL ) {

			node = material.clearcoatNormalMap ? normalMap( this.getTexture( 'clearcoatNormalMap' ), materialReference( 'clearcoatNormalScale', 'vec2' ) ) : normalView;

		}

		return node || super.setup( builder );

	}

}

ExtendedMaterialNode.NORMAL = 'normal';
ExtendedMaterialNode.CLEARCOAT_NORMAL = 'clearcoatNormal';

export default ExtendedMaterialNode;

export const materialNormal = nodeImmutable( ExtendedMaterialNode, ExtendedMaterialNode.NORMAL );
export const materialClearcoatNormal = nodeImmutable( ExtendedMaterialNode, ExtendedMaterialNode.CLEARCOAT_NORMAL );

addNodeClass( 'ExtendedMaterialNode', ExtendedMaterialNode );
