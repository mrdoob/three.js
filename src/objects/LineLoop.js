import { Line } from './Line.js';

class LineLoop extends Line {

	constructor( geometry, material ) {

		super( geometry, material );
		this.type = 'LineLoop';
		Object.defineProperty( this, 'isLineLoop', { value: true } );

	}



}


export { LineLoop };
