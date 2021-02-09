import { Light } from './Light.js';
import { DirectionalLightShadow } from './DirectionalLightShadow.js';
import { Object3D } from '../core/Object3D.js';

class DirectionalLight extends Light {

	constructor( color, intensity ) {

		super( color, intensity );

		Object.defineProperty( this, 'isDirectionalLight', { value: true } );

		this.type = 'DirectionalLight';

		this.position.copy( Object3D.DefaultUp );
		this.updateMatrix();

		this.target = new Object3D();

		this.shadow = new DirectionalLightShadow();

	}

	copy( source ) {

		super.copy( source );

		this.target = source.target.clone();
		this.shadow = source.shadow.clone();

		return this;

	}

}

export { DirectionalLight };
