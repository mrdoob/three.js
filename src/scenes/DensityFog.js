import { Color } from '../math/Color.js';

class DensityFog {

	constructor( color, density = 0.00025, squared = true ) {

		this.isDensityFog = true;

		this.name = '';

		this.color = new Color( color );
		this.density = density;

		this.squared = squared;

	}

	clone() {

		return new DensityFog( this.color, this.density, this.squared );

	}

	toJSON( /* meta */ ) {

		return {
			type: 'DensityFog',
			color: this.color.getHex(),
			density: this.density,
			squared: !! this.squared
		};

	}

}

export { DensityFog };
