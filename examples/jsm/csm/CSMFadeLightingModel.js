import { StackedLightingModel } from './StackedLightingModel.js';
import { reference, positionView, float, If, mix, min, pow, vec3, renderGroup } from 'three/tsl';

class CSMFadeLightingModel extends StackedLightingModel {

	direct( { lightDirection, reflectedLight }, stack, builder ) {

		const lightNode = this.lightNode;
		const light = lightNode.light;
		const userData = light.userData;
		const csm = userData.csm;

		const cameraNear = reference( 'near', 'float', csm.camera ).setGroup( renderGroup ).label( 'cameraNear' );
		const shadowFar = reference( 'shadowFar', 'float', csm ).setGroup( renderGroup ).label( 'shadowFar' );

		const linearDepth = positionView.z.div( shadowFar.sub( cameraNear ) ).negate().toVar( 'lDepth' );

		const cascade = reference( 'csmCascade', 'vec2', userData ).label( `cascade_${ userData.csmIndex }` ).setGroup( renderGroup );
		const index = reference( 'csmIndex', 'float', userData ).label( `index_${ userData.csmIndex }` ).setGroup( renderGroup );

		const prevDirectDiffuse = vec3().toVar( 'pdd' );
		const prevDirectSpecular = vec3().toVar( 'pds' );
		const prevIndirectDiffuse = vec3().toVar( 'pid' );
		const prevIndirectSpecular = vec3().toVar( 'pis' );

		const margin = float().toVar( 'margin' );

		const csmX = float().toVar( 'csmX' );
		const csmY = float().toVar( 'csmY' );
		const cascadeCenter = float().toVar( 'cascadeCenter' );

		const lastCascade = userData.csmLastCascade;

		// output from shadowing
		const directLightColor = vec3().toVar( 'dlc' );

		cascadeCenter.assign( cascade.x.add( cascade.y ).div( 2.0 ) );

		const closestEdge = linearDepth.lessThan( cascadeCenter ).select( cascade.x, cascade.y );

		const isLastCascade = index.equal( lastCascade );

		margin.assign( float( 0.25 ).mul( pow( closestEdge, 2.0 ) ) );

		csmX.assign( cascade.x.sub( margin.div( 2.0 ) ) );
		csmY.assign( cascade.y.add( margin.div( 2.0 ) ) );

		const inRange = linearDepth.greaterThanEqual( csmX ).and( linearDepth.lessThan( csmY ).or( isLastCascade ) );

		If( inRange, () => {

			const dist = min( linearDepth.sub( csmX ), csmY.sub( linearDepth ) );
			const ratio = dist.div( margin ).clamp( 0.0, 1.0 );

			const shouldFadeLastCascade = isLastCascade.and( linearDepth.greaterThan( cascadeCenter ) );

			directLightColor.assign( mix( lightNode.baseColorNode, lightNode.shadowColorNode, shouldFadeLastCascade.select( ratio, 1.0 ) ) );

			// save current light

			prevDirectDiffuse.assign( reflectedLight.directDiffuse );
			prevDirectSpecular.assign( reflectedLight.directSpecular );
			prevIndirectDiffuse.assign( reflectedLight.indirectDiffuse );
			prevIndirectSpecular.assign( reflectedLight.indirectSpecular );

			// original direct lighting calculations

			this.lightingModel.direct( { lightDirection, lightColor: directLightColor, reflectedLight }, stack, builder );

			// blend with previous light passes as required

			const shouldNotBlend = index.equal( 0 ).and( linearDepth.lessThan( cascadeCenter ) ).or( index.equal( lastCascade ).and( linearDepth.greaterThan( cascadeCenter ) ) );

			const blendRatio = shouldNotBlend.select( 1.0, ratio );

			reflectedLight.directDiffuse.assign( mix( prevDirectDiffuse, reflectedLight.directDiffuse, blendRatio ) );
			reflectedLight.directSpecular.assign( mix( prevDirectSpecular, reflectedLight.directSpecular, blendRatio ) );
			reflectedLight.indirectDiffuse.assign( mix( prevIndirectDiffuse, reflectedLight.indirectDiffuse, blendRatio ) );
			reflectedLight.indirectSpecular.assign( mix( prevIndirectSpecular, reflectedLight.indirectSpecular, blendRatio ) );

		} );

	}

}

export { CSMFadeLightingModel };
