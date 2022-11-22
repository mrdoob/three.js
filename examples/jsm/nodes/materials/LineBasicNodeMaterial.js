import NodeMaterial from './NodeMaterial.js';
import { attribute, mul, vec4 } from '../shadernode/ShaderNodeElements.js';
import { LineBasicMaterial } from 'three';

const defaultValues = new LineBasicMaterial();

class LineBasicNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isLineBasicNodeMaterial = true;

		this.colorNode = null;
		this.opacityNode = null;

		this.alphaTestNode = null;

		this.lightNode = null;

		this.positionNode = null;

		this.setDefaultValues( defaultValues );

		this.setValues( parameters );

	}

	generateDiffuseColor( builder ) {

		let { diffuseColorNode } = super.generateDiffuseColor( builder );

		if ( this.vertexColors === true && builder.geometry.hasAttribute( 'color' ) ) {

			diffuseColorNode = vec4( mul( diffuseColorNode.xyz, attribute( 'color' ) ), diffuseColorNode.a );

		}

		return { diffuseColorNode };

	}

	copy( source ) {

		this.colorNode = source.colorNode;
		this.opacityNode = source.opacityNode;

		this.alphaTestNode = source.alphaTestNode;

		this.lightNode = source.lightNode;

		this.positionNode = source.positionNode;

		return super.copy( source );

	}

}

export default LineBasicNodeMaterial;
