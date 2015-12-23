/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.SwitchNode = function( node, component ) {

	THREE.GLNode.call( this, 'fv1' );

	this.node = node;
	this.component = component || 'x';

};

THREE.SwitchNode.prototype = Object.create( THREE.GLNode.prototype );
THREE.SwitchNode.prototype.constructor = THREE.SwitchNode;

THREE.SwitchNode.prototype.getType = function( builder ) {

	return builder.getFormatByLength( this.component.length );

};

THREE.SwitchNode.prototype.generate = function( builder, output ) {

	var type = this.node.getType( builder );
	var inputLength = builder.getFormatLength( type ) - 1;

	var node = this.node.build( builder, type );

	var outputLength = 0;

	var i, len = this.component.length;

	// get max length

	for ( i = 0; i < len; i ++ ) {

		outputLength = Math.max( outputLength, builder.getIndexByElement( this.component.charAt( i ) ) );

	}

	if ( outputLength > inputLength ) outputLength = inputLength;

	// build switch

	node += '.';

	for ( i = 0; i < len; i ++ ) {

		var elm = this.component.charAt( i );
		var idx = builder.getIndexByElement( this.component.charAt( i ) );

		if ( idx > outputLength ) idx = outputLength;

		if ( builder.getElementByIndex( idx ) == undefined ) {

			console.log( builder.getElementByIndex( idx ) );

		}

		node += builder.getElementByIndex( idx );

	}

	return builder.format( node, this.getType( builder ), output );

};
