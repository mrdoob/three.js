import { BoxGeometry } from './geometries/BoxGeometry.js';
import { CapsuleGeometry } from './geometries/CapsuleGeometry.js';
import { CircleGeometry } from './geometries/CircleGeometry.js';
import { ConeGeometry } from './geometries/ConeGeometry.js';
import { CylinderGeometry } from './geometries/CylinderGeometry.js';
import { DodecahedronGeometry } from './geometries/DodecahedronGeometry.js';
import { ExtrudeGeometry } from './geometries/ExtrudeGeometry.js';
import { IcosahedronGeometry } from './geometries/IcosahedronGeometry.js';
import { LatheGeometry } from './geometries/LatheGeometry.js';
import { OctahedronGeometry } from './geometries/OctahedronGeometry.js';
import { PlaneGeometry } from './geometries/PlaneGeometry.js';
import { PolyhedronGeometry } from './geometries/PolyhedronGeometry.js';
import { RingGeometry } from './geometries/RingGeometry.js';
import { ShapeGeometry } from './geometries/ShapeGeometry.js';
import { SphereGeometry } from './geometries/SphereGeometry.js';
import { TetrahedronGeometry } from './geometries/TetrahedronGeometry.js';
import { TorusGeometry } from './geometries/TorusGeometry.js';
import { TorusKnotGeometry } from './geometries/TorusKnotGeometry.js';
import { TubeGeometry } from './geometries/TubeGeometry.js';

export class BoxBufferGeometry extends BoxGeometry { // @deprecated, r144

	constructor( width, height, depth, widthSegments, heightSegments, depthSegments ) {

		console.warn( 'THREE.BoxBufferGeometry has been renamed to THREE.BoxGeometry.' );
		super( width, height, depth, widthSegments, heightSegments, depthSegments );


	}

}

export class CapsuleBufferGeometry extends CapsuleGeometry { // @deprecated, r144

	constructor( radius, length, capSegments, radialSegments ) {

		console.warn( 'THREE.CapsuleBufferGeometry has been renamed to THREE.CapsuleGeometry.' );
		super( radius, length, capSegments, radialSegments );

	}

}

export class CircleBufferGeometry extends CircleGeometry { // @deprecated, r144

	constructor( radius, segments, thetaStart, thetaLength ) {

		console.warn( 'THREE.CircleBufferGeometry has been renamed to THREE.CircleGeometry.' );
		super( radius, segments, thetaStart, thetaLength );

	}

}

export class ConeBufferGeometry extends ConeGeometry { // @deprecated, r144

	constructor( radius, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength ) {

		console.warn( 'THREE.ConeBufferGeometry has been renamed to THREE.ConeGeometry.' );
		super( radius, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength );

	}

}

export class CylinderBufferGeometry extends CylinderGeometry { // @deprecated, r144

	constructor( radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength ) {

		console.warn( 'THREE.CylinderBufferGeometry has been renamed to THREE.CylinderGeometry.' );
		super( radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength );

	}

}

export class DodecahedronBufferGeometry extends DodecahedronGeometry { // @deprecated, r144

	constructor( radius, detail ) {

		console.warn( 'THREE.DodecahedronBufferGeometry has been renamed to THREE.DodecahedronGeometry.' );
		super( radius, detail );

	}

}

export class ExtrudeBufferGeometry extends ExtrudeGeometry { // @deprecated, r144

	constructor( shapes, options ) {

		console.warn( 'THREE.ExtrudeBufferGeometry has been renamed to THREE.ExtrudeGeometry.' );
		super( shapes, options );

	}

}

export class IcosahedronBufferGeometry extends IcosahedronGeometry { // @deprecated, r144

	constructor( radius, detail ) {

		console.warn( 'THREE.IcosahedronBufferGeometry has been renamed to THREE.IcosahedronGeometry.' );
		super( radius, detail );

	}

}

export class LatheBufferGeometry extends LatheGeometry { // @deprecated, r144

	constructor( points, segments, phiStart, phiLength ) {

		console.warn( 'THREE.LatheBufferGeometry has been renamed to THREE.LatheGeometry.' );
		super( points, segments, phiStart, phiLength );

	}

}

export class OctahedronBufferGeometry extends OctahedronGeometry { // @deprecated, r144

	constructor( radius, detail ) {

		console.warn( 'THREE.OctahedronBufferGeometry has been renamed to THREE.OctahedronGeometry.' );
		super( radius, detail );

	}

}

export class PlaneBufferGeometry extends PlaneGeometry { // @deprecated, r144

	constructor( width, height, widthSegments, heightSegments ) {

		console.warn( 'THREE.PlaneBufferGeometry has been renamed to THREE.PlaneGeometry.' );
		super( width, height, widthSegments, heightSegments );

	}

}

export class PolyhedronBufferGeometry extends PolyhedronGeometry { // @deprecated, r144

	constructor( vertices, indices, radius, detail ) {

		console.warn( 'THREE.PolyhedronBufferGeometry has been renamed to THREE.PolyhedronGeometry.' );
		super( vertices, indices, radius, detail );

	}

}

export class RingBufferGeometry extends RingGeometry { // @deprecated, r144

	constructor( innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength ) {

		console.warn( 'THREE.RingBufferGeometry has been renamed to THREE.RingGeometry.' );
		super( innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength );

	}

}

export class ShapeBufferGeometry extends ShapeGeometry { // @deprecated, r144

	constructor( shapes, curveSegments ) {

		console.warn( 'THREE.ShapeBufferGeometry has been renamed to THREE.ShapeGeometry.' );
		super( shapes, curveSegments );

	}

}

export class SphereBufferGeometry extends SphereGeometry { // @deprecated, r144

	constructor( radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength ) {

		console.warn( 'THREE.SphereBufferGeometry has been renamed to THREE.SphereGeometry.' );
		super( radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength );

	}

}

export class TetrahedronBufferGeometry extends TetrahedronGeometry { // @deprecated, r144

	constructor( radius, detail ) {

		console.warn( 'THREE.TetrahedronBufferGeometry has been renamed to THREE.TetrahedronGeometry.' );
		super( radius, detail );

	}

}

export class TorusBufferGeometry extends TorusGeometry { // @deprecated, r144

	constructor( radius, tube, radialSegments, tubularSegments, arc ) {

		console.warn( 'THREE.TorusBufferGeometry has been renamed to THREE.TorusGeometry.' );
		super( radius, tube, radialSegments, tubularSegments, arc );

	}

}

export class TorusKnotBufferGeometry extends TorusKnotGeometry { // @deprecated, r144

	constructor( radius, tube, tubularSegments, radialSegments, p, q ) {

		console.warn( 'THREE.TorusKnotBufferGeometry has been renamed to THREE.TorusKnotGeometry.' );
		super( radius, tube, tubularSegments, radialSegments, p, q );

	}

}

export class TubeBufferGeometry extends TubeGeometry { // @deprecated, r144

	constructor( path, tubularSegments, radius, radialSegments, closed ) {

		console.warn( 'THREE.TubeBufferGeometry has been renamed to THREE.TubeGeometry.' );
		super( path, tubularSegments, radius, radialSegments, closed );

	}

}
