import { Geometry } from '../core/Geometry';
import { TorusKnotBufferGeometry } from './TorusKnotBufferGeometry';

/**
 * @author oosmoxiecode
 */

function TorusKnotGeometry( radius, tube, tubularSegments, radialSegments, p, q, heightScale ) {

	Geometry.call( this );

	this.type = 'TorusKnotGeometry';

	this.parameters = {
		radius: radius,
		tube: tube,
		tubularSegments: tubularSegments,
		radialSegments: radialSegments,
		p: p,
		q: q
	};

	if( heightScale !== undefined ) console.warn( 'THREE.TorusKnotGeometry: heightScale has been deprecated. Use .scale( x, y, z ) instead.' );

	this.fromBufferGeometry( new TorusKnotBufferGeometry( radius, tube, tubularSegments, radialSegments, p, q ) );
	this.mergeVertices();

}

TorusKnotGeometry.prototype = Object.create( Geometry.prototype );
TorusKnotGeometry.prototype.constructor = TorusKnotGeometry;


export { TorusKnotGeometry };
