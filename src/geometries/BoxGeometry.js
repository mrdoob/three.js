import { Geometry } from '../core/Geometry';
import { BoxBufferGeometry } from './BoxBufferGeometry';

/**
 * @author mrdoob / http://mrdoob.com/
 * based on http://papervision3d.googlecode.com/svn/trunk/as3/trunk/src/org/papervision3d/objects/primitives/Cube.as
 */

function BoxGeometry( width, height, depth, widthSegments, heightSegments, depthSegments ) {

	Geometry.call( this );

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

BoxGeometry.prototype = Object.create( Geometry.prototype );
BoxGeometry.prototype.constructor = BoxGeometry;


export { BoxGeometry };
