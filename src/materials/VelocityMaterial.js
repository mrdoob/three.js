import { Material } from './Material.js';
import { Matrix4 } from '../math/Matrix4.js';

class VelocityMaterial extends Material {

	constructor( parameters ) {

		super();

		this.isVelocityMaterial = true;

		this.type = 'VelocityMaterial';

		this.previousModelMatrix = new Matrix4();
		this.previousViewMatrices = [ new Matrix4(), new Matrix4() ];
		this.previousInstanceMatrix = null;

		this.setValues( parameters );

	}

	copy( source ) {

		super.copy( source );

		return this;

	}

}

export { VelocityMaterial };
