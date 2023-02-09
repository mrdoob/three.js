import NodeMaterial from './NodeMaterial.js';
import { MeshNormalMaterial } from 'three';
import { diffuseColor, transformedNormalView, normalToRGB } from '../shadernode/ShaderNodeElements.js';

const defaultValues = new MeshNormalMaterial();

class MeshNormalNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isMeshNormalNodeMaterial = true;

		this.positionNode = null;

		this.setDefaultValues( defaultValues );

		this.setValues( parameters );

	}

	constructDiffuseColor( builder, stack ) {

		stack.assign( diffuseColor, normalToRGB( transformedNormalView ) );

	}

	copy( source ) {

		this.positionNode = source.positionNode;

		return super.copy( source );

	}

}

export default MeshNormalNodeMaterial;
