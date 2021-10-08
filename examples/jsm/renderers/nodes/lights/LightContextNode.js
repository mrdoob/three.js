import ContextNode from '../core/ContextNode.js';
import VarNode from '../core/VarNode.js';
import Vector3Node from '../inputs/Vector3Node.js';
import OperatorNode from '../math/OperatorNode.js';
import { PhysicalLightingModel } from '../functions/BSDFs.js';

class LightContextNode extends ContextNode {

	constructor( node ) {

		super( node );

	}

	getNodeType( /*builder*/ ) {

		return 'vec3';

	}

	generate( builder ) {

		const material = builder.material;

		let lightingModel = null;

		if ( material.isMeshStandardMaterial === true ) {

			lightingModel = PhysicalLightingModel;

		}

		const directDiffuse = new VarNode( new Vector3Node() );
		const directSpecular = new VarNode( new Vector3Node() );

		this.setContextValue( 'directDiffuse', directDiffuse );
		this.setContextValue( 'directSpecular', directSpecular );

		if ( lightingModel !== null ) {

			this.setContextValue( 'lightingModel', lightingModel );

		}

		// add code

		const type = this.getNodeType( builder );

		super.generate( builder, type );

		const totalLight = new OperatorNode( '+', directDiffuse, directSpecular );

		return totalLight.build( builder, type );

	}

}

export default LightContextNode;
