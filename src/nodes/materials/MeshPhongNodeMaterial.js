import NodeMaterial, { addNodeMaterial } from './NodeMaterial.js';
import { shininess, specularColor } from '../core/PropertyNode.js';
import { materialShininess, materialSpecular } from '../accessors/MaterialNode.js';
import { float } from '../shadernode/ShaderNode.js';
import BasicEnvironmentNode from '../lighting/BasicEnvironmentNode.js';
import PhongLightingModel from '../functions/PhongLightingModel.js';

import { MeshPhongMaterial } from '../../materials/MeshPhongMaterial.js';

const _defaultValues = /*@__PURE__*/ new MeshPhongMaterial();

class MeshPhongNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isMeshPhongNodeMaterial = true;

		this.lights = true;

		this.shininessNode = null;
		this.specularNode = null;

		this.setDefaultValues( _defaultValues );

		this.setValues( parameters );

	}

	setupEnvironment( builder ) {

		const envNode = super.setupEnvironment( builder );

		return envNode ? new BasicEnvironmentNode( envNode ) : null;

	}
	setupLightingModel( /*builder*/ ) {

		return new PhongLightingModel();

	}

	setupVariants() {

		// SHININESS

		const shininessNode = ( this.shininessNode ? float( this.shininessNode ) : materialShininess ).max( 1e-4 ); // to prevent pow( 0.0, 0.0 )

		shininess.assign( shininessNode );

		// SPECULAR COLOR

		const specularNode = this.specularNode || materialSpecular;

		specularColor.assign( specularNode );

	}

	copy( source ) {

		this.shininessNode = source.shininessNode;
		this.specularNode = source.specularNode;

		return super.copy( source );

	}

}

export default MeshPhongNodeMaterial;

addNodeMaterial( 'MeshPhongNodeMaterial', MeshPhongNodeMaterial );
