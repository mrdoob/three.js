/**
 * @author mrdoob / http://mrdoob.com/
 */

module.exports = GridHelper;

var Constants = require( "../../Constants" ),
	Geometry = require( "../../core/Geometry" ),
	LineBasicMaterial = require( "../../materials/LineBasicMaterial" ),
	Color = require( "../../math/Color" ),
	Vector3 = require( "../../math/Vector3" ),
	LineSegments = require( "../../objects/LineSegments" );

function GridHelper( size, step ) {

	var geometry = new Geometry();
	var material = new LineBasicMaterial( { vertexColors: Constants.VertexColors } );

	this.color1 = new Color( 0x444444 );
	this.color2 = new Color( 0x888888 );

	for ( var i = - size; i <= size; i += step ) {

		geometry.vertices.push(
			new Vector3( - size, 0, i ), new Vector3( size, 0, i ),
			new Vector3( i, 0, - size ), new Vector3( i, 0, size )
		);

		var color = i === 0 ? this.color1 : this.color2;

		geometry.colors.push( color, color, color, color );

	}

	LineSegments.call( this, geometry, material );

}

GridHelper.prototype = Object.create( LineSegments.prototype );
GridHelper.prototype.constructor = GridHelper;

GridHelper.prototype.setColors = function( colorCenterLine, colorGrid ) {

	this.color1.set( colorCenterLine );
	this.color2.set( colorGrid );

	this.geometry.colorsNeedUpdate = true;

};
