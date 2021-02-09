import { Light } from './Light.js';

class RectAreaLight extends Light {

	constructor( color, intensity, width = 10, height = 10 ) {

		super( color, intensity );

		Object.defineProperty( this, 'isRectAreaLight', { value: true } );

		this.type = 'RectAreaLight';

		this.width = width;
		this.height = height;

	}

	copy( source ) {

		super.copy( source );

		this.width = source.width;
		this.height = source.height;

		return this;

	}

	toJSON( meta ) {

		const data = super.toJSON( meta );

		data.object.width = this.width;
		data.object.height = this.height;

		return data;

	}

}

export { RectAreaLight };
