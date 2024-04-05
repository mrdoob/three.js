import { addNodeMaterial } from './NodeMaterial.js';
import { transformedClearcoatNormalView } from '../accessors/NormalNode.js';
import { clearcoat, clearcoatRoughness, sheen, sheenRoughness, iridescence, iridescenceIOR, iridescenceThickness, specularColor, specularF0, diffuseColor, metalness } from '../core/PropertyNode.js';
import { materialClearcoat, materialClearcoatRoughness, materialClearcoatNormal, materialSheen, materialSheenRoughness, materialIridescence, materialIridescenceIOR, materialIridescenceThickness, materialSpecularIntensity, materialSpecularColor2 } from '../accessors/MaterialNode.js';
import { float, vec3 } from '../shadernode/ShaderNode.js';
import PhysicalLightingModel from '../functions/PhysicalLightingModel.js';
import MeshStandardNodeMaterial from './MeshStandardNodeMaterial.js';
import { mix, pow2, min } from '../math/MathNode.js';
import { materialReference } from '../accessors/MaterialReferenceNode.js';
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

	get useTransmission() {

		return this.transmission > 0 || this.transmissionNode !== null;

	}

	setupSpecularColor() {

		const materialIOR = materialReference( 'ior', 'float' );

		specularColor.assign( mix( min( pow2( materialIOR.sub( 1.0 ).div( materialIOR.add( 1.0 ) ) ).mul( materialSpecularColor2 ), vec3( 1.0 ) ).mul( materialSpecularIntensity ), diffuseColor.rgb, metalness ) );
		specularF0.assign( mix( materialSpecularIntensity, 1.0, metalness ) );

	}

	setupLightingModel( /*builder*/ ) {

		return new PhysicalLightingModel( this.useClearcoat, this.useSheen, this.useIridescence, this.useTransmission );

	}

	setupVariants( builder ) {

		super.setupVariants( builder );

		// CLEARCOAT

		if ( this.useClearcoat ) {

			const clearcoatNode = this.clearcoatNode ? float( this.clearcoatNode ) : materialClearcoat;
			const clearcoatRoughnessNode = this.clearcoatRoughnessNode ? float( this.clearcoatRoughnessNode ) : materialClearcoatRoughness;

			clearcoat.assign( clearcoatNode );
			clearcoatRoughness.assign( clearcoatRoughnessNode );

		}

		// SHEEN

		if ( this.useSheen ) {

			const sheenNode = this.sheenNode ? vec3( this.sheenNode ) : materialSheen;
			const sheenRoughnessNode = this.sheenRoughnessNode ? float( this.sheenRoughnessNode ) : materialSheenRoughness;

			sheen.assign( sheenNode );
			sheenRoughness.assign( sheenRoughnessNode );

		}

		// IRIDESCENCE

		if ( this.useIridescence ) {

			const iridescenceNode = this.iridescenceNode ? float( this.iridescenceNode ) : materialIridescence;
			const iridescenceIORNode = this.iridescenceIORNode ? float( this.iridescenceIORNode ) : materialIridescenceIOR;
			const iridescenceThicknessNode = this.iridescenceThicknessNode ? float( this.iridescenceThicknessNode ) : materialIridescenceThickness;

			iridescence.assign( iridescenceNode );
			iridescenceIOR.assign( iridescenceIORNode );
			iridescenceThickness.assign( iridescenceThicknessNode );

		}

	}

	setupNormal( builder ) {

		super.setupNormal( builder );

		// CLEARCOAT NORMAL

		const clearcoatNormalNode = this.clearcoatNormalNode ? vec3( this.clearcoatNormalNode ) : materialClearcoatNormal;

		transformedClearcoatNormalView.assign( clearcoatNormalNode );

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
