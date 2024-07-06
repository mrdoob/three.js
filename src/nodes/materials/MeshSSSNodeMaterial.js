import { addNodeMaterial } from './NodeMaterial.js';
import { transformedNormalView } from '../accessors/NormalNode.js';
import { positionViewDirection } from '../accessors/PositionNode.js';
import PhysicalLightingModel from '../functions/PhysicalLightingModel.js';
import MeshPhysicalNodeMaterial from './MeshPhysicalNodeMaterial.js';
import { float, vec3 } from '../shadernode/ShaderNode.js';

class SSSLightingModel extends PhysicalLightingModel {

	constructor( useClearcoat, useSheen, useIridescence, useSSS ) {

		super( useClearcoat, useSheen, useIridescence );

		this.useSSS = useSSS;

	}

	direct( { lightDirection, lightColor, reflectedLight }, stack, builder ) {

		if ( this.useSSS === true ) {

			const material = builder.material;

			const { thicknessColorNode, thicknessDistortionNode, thicknessAmbientNode, thicknessAttenuationNode, thicknessPowerNode, thicknessScaleNode } = material;

			const scatteringHalf = lightDirection.add( transformedNormalView.mul( thicknessDistortionNode ) ).normalize();
			const scatteringDot = float( positionViewDirection.dot( scatteringHalf.negate() ).saturate().pow( thicknessPowerNode ).mul( thicknessScaleNode ) );
			const scatteringIllu = vec3( scatteringDot.add( thicknessAmbientNode ).mul( thicknessColorNode ) );

			reflectedLight.directDiffuse.addAssign( scatteringIllu.mul( thicknessAttenuationNode.mul( lightColor ) ) );

		}

		super.direct( { lightDirection, lightColor, reflectedLight }, stack, builder );

	}

}

class MeshSSSNodeMaterial extends MeshPhysicalNodeMaterial {

	constructor( parameters ) {

		super( parameters );

		this.thicknessColorNode = null;
		this.thicknessDistortionNode = float( 0.1 );
		this.thicknessAmbientNode = float( 0.0 );
		this.thicknessAttenuationNode = float( .1 );
		this.thicknessPowerNode = float( 2.0 );
		this.thicknessScaleNode = float( 10.0 );

	}

	get useSSS() {

		return this.thicknessColorNode !== null;

	}

	setupLightingModel( /*builder*/ ) {

		return new SSSLightingModel( this.useClearcoat, this.useSheen, this.useIridescence, this.useSSS );

	}

	copy( source ) {

		this.thicknessColorNode = source.thicknessColorNode;
		this.thicknessDistortionNode = source.thicknessDistortionNode;
		this.thicknessAmbientNode = source.thicknessAmbientNode;
		this.thicknessAttenuationNode = source.thicknessAttenuationNode;
		this.thicknessPowerNode = source.thicknessPowerNode;
		this.thicknessScaleNode = source.thicknessScaleNode;

		return super.copy( source );

	}

}

export default MeshSSSNodeMaterial;

addNodeMaterial( 'MeshSSSNodeMaterial', MeshSSSNodeMaterial );
