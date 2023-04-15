import { Color } from '../math/Color.js';

class RangeFog {

	constructor( color, near = 1, far = 1000 ) {

		this.isRangeFog = true;

		this.name = '';

		this.color = new Color( color );

		this.near = near;
		this.far = far;

	}

	clone() {

		return new RangeFog( this.color, this.near, this.far );

	}

	toJSON( /* meta */ ) {

		return {
			type: 'RangeFog',
			color: this.color.getHex(),
			near: this.near,
			far: this.far
		};

	}

}

export { RangeFog };
