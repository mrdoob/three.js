import { BufferGeometry } from '../core/BufferGeometry';
import { Float32Attribute, Uint16Attribute, Uint32Attribute } from '../core/BufferAttribute';

/**
 * @author Mugen87 / https://github.com/Mugen87
 *
 * Parametric Surfaces Geometry
 * based on the brilliant article by @prideout http://prideout.net/blog/?p=44
 */

function ParametricBufferGeometry( func, slices, stacks ) {

	BufferGeometry.call( this );

	this.type = 'ParametricBufferGeometry';

	this.parameters = {
		func: func,
		slices: slices,
		stacks: stacks
	};

	// generate vertices and uvs

	var vertices = [];
	var uvs = [];

	var i, j, p;
	var u, v;

	var sliceCount = slices + 1;

	for ( i = 0; i <= stacks; i ++ ) {

		v = i / stacks;

		for ( j = 0; j <= slices; j ++ ) {

			u = j / slices;

			p = func( u, v );
			vertices.push( p.x, p.y, p.z );

			uvs.push( u, v );

		}

	}

	// generate indices

	var indices = [];
	var a, b, c, d;

	for ( i = 0; i < stacks; i ++ ) {

		for ( j = 0; j < slices; j ++ ) {

			a = i * sliceCount + j;
			b = i * sliceCount + j + 1;
			c = ( i + 1 ) * sliceCount + j + 1;
			d = ( i + 1 ) * sliceCount + j;

			// faces one and two

			indices.push( a, b, d );
			indices.push( b, c, d );

		}

	}

	// build geometry

	this.setIndex( ( indices.length > 65535 ? Uint32Attribute : Uint16Attribute )( indices, 1 ) );
	this.addAttribute( 'position', Float32Attribute( vertices, 3 ) );
	this.addAttribute( 'uv', Float32Attribute( uvs, 2 ) );

	// generate normals

	this.computeVertexNormals();

}

ParametricBufferGeometry.prototype = Object.create( BufferGeometry.prototype );
ParametricBufferGeometry.prototype.constructor = ParametricBufferGeometry;


export { ParametricBufferGeometry };
