/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.SwitchNode = function( node, components ) {

	THREE.GLNode.call( this, 'fv1' );

	this.node = node;
	this.components = components || 'x';

};

THREE.SwitchNode.prototype = Object.create( THREE.GLNode.prototype );
THREE.SwitchNode.prototype.constructor = THREE.SwitchNode;

THREE.SwitchNode.prototype.getType = function( builder ) {

	return builder.getFormatByLength( this.components.length );

};

THREE.SwitchNode.prototype.generate = function( builder, output ) {

	var type = this.node.getType( builder );
	var inputLength = builder.getFormatLength( type ) - 1;
	var components = builder.colorToVector( this.components );

	var node = this.node.build( builder, type );

	var outputLength = 0;

	var i, len = components.length;

	// get max length

	for ( i = 0; i < len; i ++ ) {

		outputLength = Math.max( outputLength, builder.getIndexByElement( components.charAt( i ) ) );

	}

	if ( outputLength > inputLength ) outputLength = inputLength;

	// build switch

	node += '.';

	for ( i = 0; i < len; i ++ ) {

		var elm = components.charAt( i );
		var idx = builder.getIndexByElement( components.charAt( i ) );

		if ( idx > outputLength ) idx = outputLength;

		if ( builder.getElementByIndex( idx ) == undefined ) {

			console.log( builder.getElementByIndex( idx ) );

		}

		node += builder.getElementByIndex( idx );

	}

	return builder.format( node, this.getType( builder ), output );

};
