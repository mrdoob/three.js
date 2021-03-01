import ContextNode from '../core/ContextNode.js';
import { RE_Direct_BlinnPhong } from '../functions/BSDFs.js';

class LightContextNode extends ContextNode {

	constructor( node, material = null ) {

		super( node );
		
		this.material = material;
		
	}

	generate( builder, output ) {

		// use an alternative material if exist
		const material = this.material !== null ? this.material : builder.material;

		let RE_Direct = null;
		
		if ( material.isMeshPhongMaterial === true ) {
			
			RE_Direct = RE_Direct_BlinnPhong;
			
		}
		
		if ( RE_Direct !== null ) {
			
			this.setParameter( 'RE_Direct', RE_Direct );
			
		}
		
		return super.generate( builder, output );
		
	}

}

export default LightContextNode;
