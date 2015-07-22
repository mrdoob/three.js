/**
 *
 * A Track base class that has a getAt function and name handling.
 *
 * TODO: Add support for bone indices via a number rather than a name?
 * TODO: Add support for explicitly setting the nodeName and propertyName?
 * 
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 */

THREE.Track = function ( name ) {

	this.name = name;

	var nodeName = "";
	var propertyName = "";

	if( name.indexOf( '.') >= 0 ) {
		var nameTokens = name.split( '.' );
		if( nameTokens.length > 1 ) {
			nodeName = nameTokens[0];
		}
		if( nameTokens.length > 2 ) {
			propertyName = nameTokens[1];
		}
	}

	if( nodeName.indexOf( '/' ) >= 0 ) {
		var nodeNameTokens = nodeName.split( '/' );
		if( nameTokens.length > 1 ) {
			nodeName = nameTokens[nameTokens.length - 1];
		}		
	}

	this.nodeName = nodeName;
	this.propertyName = propertyName;

};

THREE.Track.prototype = {

	constructor: THREE.Track,

	getAt: function( time ) {

		return null;

	}

};