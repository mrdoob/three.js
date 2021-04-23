import ContextNode from '../core/ContextNode.js';
import { RE_Direct_BlinnPhong, RE_IndirectDiffuse_BlinnPhong } from '../functions/BSDFs.js';

class LightContextNode extends ContextNode {

	constructor( node ) {

		super( node );

	}

	getType( /*builder*/ ) {

		return 'vec3';

	}

	generate( builder, output ) {

		const type = this.getType( builder );

		const material = builder.material;

		let RE_Direct = null;
		let RE_IndirectDiffuse = null;

		if ( material.isMeshPhongMaterial === true ) {

			RE_Direct = RE_Direct_BlinnPhong;
			RE_IndirectDiffuse = RE_IndirectDiffuse_BlinnPhong;

		}

		if ( RE_Direct !== null ) {

			this.setParameter( 'RE_Direct', RE_Direct );
			this.setParameter( 'RE_IndirectDiffuse', RE_IndirectDiffuse );

		}

		const resetTotalLight = 'Irradiance = vec3( 0.0 ); ReflectedLightDirectDiffuse = vec3( 0.0 ); ReflectedLightDirectSpecular = vec3( 0.0 );';
		const resultTotalLight = 'ReflectedLightDirectDiffuse + ReflectedLightDirectSpecular';

		// include keywords

		builder.getContextParameter( 'keywords' ).include( builder, resetTotalLight );

		// add code

		builder.addFlowCode( resetTotalLight );

		super.generate( builder, output );

		return builder.format( resultTotalLight, type, output );

	}

}

export default LightContextNode;
