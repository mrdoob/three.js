import NodeMaterial, { addNodeMaterial } from './NodeMaterial.js';
import { diffuseColor } from '../core/PropertyNode.js';
import { directionToColor } from '../utils/PackingNode.js';
import { materialOpacity } from '../accessors/MaterialNode.js';
import { transformedNormalView } from '../accessors/NormalNode.js';
import { float, vec4 } from '../shadernode/ShaderNode.js';

import { MeshNormalMaterial } from 'three';

const defaultValues = new MeshNormalMaterial();

class MeshNormalNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isMeshNormalNodeMaterial = true;

		this.opacityNode = null;

		this.positionNode = null;

		this.setDefaultValues( defaultValues );

		this.setValues( parameters );

	}

	constructDiffuseColor( builder, stack ) {

		const opacityNode = this.opacityNode ? float( this.opacityNode ) : materialOpacity;

		stack.assign( diffuseColor, vec4( directionToColor( transformedNormalView ), opacityNode ) );

	}

	copy( source ) {

		this.opacityNode = source.opacityNode;

		this.positionNode = source.positionNode;

		return super.copy( source );

	}

}

export default MeshNormalNodeMaterial;

addNodeMaterial( MeshNormalNodeMaterial );
