/**
 * @author sunag / http://www.sunag.com.br/
 */

import { TempNode } from '../core/TempNode.js';

function BlinnShininessExponentNode() {

	TempNode.call( this, 'f' );

};

BlinnShininessExponentNode.prototype = Object.create( TempNode.prototype );
BlinnShininessExponentNode.prototype.constructor = BlinnShininessExponentNode;
BlinnShininessExponentNode.prototype.nodeType = "BlinnShininessExponent";

BlinnShininessExponentNode.prototype.generate = function ( builder, output ) {

	if ( builder.isCache( 'clearCoat' ) ) {

		return builder.format( 'Material_ClearCoat_BlinnShininessExponent( material )', this.type, output );

	} else {

		return builder.format( 'Material_BlinnShininessExponent( material )', this.type, output );

	}

};

export { BlinnShininessExponentNode };
