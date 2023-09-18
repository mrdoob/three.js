import { Color } from '../math/Color.js';

class Fog {

	constructor( color, near = 1, far = 1000 ) {

		this.isFog = true;

		this.name = '';

		this.color = new Color( color );

		this.near = near;
		this.far = far;

	}

	clone() {

		return new Fog( this.color, this.near, this.far );

	}

	toJSON( /* meta */ ) {

		const data = {};

		data.type = 'Fog';
		data.color = this.color.getHex();

		if ( this.name !== '' ) data.name = this.name;
		if ( this.near !== 1 ) data.near = this.near;
		if ( this.far !== 1000 ) data.far = this.far;

		return data;

	}

}

export { Fog };
