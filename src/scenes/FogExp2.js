import { Color } from '../math/Color.js';

class FogExp2 {

	constructor( color, density = 0.00025 ) {

		this.name = '';

		this.color = new Color( color );
		this.density = density;

	}

	clone() {

		return new FogExp2( this.color, this.density );

	}

	toJSON( /* meta */ ) {

		return {
			type: 'FogExp2',
			color: this.color.getHex(),
			density: this.density
		};

	}

}

FogExp2.prototype.isFogExp2 = true;

export { FogExp2 };
