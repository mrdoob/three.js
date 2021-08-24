import ContextNode from '../core/ContextNode.js';
import StructNode from '../core/StructNode.js';
import { PhysicalLightingModel } from '../functions/BSDFs.js';

const reflectedLightStruct = new StructNode( {
	directDiffuse: 'vec3',
	directSpecular: 'vec3'
}, 'ReflectedLight' );

class LightContextNode extends ContextNode {

	constructor( node ) {

		super( node, 'vec3' );

	}

	generate( builder, output ) {

		const type = this.getType( builder );

		const material = builder.material;

		let lightingModel = null;

		if ( material.isMeshStandardMaterial === true ) {

			lightingModel = PhysicalLightingModel;

		}

		const reflectedLightNode = reflectedLightStruct.create();
		const reflectedLight = reflectedLightNode.build( builder, 'var' );

		this.setContextValue( 'reflectedLight', reflectedLightNode );

		if ( lightingModel !== null ) {

			this.setContextValue( 'lightingModel', lightingModel );

		}

		const totalLightSnippet = `( ${reflectedLight}.directDiffuse + ${reflectedLight}.directSpecular )`;

		// add code

		super.generate( builder, output );

		return builder.format( totalLightSnippet, type, output );

	}

}

export default LightContextNode;
