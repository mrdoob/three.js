import { Line } from './Line.js';

/**
 * @author mgreter / http://github.com/mgreter
 */

class LineLoop extends Line {

	constructor( geometry, material ) {

		super( geometry, material );

		this.type = 'LineLoop';

	}

}

LineLoop.prototype.isLineLoop = true;


export { LineLoop };
