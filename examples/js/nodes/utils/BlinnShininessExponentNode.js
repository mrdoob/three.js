/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.BlinnShininessExponentNode = function () {

	THREE.TempNode.call( this, 'fv1' );

};

THREE.BlinnShininessExponentNode.prototype = Object.create( THREE.TempNode.prototype );
THREE.BlinnShininessExponentNode.prototype.constructor = THREE.BlinnShininessExponentNode;
THREE.BlinnShininessExponentNode.prototype.nodeType = "BlinnShininessExponent";

THREE.BlinnShininessExponentNode.prototype.generate = function ( builder, output ) {

	if ( builder.isCache( 'clearCoat' ) ) {

		return builder.format( 'Material_ClearCoat_BlinnShininessExponent( material )', this.type, output );

	} else {

		return builder.format( 'Material_BlinnShininessExponent( material )', this.type, output );

	}

};
