import { LineSegments2 } from '../lines/LineSegments2.js';
import { LineGeometry } from '../lines/LineGeometry.js';
import { LineMaterial } from '../lines/LineMaterial.js';
import { Vector4 } from 'three';

const _viewport = new Vector4();
class Line2 extends LineSegments2 {

	constructor( geometry = new LineGeometry(), material = new LineMaterial( { color: Math.random() * 0xffffff } ) ) {

		super( geometry, material );

		this.isLine2 = true;

		this.type = 'Line2';

	}

	onBeforeRender( renderer ) {

		if ( this.material.uniforms.resolution ) {

			renderer.getCurrentViewport( _viewport );
			this.material.uniforms.resolution.value.set( _viewport.z, _viewport.w );

		}

	}

}

export { Line2 };
