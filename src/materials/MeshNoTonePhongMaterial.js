import { MeshPhongMaterial } from './MeshPhongMaterial.js';

class MeshNoTonePhongMaterial extends MeshPhongMaterial {

	constructor( parameters ) {

		super( parameters );

		this.type = 'MeshNoTonePhongMaterial';

		Object.defineProperty( this, 'toneMapped', {

			get: function () {

				return false;

			},

			set: function () {}

		} );

	}

}

export { MeshNoTonePhongMaterial };
