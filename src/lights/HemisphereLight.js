import { Light } from './Light.js';
import { Color } from '../math/Color.js';
import { Object3D } from '../core/Object3D.js';

class HemisphereLight extends Light {

	constructor( skyColor, groundColor, intensity ) {

		super( skyColor, intensity );

		this.type = 'HemisphereLight';
		Object.defineProperty( this, 'isHemisphereLight', { value: true } );

		this.position.copy( Object3D.DefaultUp );
		this.updateMatrix();

		this.groundColor = new Color( groundColor );

	}

	copy( source ) {

		super.copy( source );

		this.groundColor.copy( source.groundColor );

		return this;

	}

}

export { HemisphereLight };
