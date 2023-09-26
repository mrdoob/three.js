import { addNodeMaterial } from './NodeMaterial.js';
import { transformedClearcoatNormalView } from '../accessors/NormalNode.js';
import { clearcoat, clearcoatRoughness, sheen, sheenRoughness, iridescence, iridescenceIOR, iridescenceThickness } from '../core/PropertyNode.js';
import { materialClearcoatNormal } from '../accessors/ExtendedMaterialNode.js';
import { materialClearcoat, materialClearcoatRoughness, materialSheen, materialSheenRoughness, materialIridescence, materialIridescenceIOR, materialIridescenceThickness } from '../accessors/MaterialNode.js';
import { float, vec3 } from '../shadernode/ShaderNode.js';
import PhysicalLightingModel from '../functions/PhysicalLightingModel.js';
import MeshStandardNodeMaterial from './MeshStandardNodeMaterial.js';

import { MeshPhysicalMaterial } from 'three';

const defaultValues = new MeshPhysicalMaterial();

class MeshPhysicalNodeMaterial extends MeshStandardNodeMaterial {

	constructor( parameters ) {

		super();

		this.isMeshPhysicalNodeMaterial = true;

		this.clearcoatNode = null;
		this.clearcoatRoughnessNode = null;
		this.clearcoatNormalNode = null;

		this.sheenNode = null;
		this.sheenRoughnessNode = null;

		this.iridescenceNode = null;
		this.iridescenceIORNode = null;
		this.iridescenceThicknessNode = null;

		this.specularIntensityNode = null;
		this.specularColorNode = null;

		this.transmissionNode = null;
		this.thicknessNode = null;
		this.attenuationDistanceNode = null;
		this.attenuationColorNode = null;

		this.setDefaultValues( defaultValues );

		this.setValues( parameters );

	}

	setupLightingModel( /*builder*/ ) {

		return new PhysicalLightingModel(); // @TODO: Optimize shader using parameters.

	}

	setupVariants( builder ) {

		super.setupVariants( builder );

		const { stack } = builder;

		// CLEARCOAT

		const clearcoatNode = this.clearcoatNode ? float( this.clearcoatNode ) : materialClearcoat;
		const clearcoatRoughnessNode = this.clearcoatRoughnessNode ? float( this.clearcoatRoughnessNode ) : materialClearcoatRoughness;

		stack.assign( clearcoat, clearcoatNode );
		stack.assign( clearcoatRoughness, clearcoatRoughnessNode );

		// SHEEN

		const sheenNode = this.sheenNode ? vec3( this.sheenNode ) : materialSheen;
		const sheenRoughnessNode = this.sheenRoughnessNode ? float( this.sheenRoughnessNode ) : materialSheenRoughness;

		stack.assign( sheen, sheenNode );
		stack.assign( sheenRoughness, sheenRoughnessNode );

		// IRIDESCENCE

		const iridescenceNode = this.iridescenceNode ? float( this.iridescenceNode ) : materialIridescence;
		const iridescenceIORNode = this.iridescenceIORNode ? float( this.iridescenceIORNode ) : materialIridescenceIOR;
		const iridescenceThicknessNode = this.iridescenceThicknessNode ? float( this.iridescenceThicknessNode ) : materialIridescenceThickness;

		stack.assign( iridescence, iridescenceNode );
		stack.assign( iridescenceIOR, iridescenceIORNode );
		stack.assign( iridescenceThickness, iridescenceThicknessNode );

	}

	setupNormal( builder ) {

		super.setupNormal( builder );

		// CLEARCOAT NORMAL

		const clearcoatNormalNode = this.clearcoatNormalNode ? vec3( this.clearcoatNormalNode ) : materialClearcoatNormal;

		builder.stack.assign( transformedClearcoatNormalView, clearcoatNormalNode );

	}

	copy( source ) {

		this.clearcoatNode = source.clearcoatNode;
		this.clearcoatRoughnessNode = source.clearcoatRoughnessNode;
		this.clearcoatNormalNode = source.clearcoatNormalNode;

		this.sheenNode = source.sheenNode;
		this.sheenRoughnessNode = source.sheenRoughnessNode;

		this.iridescenceNode = source.iridescenceNode;
		this.iridescenceIORNode = source.iridescenceIORNode;
		this.iridescenceThicknessNode = source.iridescenceThicknessNode;

		this.specularIntensityNode = source.specularIntensityNode;
		this.specularColorNode = source.specularColorNode;

		this.transmissionNode = source.transmissionNode;
		this.thicknessNode = source.thicknessNode;
		this.attenuationDistanceNode = source.attenuationDistanceNode;
		this.attenuationColorNode = source.attenuationColorNode;

		return super.copy( source );

	}

}

export default MeshPhysicalNodeMaterial;

addNodeMaterial( 'MeshPhysicalNodeMaterial', MeshPhysicalNodeMaterial );
