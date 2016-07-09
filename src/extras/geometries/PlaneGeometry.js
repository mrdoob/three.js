import { Geometry } from '../../core/Geometry';
import { PlaneBufferGeometry } from './PlaneBufferGeometry';

/**
 * @author mrdoob / http://mrdoob.com/
 * based on http://papervision3d.googlecode.com/svn/trunk/as3/trunk/src/org/papervision3d/objects/primitives/Plane.as
 */

function PlaneGeometry ( width, height, widthSegments, heightSegments ) {
	this.isPlaneGeometry = this.isGeometry = true;

	Geometry.call( this );

	this.type = 'PlaneGeometry';

	this.parameters = {
		width: width,
		height: height,
		widthSegments: widthSegments,
		heightSegments: heightSegments
	};

	this.fromBufferGeometry( new PlaneBufferGeometry( width, height, widthSegments, heightSegments ) );

};

PlaneGeometry.prototype = Object.create( Geometry.prototype );
PlaneGeometry.prototype.constructor = PlaneGeometry;


export { PlaneGeometry };