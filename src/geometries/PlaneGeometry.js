import { Geometry } from '../core/Geometry.js';
import { PlaneBufferGeometry } from './PlaneBufferGeometry.js';

class PlaneGeometry extends Geometry {

	constructor( width, height, widthSegments, heightSegments ) {

		super();

		this.type = 'PlaneGeometry';

		this.parameters = {
			width: width,
			height: height,
			widthSegments: widthSegments,
			heightSegments: heightSegments
		};

		this.fromBufferGeometry( new PlaneBufferGeometry( width, height, widthSegments, heightSegments ) );
		this.mergeVertices();

	}

}

export { PlaneGeometry };
