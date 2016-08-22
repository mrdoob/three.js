import { LineSegments } from '../../objects/LineSegments';
import { VertexColors } from '../../constants';
import { LineBasicMaterial } from '../../materials/LineBasicMaterial';
import { Float32Attribute } from '../../core/BufferAttribute';
import { BufferGeometry } from '../../core/BufferGeometry';
import { Color } from '../../math/Color';

/**
 * @author mrdoob / http://mrdoob.com/
 */

function GridHelper( size, divisions, color1, color2 ) {

	divisions = divisions || 1;
	color1 = new Color( color1 !== undefined ? color1 : 0x444444 );
	color2 = new Color( color2 !== undefined ? color2 : 0x888888 );

	var center = divisions / 2;
	var step = ( size * 2 ) / divisions;
	var vertices = [], colors = [];

	for ( var i = 0, j = 0, k = - size; i <= divisions; i ++, k += step ) {

		vertices.push( - size, 0, k, size, 0, k );
		vertices.push( k, 0, - size, k, 0, size );

		var color = i === center ? color1 : color2;

		color.toArray( colors, j ); j += 3;
		color.toArray( colors, j ); j += 3;
		color.toArray( colors, j ); j += 3;
		color.toArray( colors, j ); j += 3;

	}

	var geometry = new BufferGeometry();
	geometry.addAttribute( 'position', new Float32Attribute( vertices, 3 ) );
	geometry.addAttribute( 'color', new Float32Attribute( colors, 3 ) );

	var material = new LineBasicMaterial( { vertexColors: VertexColors } );

	LineSegments.call( this, geometry, material );

}

GridHelper.prototype = Object.create( LineSegments.prototype );
GridHelper.prototype.constructor = GridHelper;

GridHelper.prototype.setColors = function () {

	console.error( 'THREE.GridHelper: setColors() has been deprecated, pass them in the constructor instead.' );

};


export { GridHelper };
