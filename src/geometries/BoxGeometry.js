import { Geometry } from '../core/Geometry.js';
import { BoxBufferGeometry } from './BoxBufferGeometry.js';

class BoxGeometry extends Geometry {

	constructor( width, height, depth, widthSegments, heightSegments, depthSegments ) {

		super();

		this.type = 'BoxGeometry';

		this.parameters = {
			width: width,
			height: height,
			depth: depth,
			widthSegments: widthSegments,
			heightSegments: heightSegments,
			depthSegments: depthSegments
		};

		this.fromBufferGeometry( new BoxBufferGeometry( width, height, depth, widthSegments, heightSegments, depthSegments ) );
		this.mergeVertices();

	}

}

export { BoxGeometry };
