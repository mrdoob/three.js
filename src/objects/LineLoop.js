import { Line } from './Line.js';

class LineLoop extends Line {

	constructor( geometry, material ) {

		super( geometry, material );

		this.isLineLoop = true;

		this.type = 'LineLoop';

	}

}

export { LineLoop };
