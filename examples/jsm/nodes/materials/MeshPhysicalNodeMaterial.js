import { addNodeMaterial } from './NodeMaterial.js';
import { transformedClearcoatNormalView } from '../accessors/NormalNode.js';
import { clearcoat, clearcoatRoughness, sheen, sheenRoughness, iridescence, iridescenceIOR, iridescenceThickness } from '../core/PropertyNode.js';
import { materialClearcoatNormal } from '../accessors/ExtendedMaterialNode.js';
import { materialClearcoat, materialClearcoatRoughness, materialSheen, materialSheenRoughness, materialIridescence, materialIridescenceIOR, materialIridescenceThickness } from '../accessors/MaterialNode.js';
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

	get useClearcoat() {

		return this.clearcoat > 0 || this.clearcoatNode !== null;

	}

	get useIridescence() {

		return this.iridescence > 0 || this.iridescenceNode !== null;

	}

	get useSheen() {

		return this.sheen > 0 || this.sheenNode !== null;

	}

	setupLightingModel( /*builder*/ ) {

		return new PhysicalLightingModel( this.useClearcoat, this.useSheen, this.useIridescence );

	}

	setupVariants( builder ) {

		super.setupVariants( builder );

		if ( this.useClearcoat ) {

			clearcoat.assign( this.clearcoatNode || materialClearcoat );
			clearcoatRoughness.assign( this.clearcoatRoughnessNode || materialClearcoatRoughness );

		}

		if ( this.useSheen ) {

			sheen.assign( this.sheenNode || materialSheen );
			sheenRoughness.assign( this.sheenRoughnessNode || materialSheenRoughness );

		}

		if ( this.useIridescence ) {

			iridescence.assign( this.iridescenceNode || materialIridescence );
			iridescenceIOR.assign( this.iridescenceIORNode || materialIridescenceIOR );
			iridescenceThickness.assign( this.iridescenceThicknessNode || materialIridescenceThickness );

		}

	}

	setupNormal( builder ) {

		super.setupNormal( builder );

		transformedClearcoatNormalView.assign( this.clearcoatNormalNode || materialClearcoatNormal );

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
