/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.SwitchNode = function( a, component ) {

	THREE.GLNode.call( this, 'fv1' );

	this.component = component || 'x';

	this.a = a;

};

THREE.SwitchNode.prototype = Object.create( THREE.GLNode.prototype );
THREE.SwitchNode.prototype.constructor = THREE.SwitchNode;

THREE.SwitchNode.prototype.getType = function( builder ) {

	return builder.getFormatByLength( this.component.length );

};

THREE.SwitchNode.prototype.generate = function( builder, output ) {

	var type = this.a.getType( builder );
	var inputLength = builder.getFormatLength( type ) - 1;

	var a = this.a.build( builder, type );

	var outputLength = 0;

	var i, len = this.component.length;

	// get max length

	for ( i = 0; i < len; i ++ ) {

		outputLength = Math.max( outputLength, builder.getElementIndex( this.component.charAt( i ) ) );

	}

	if ( outputLength > inputLength ) outputLength = inputLength;

	// build switch

	a += '.';

	for ( i = 0; i < len; i ++ ) {

		var elm = this.component.charAt( i );
		var idx = builder.getElementIndex( this.component.charAt( i ) );

		if ( idx > outputLength ) idx = outputLength;

		if ( builder.getElementByIndex( idx ) == undefined ) {

			console.log( builder.getElementByIndex( idx ) );

		}

		a += builder.getElementByIndex( idx );

	}

	return builder.format( a, this.getType( builder ), output );

};
