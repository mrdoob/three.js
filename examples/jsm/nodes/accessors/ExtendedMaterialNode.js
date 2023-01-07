import MaterialNode from './MaterialNode.js';
import NormalMapNode from '../display/NormalMapNode.js';

import {
	normalView, materialReference
} from '../shadernode/ShaderNodeElements.js';

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

			node = material.normalMap ? new NormalMapNode( this.getTexture( 'normalMap' ), materialReference( 'normalScale', 'vec2' ) ) : normalView;

		}

		return node || super.construct( builder );

	}

}

ExtendedMaterialNode.NORMAL = 'normal';

export default ExtendedMaterialNode;
