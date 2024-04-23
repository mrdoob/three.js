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

		return {
			type: 'Fog',
			name: this.name,
			color: this.color.getHex(),
			near: this.near,
			far: this.far
		};

	}

}

export { Fog };
