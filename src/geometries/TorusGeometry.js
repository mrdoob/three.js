import { Geometry } from '../core/Geometry';
import { TorusBufferGeometry } from './TorusBufferGeometry';

/**
 * @author oosmoxiecode
 * @author mrdoob / http://mrdoob.com/
 * based on http://code.google.com/p/away3d/source/browse/trunk/fp10/Away3DLite/src/away3dlite/primitives/Torus.as?r=2888
 */

function TorusGeometry( radius, tube, radialSegments, tubularSegments, arc ) {

	Geometry.call( this );

	this.type = 'TorusGeometry';

	this.parameters = {
		radius: radius,
		tube: tube,
		radialSegments: radialSegments,
		tubularSegments: tubularSegments,
		arc: arc
	};

	this.fromBufferGeometry( new TorusBufferGeometry( radius, tube, radialSegments, tubularSegments, arc ) );

}

TorusGeometry.prototype = Object.create( Geometry.prototype );
TorusGeometry.prototype.constructor = TorusGeometry;


export { TorusGeometry };
