import { StackedLightingModel } from './StackedLightingModel.js';
import { reference, float, If, renderGroup, positionView } from 'three/tsl';

class CSMLightingModel extends StackedLightingModel {

	direct( { lightDirection, reflectedLight }, stack, builder ) {

		const lightNode = this.lightNode;
		const light = lightNode.light;
		const userData = light.userData;
		const csm = userData.csm;

		const cameraNear = reference( 'near', 'float', csm.camera ).setGroup( renderGroup ).label( 'cameraNear' );
		const shadowFar = reference( 'shadowFar', 'float', csm ).setGroup( renderGroup ).label( 'shadowFar' );

		const linearDepth = positionView.z.div( shadowFar.sub( cameraNear ) ).negate().toVar( 'lDepth' );

		const cascade = reference( 'csmCascade', 'vec2', userData ).setGroup( renderGroup );
		const index = reference( 'csmIndex', 'float', userData ).setGroup( renderGroup );

		If( linearDepth.greaterThanEqual( cascade.x ).and( linearDepth.lessThan( cascade.y ).or( index.equal( float( userData.csmLastCascade ) ) ) ), () => {

			const lightColor = linearDepth.lessThan( cascade.y ).select( lightNode.shadowColorNode, lightNode.baseColorNode );

			this.lightingModel.direct( { lightDirection, lightColor, reflectedLight }, stack, builder );

		} );

	}

}

export { CSMLightingModel };
