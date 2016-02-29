/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.JoinNode = function( x, y, z, w ) {

	THREE.TempNode.call( this, 'fv1' );

	this.x = x;
	this.y = y;
	this.z = z;
	this.w = w;

};

THREE.JoinNode.inputs = [ 'x', 'y', 'z', 'w' ];

THREE.JoinNode.prototype = Object.create( THREE.TempNode.prototype );
THREE.JoinNode.prototype.constructor = THREE.JoinNode;

THREE.JoinNode.prototype.getNumElements = function() {

	var inputs = THREE.JoinNode.inputs;
	var i = inputs.length;

	while ( i -- ) {

		if ( this[ inputs[ i ] ] !== undefined ) {

			++ i;
			break;

		}

	}

	return Math.max( i, 2 );

};

THREE.JoinNode.prototype.getType = function( builder ) {

	return builder.getFormatByLength( this.getNumElements() );

};

THREE.JoinNode.prototype.generate = function( builder, output ) {

	var material = builder.material;

	var type = this.getType( builder );
	var length = this.getNumElements();

	var inputs = THREE.JoinNode.inputs;
	var outputs = [];

	for ( var i = 0; i < length; i ++ ) {

		var elm = this[ inputs[ i ]];

		outputs.push( elm ? elm.build( builder, 'fv1' ) : '0.' );

	}

	var code = builder.getFormatConstructor( length ) + '(' + outputs.join( ',' ) + ')';

	return builder.format( code, type, output );

};
