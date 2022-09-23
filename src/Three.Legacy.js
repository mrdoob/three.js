import { WebGLRenderTarget } from './renderers/WebGLRenderTarget.js';
import { DataArrayTexture } from './textures/DataArrayTexture.js';
import { Data3DTexture } from './textures/Data3DTexture.js';
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

// r134, d65e0af06644fe5a84a6fc0e372f4318f95a04c0

export function ImmediateRenderObject() {

	console.error( 'THREE.ImmediateRenderObject has been removed.' );

}

// r138, 48b05d3500acc084df50be9b4c90781ad9b8cb17

export class WebGLMultisampleRenderTarget extends WebGLRenderTarget {

	constructor( width, height, options ) {

		console.error( 'THREE.WebGLMultisampleRenderTarget has been removed. Use a normal render target and set the "samples" property to greater 0 to enable multisampling.' );
		super( width, height, options );
		this.samples = 4;

	}

}

// r138, f9cd9cab03b7b64244e304900a3a2eeaa3a588ce

export class DataTexture2DArray extends DataArrayTexture {

	constructor( data, width, height, depth ) {

		console.warn( 'THREE.DataTexture2DArray has been renamed to DataArrayTexture.' );
		super( data, width, height, depth );

	}

}

// r138, f9cd9cab03b7b64244e304900a3a2eeaa3a588ce

export class DataTexture3D extends Data3DTexture {

	constructor( data, width, height, depth ) {

		console.warn( 'THREE.DataTexture3D has been renamed to Data3DTexture.' );
		super( data, width, height, depth );

	}

}

// r144

export class BoxBufferGeometry extends BoxGeometry {

	constructor( width, height, depth, widthSegments, heightSegments, depthSegments ) {

		console.warn( 'THREE.BoxBufferGeometry has been renamed to THREE.BoxGeometry.' );
		super( width, height, depth, widthSegments, heightSegments, depthSegments );


	}

}

// r144

export class CapsuleBufferGeometry extends CapsuleGeometry {

	constructor( radius, length, capSegments, radialSegments ) {

		console.warn( 'THREE.CapsuleBufferGeometry has been renamed to THREE.CapsuleGeometry.' );
		super( radius, length, capSegments, radialSegments );

	}

}

// r144

export class CircleBufferGeometry extends CircleGeometry {

	constructor( radius, segments, thetaStart, thetaLength ) {

		console.warn( 'THREE.CircleBufferGeometry has been renamed to THREE.CircleGeometry.' );
		super( radius, segments, thetaStart, thetaLength );

	}

}

// r144

export class ConeBufferGeometry extends ConeGeometry {

	constructor( radius, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength ) {

		console.warn( 'THREE.ConeBufferGeometry has been renamed to THREE.ConeGeometry.' );
		super( radius, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength );

	}

}

// r144

export class CylinderBufferGeometry extends CylinderGeometry {

	constructor( radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength ) {

		console.warn( 'THREE.CylinderBufferGeometry has been renamed to THREE.CylinderGeometry.' );
		super( radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength );

	}

}

// r144

export class DodecahedronBufferGeometry extends DodecahedronGeometry {

	constructor( radius, detail ) {

		console.warn( 'THREE.DodecahedronBufferGeometry has been renamed to THREE.DodecahedronGeometry.' );
		super( radius, detail );

	}

}

// r144

export class ExtrudeBufferGeometry extends ExtrudeGeometry {

	constructor( shapes, options ) {

		console.warn( 'THREE.ExtrudeBufferGeometry has been renamed to THREE.ExtrudeGeometry.' );
		super( shapes, options );

	}

}

// r144

export class IcosahedronBufferGeometry extends IcosahedronGeometry {

	constructor( radius, detail ) {

		console.warn( 'THREE.IcosahedronBufferGeometry has been renamed to THREE.IcosahedronGeometry.' );
		super( radius, detail );

	}

}

// r144

export class LatheBufferGeometry extends LatheGeometry {

	constructor( points, segments, phiStart, phiLength ) {

		console.warn( 'THREE.LatheBufferGeometry has been renamed to THREE.LatheGeometry.' );
		super( points, segments, phiStart, phiLength );

	}

}

// r144

export class OctahedronBufferGeometry extends OctahedronGeometry {

	constructor( radius, detail ) {

		console.warn( 'THREE.OctahedronBufferGeometry has been renamed to THREE.OctahedronGeometry.' );
		super( radius, detail );

	}

}

// r144

export class PlaneBufferGeometry extends PlaneGeometry {

	constructor( width, height, widthSegments, heightSegments ) {

		console.warn( 'THREE.PlaneBufferGeometry has been renamed to THREE.PlaneGeometry.' );
		super( width, height, widthSegments, heightSegments );

	}

}

// r144

export class PolyhedronBufferGeometry extends PolyhedronGeometry {

	constructor( vertices, indices, radius, detail ) {

		console.warn( 'THREE.PolyhedronBufferGeometry has been renamed to THREE.PolyhedronGeometry.' );
		super( vertices, indices, radius, detail );

	}

}

// r144

export class RingBufferGeometry extends RingGeometry {

	constructor( innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength ) {

		console.warn( 'THREE.RingBufferGeometry has been renamed to THREE.RingGeometry.' );
		super( innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength );

	}

}

// r144

export class ShapeBufferGeometry extends ShapeGeometry {

	constructor( shapes, curveSegments ) {

		console.warn( 'THREE.ShapeBufferGeometry has been renamed to THREE.ShapeGeometry.' );
		super( shapes, curveSegments );

	}

}

// r144

export class SphereBufferGeometry extends SphereGeometry {

	constructor( radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength ) {

		console.warn( 'THREE.SphereBufferGeometry has been renamed to THREE.SphereGeometry.' );
		super( radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength );

	}

}

// r144

export class TetrahedronBufferGeometry extends TetrahedronGeometry {

	constructor( radius, detail ) {

		console.warn( 'THREE.TetrahedronBufferGeometry has been renamed to THREE.TetrahedronGeometry.' );
		super( radius, detail );

	}

}

// r144

export class TorusBufferGeometry extends TorusGeometry {

	constructor( radius, tube, radialSegments, tubularSegments, arc ) {

		console.warn( 'THREE.TorusBufferGeometry has been renamed to THREE.TorusGeometry.' );
		super( radius, tube, radialSegments, tubularSegments, arc );

	}

}

// r144

export class TorusKnotBufferGeometry extends TorusKnotGeometry {

	constructor( radius, tube, tubularSegments, radialSegments, p, q ) {

		console.warn( 'THREE.TorusKnotBufferGeometry has been renamed to THREE.TorusKnotGeometry.' );
		super( radius, tube, tubularSegments, radialSegments, p, q );

	}

}

// r144

export class TubeBufferGeometry extends TubeGeometry {

	constructor( path, tubularSegments, radius, radialSegments, closed ) {

		console.warn( 'THREE.TubeBufferGeometry has been renamed to THREE.TubeGeometry.' );
		super( path, tubularSegments, radius, radialSegments, closed );

	}

}


