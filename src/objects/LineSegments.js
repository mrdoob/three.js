import { Line } from './Line';

/**
 * @author mrdoob / http://mrdoob.com/
 */

function LineSegments ( geometry, material ) {
	this.isLineSegments = true;

	Line.call( this, geometry, material );

	this.type = 'LineSegments';

};

LineSegments.prototype = Object.assign( Object.create( Line.prototype ), {

	constructor: LineSegments

} );


export { LineSegments };