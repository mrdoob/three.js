import { clearcoat, clearcoatRoughness, sheen, sheenRoughness, iridescence, iridescenceIOR, iridescenceThickness, specularColor, specularF90, diffuseColor, metalness, roughness, anisotropy, alphaT, anisotropyT, anisotropyB, ior, transmission, thickness, attenuationDistance, attenuationColor, dispersion } from '../../nodes/core/PropertyNode.js';
import { materialClearcoat, materialClearcoatRoughness, materialClearcoatNormal, materialSheen, materialSheenRoughness, materialIridescence, materialIridescenceIOR, materialIridescenceThickness, materialSpecularIntensity, materialSpecularColor, materialAnisotropy, materialIOR, materialTransmission, materialThickness, materialAttenuationDistance, materialAttenuationColor, materialDispersion } from '../../nodes/accessors/MaterialNode.js';
import { float, vec2, vec3, If } from '../../nodes/tsl/TSLBase.js';
import getRoughness from '../../nodes/functions/material/getRoughness.js';
import { TBNViewMatrix } from '../../nodes/accessors/AccessorsUtils.js';
import PhysicalLightingModel from '../../nodes/functions/PhysicalLightingModel.js';
import MeshStandardNodeMaterial from './MeshStandardNodeMaterial.js';
import { mix, pow2, min } from '../../nodes/math/MathNode.js';

import { MeshPhysicalMaterial } from '../MeshPhysicalMaterial.js';

const _defaultValues = /*@__PURE__*/ new MeshPhysicalMaterial();

class MeshPhysicalNodeMaterial extends MeshStandardNodeMaterial {

	static get type() {

		return 'MeshPhysicalNodeMaterial';

	}

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

		this.iorNode = null;
		this.transmissionNode = null;
		this.thicknessNode = null;
		this.attenuationDistanceNode = null;
		this.attenuationColorNode = null;
		this.dispersionNode = null;

		this.anisotropyNode = null;

		this.setDefaultValues( _defaultValues );

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

	get useAnisotropy() {

		return this.anisotropy > 0 || this.anisotropyNode !== null;

	}

	get useTransmission() {

		return this.transmission > 0 || this.transmissionNode !== null;

	}

	get useDispersion() {

		return this.dispersion > 0 || this.dispersionNode !== null;

	}

	setupSpecular() {

		const iorNode = this.iorNode ? float( this.iorNode ) : materialIOR;

		ior.assign( iorNode );
		specularColor.assign( mix( min( pow2( ior.sub( 1.0 ).div( ior.add( 1.0 ) ) ).mul( materialSpecularColor ), vec3( 1.0 ) ).mul( materialSpecularIntensity ), diffuseColor.rgb, metalness ) );
		specularF90.assign( mix( materialSpecularIntensity, 1.0, metalness ) );

	}

	setupLightingModel( /*builder*/ ) {

		return new PhysicalLightingModel( this.useClearcoat, this.useSheen, this.useIridescence, this.useAnisotropy, this.useTransmission, this.useDispersion );

	}

	setupVariants( builder ) {

		super.setupVariants( builder );

		// CLEARCOAT

		if ( this.useClearcoat ) {

			const clearcoatNode = this.clearcoatNode ? float( this.clearcoatNode ) : materialClearcoat;
			const clearcoatRoughnessNode = this.clearcoatRoughnessNode ? float( this.clearcoatRoughnessNode ) : materialClearcoatRoughness;

			clearcoat.assign( clearcoatNode );
			clearcoatRoughness.assign( getRoughness( { roughness: clearcoatRoughnessNode } ) );

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

		// ANISOTROPY

		if ( this.useAnisotropy ) {

			const anisotropyV = ( this.anisotropyNode ? vec2( this.anisotropyNode ) : materialAnisotropy ).toVar();

			anisotropy.assign( anisotropyV.length() );

			If( anisotropy.equal( 0.0 ), () => {

				anisotropyV.assign( vec2( 1.0, 0.0 ) );

			} ).Else( () => {

				anisotropyV.divAssign( vec2( anisotropy ) );
				anisotropy.assign( anisotropy.saturate() );

			} );

			// Roughness along the anisotropy bitangent is the material roughness, while the tangent roughness increases with anisotropy.
			alphaT.assign( anisotropy.pow2().mix( roughness.pow2(), 1.0 ) );

			anisotropyT.assign( TBNViewMatrix[ 0 ].mul( anisotropyV.x ).add( TBNViewMatrix[ 1 ].mul( anisotropyV.y ) ) );
			anisotropyB.assign( TBNViewMatrix[ 1 ].mul( anisotropyV.x ).sub( TBNViewMatrix[ 0 ].mul( anisotropyV.y ) ) );

		}

		// TRANSMISSION

		if ( this.useTransmission ) {

			const transmissionNode = this.transmissionNode ? float( this.transmissionNode ) : materialTransmission;
			const thicknessNode = this.thicknessNode ? float( this.thicknessNode ) : materialThickness;
			const attenuationDistanceNode = this.attenuationDistanceNode ? float( this.attenuationDistanceNode ) : materialAttenuationDistance;
			const attenuationColorNode = this.attenuationColorNode ? vec3( this.attenuationColorNode ) : materialAttenuationColor;

			transmission.assign( transmissionNode );
			thickness.assign( thicknessNode );
			attenuationDistance.assign( attenuationDistanceNode );
			attenuationColor.assign( attenuationColorNode );

			if ( this.useDispersion ) {

				const dispersionNode = this.dispersionNode ? float( this.dispersionNode ) : materialDispersion;

				dispersion.assign( dispersionNode );

			}

		}

	}

	setupClearcoatNormal() {

		return this.clearcoatNormalNode ? vec3( this.clearcoatNormalNode ) : materialClearcoatNormal;

	}

	setup( builder ) {

		builder.context.setupClearcoatNormal = () => this.setupClearcoatNormal( builder );

		super.setup( builder );

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
		this.dispersionNode = source.dispersionNode;

		this.anisotropyNode = source.anisotropyNode;

		return super.copy( source );

	}

}

export default MeshPhysicalNodeMaterial;
