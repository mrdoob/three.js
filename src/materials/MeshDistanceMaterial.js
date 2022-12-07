import { Material } from './Material.js';

class MeshDistanceMaterial extends Material {

	constructor( parameters ) {

		super();

		this.isMeshDistanceMaterial = true;

		this.type = 'MeshDistanceMaterial';

		this.map = null;

		this.alphaMap = null;

		this.displacementMap = null;
		this.displacementScale = 1;
		this.displacementBias = 0;

		this.setValues( parameters );

	}

	copy( source ) {

		super.copy( source );

		this.map = source.map;

		this.alphaMap = source.alphaMap;

		this.displacementMap = source.displacementMap;
		this.displacementScale = source.displacementScale;
		this.displacementBias = source.displacementBias;

		return this;

	}

}

export { MeshDistanceMaterial };
