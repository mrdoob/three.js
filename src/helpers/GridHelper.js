import { LineSegments } from '../objects/LineSegments.js';
import { LineBasicMaterial } from '../materials/LineBasicMaterial.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import { BufferGeometry } from '../core/BufferGeometry.js';

class GridHelper extends LineSegments {

	constructor( size = 10, divisions = 10, color = 0x444444 ) {

		const step = size / divisions;
		const halfSize = size / 2;

		const vertices = [];

		for ( let i = 0, k = - halfSize; i <= divisions; i ++, k += step ) {

			vertices.push( - halfSize, 0, k, halfSize, 0, k );
			vertices.push( k, 0, - halfSize, k, 0, halfSize );

		}

		const geometry = new BufferGeometry();
		geometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );

		const material = new LineBasicMaterial( { color: color, toneMapped: false } );

		super( geometry, material );

		this.type = 'GridHelper';

	}

}


export { GridHelper };
