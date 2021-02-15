import { Line } from './Line.js';

class LineLoop extends Line {

	constructor( geometry, material ) {

		super( geometry, material );
		this.type = 'LineLoop';
		this.isLineLoop = true;

	}



}


export { LineLoop };
