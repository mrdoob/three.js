import { Geometry } from '../core/Geometry';
import { TubeBufferGeometry } from './TubeBufferGeometry';

/**
 * @author oosmoxiecode / https://github.com/oosmoxiecode
 * @author WestLangley / https://github.com/WestLangley
 * @author zz85 / https://github.com/zz85
 * @author miningold / https://github.com/miningold
 * @author jonobr1 / https://github.com/jonobr1
 *
 * Creates a tube which extrudes along a 3d spline.
 */

function TubeGeometry( path, tubularSegments, radius, radialSegments, closed, taper ) {

	Geometry.call( this );

	this.type = 'TubeGeometry';

	this.parameters = {
		path: path,
		tubularSegments: tubularSegments,
		radius: radius,
		radialSegments: radialSegments,
		closed: closed
	};

	if ( taper !== undefined ) console.warn( 'THREE.TubeGeometry: taper has been removed.' );

	var bufferGeometry = new TubeBufferGeometry( path, tubularSegments, radius, radialSegments, closed );

	// expose internals

	this.tangents = bufferGeometry.tangents;
	this.normals = bufferGeometry.normals;
	this.binormals = bufferGeometry.binormals;

	// create geometry

	this.fromBufferGeometry( bufferGeometry );
	this.mergeVertices();

}

TubeGeometry.prototype = Object.create( Geometry.prototype );
TubeGeometry.prototype.constructor = TubeGeometry;


export { TubeGeometry };
