import ContextNode from '../core/ContextNode.js';
import VarNode from '../core/VarNode.js';
import UniformNode from '../core/UniformNode.js';
import OperatorNode from '../math/OperatorNode.js';
import { PhysicalLightingModel } from '../functions/BSDFs.js';
import { Vector3 } from 'three';

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

		const directDiffuse = new VarNode( new UniformNode( new Vector3() ), 'DirectDiffuse', 'vec3' );
		const directSpecular = new VarNode( new UniformNode( new Vector3() ), 'DirectSpecular', 'vec3' );

		this.context.directDiffuse = directDiffuse;
		this.context.directSpecular = directSpecular;

		if ( lightingModel !== null ) {

			this.context.lightingModel = lightingModel;

		}

		// add code

		const type = this.getNodeType( builder );

		super.generate( builder, type );

		const totalLight = new OperatorNode( '+', directDiffuse, directSpecular );

		return totalLight.build( builder, type );

	}

}

export default LightContextNode;
