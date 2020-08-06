import { Object3D } from '../../core/Object3D.js';

class ImmediateRenderObject extends Object3D {

	constructor( material ) {

		super();

		this.material = material;

		this.hasPositions = false;
		this.hasNormals = false;
		this.hasColors = false;
		this.hasUvs = false;

		this.positionArray = null;
		this.normalArray = null;
		this.colorArray = null;
		this.uvArray = null;

		this.count = 0;

		this.isImmediateRenderObject = true;

	}

	render( /* renderCallback */ ) {}

}


export { ImmediateRenderObject };
