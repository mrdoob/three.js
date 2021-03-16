import { Color } from '../math/Color.js';

class Fog {

	constructor( color, near, far ) {

		this.name = '';

		this.color = new Color( color );

		this.near = ( near !== undefined ) ? near : 1;
		this.far = ( far !== undefined ) ? far : 1000;

	}

	clone() {

		return new Fog( this.color, this.near, this.far );

	}

	toJSON( /* meta */ ) {

		return {
			type: 'Fog',
			color: this.color.getHex(),
			near: this.near,
			far: this.far
		};

	}

}

Fog.prototype.isFog = true;

export { Fog };
