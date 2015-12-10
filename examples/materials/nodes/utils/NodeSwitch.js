/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.NodeSwitch = function( a, component ) {
	
	THREE.NodeGL.call( this, 'fv1' );
	
	this.component = component || 'x';
	
	this.a = a;
	
};

THREE.NodeSwitch.prototype = Object.create( THREE.NodeGL.prototype );
THREE.NodeSwitch.prototype.constructor = THREE.NodeSwitch;

THREE.NodeSwitch.prototype.getType = function( builder ) {
	
	return builder.getFormatByLength( this.component.length );
	
};

THREE.NodeSwitch.prototype.generate = function( builder, output ) {
	
	var type = this.a.getType( builder );
	var inputLength = builder.getFormatLength( type ) - 1;
		
	var a = this.a.build( builder, type );
	
	var outputLength = 0;
	
	var i, len = this.component.length;
	
	// get max length
	
	for (i = 0; i < len; i++) {
		
		outputLength = Math.max( outputLength, builder.getElementIndex( this.component.charAt(i) ) );
		
	}
	
	if (outputLength > inputLength) outputLength = inputLength;
	
	// build switch
	
	a += '.';
	
	for (i = 0; i < len; i++) {
		
		var elm = this.component.charAt(i);
		var idx = builder.getElementIndex( this.component.charAt(i) );
		
		if (idx > outputLength) idx = outputLength;
		
		if (builder.getElementByIndex( idx ) == undefined) {
			console.log( builder.getElementByIndex( idx ) );
		}
		
		a += builder.getElementByIndex( idx );
		
	}
	
	return builder.format( a, this.type, output );

};