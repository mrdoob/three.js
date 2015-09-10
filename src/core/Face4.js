/**
 * @author mrdoob / http://mrdoob.com/
 */

module.exports = Face4;

var Face3 = require( "./Face3" );

function Face4( a, b, c, d, normal, color, materialIndex ) {

	console.warn( "Face4 has been removed. A Face3 will be created instead." );
	return new Face3( a, b, c, normal, color, materialIndex );

}
