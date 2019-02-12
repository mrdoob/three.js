import { Line } from './Line.js';

/**
 * @author mgreter / http://github.com/mgreter
 */

function LineLoop( geometry, material ) {

	Line.call( this, geometry, material );

	this.type = 'LineLoop';

}

LineLoop.prototype = Object.assign( Object.create( Line.prototype ), {

	constructor: LineLoop,

	isLineLoop: true,

} );


export { LineLoop };
