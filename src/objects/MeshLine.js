import { Mesh } from './Mesh';
import { BufferGeometry } from '../core/BufferGeometry';
import { Float32BufferAttribute } from '../core/BufferAttribute';
import { Vector3 } from '../math/Vector3';

/**
 * @author Mugen87 / https://github.com/Mugen87
 *
 * ported from: https://github.com/spite/THREE.MeshLine
 *
 */

function MeshLine( geometry, material, widthCallback ) {

	Mesh.call( this, undefined, material );

	this.type = 'MeshLine';
	this.widthCallback = widthCallback || undefined;
	this.frustumCulled = false; // frustum culling not possible, geometry is partly generated in the vertex shader

	var srcGeometry = this.prepare( geometry );
	this.generate( srcGeometry );

}

MeshLine.prototype = Object.assign( Object.create( Mesh.prototype ), {

	constructor: MeshLine,

	isMeshLine: true,

	prepare: function ( srcGeometry ) {

		var geometry;
		var i, l;

		// convert geometry if necessary

		if ( srcGeometry.isGeometry === true ) {

			geometry = new BufferGeometry();
			var vertices = [];
			var colors = [];

			for ( i = 0, l = srcGeometry.vertices.length; i < l; i ++ ) {

				var vertex = srcGeometry.vertices[ i ];
				vertices.push( vertex.x, vertex.y, vertex.z );

			}

			for ( i = 0, l = srcGeometry.colors.length; i < l; i ++ ) {

				var color = srcGeometry.colors[ i ];
				colors.push( color.r, color.g, color.b );

			}

			geometry.addAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );

			// optional

			if ( colors.length > 0 ) {

				geometry.addAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );

			}

		} else if ( srcGeometry.isBufferGeometry === true ) {

			geometry = srcGeometry;

		}

		return geometry;

	},

	generate: function ( geometry ) {

		var i, l;

		// buffer

		var indices = [];
		var vertices = [];
		var uvs = [];
		var colors = [];

		var side = [];
		var width = [];

		var prev = [];
		var next = [];

		// generate vertices, uvs, side and width attributes

		var position = geometry.attributes.position;
		var color = geometry.attributes.color;

		for ( i = 0, l = position.count; i < l; i ++ ) {

			var x = position.getX( i );
			var y = position.getY( i );
			var z = position.getZ( i );

			// we generate two vertices per segment. for now we represent the line as a sequence of vertices.
			// in the vertex shader we will extrude the vertices along a computed direction vector.

			vertices.push( x, y, z );
			vertices.push( x, y, z );

			// uvs

			uvs.push( i / ( l - 1 ), 0 );
			uvs.push( i / ( l - 1 ), 1 );

			// the 'side' attribute determines the sign of the direction vector that is used for the extrusion

			side.push( 1 );
			side.push( - 1 );

			// the 'width' attribute determines the default width of the line at the respective vertex position

			var w = 1;

			if ( typeof this.widthCallback === 'function' ) {

				w = this.widthCallback( i / ( l - 1 ) );

			}

			width.push( w );
			width.push( w );

			// colors (optional)

			if ( color !== undefined ) {

				var r = color.getX( i );
				var g = color.getY( i );
				var b = color.getZ( i );

				colors.push( r, g, b );
				colors.push( r, g, b );

			}

		}

		// generate indices

		for ( i = 0, l = position.count - 1; i < l; i ++ ) {

			var n = i * 2;
			indices.push( n, n + 1, n + 2 );
			indices.push( n + 2, n + 1, n + 3 );

		}

		// now we generate the 'prev' and 'next' attributes. these are needed to calculate the correct
		// extrusion direction in the vertex shader.
		// 'prev' and 'next' are the previous and next vertices of a given vertex

		var v = new Vector3();

		var vFirst = new Vector3().fromBufferAttribute( position, 0 );
		var vLast = new Vector3().fromBufferAttribute( position, position.count - 1 );

		// the line is closed if first and last vertex are identical

		var closed = vFirst.equals( vLast );

		// special case: if the line is closed, 'prev' of the first vertex is the second last vertex of the buffer.
		// otherwise 'prev' is identical to the first vertex

		if ( closed === true ) {

			v.fromBufferAttribute( position, position.count - 2 );

		} else {

			v.copy( vFirst );

		}

		prev.push( v.x, v.y, v.z );
		prev.push( v.x, v.y, v.z );

		// generate remaining 'prev' vertices

		for ( i = 0, l = position.count - 1; i < l; i ++ ) {

			v.fromBufferAttribute( position, i );
			prev.push( v.x, v.y, v.z );
			prev.push( v.x, v.y, v.z );

		}

		// start with 'next' vertices

		for ( i = 1, l = position.count; i < l; i ++ ) {

			v.fromBufferAttribute( position, i );
			next.push( v.x, v.y, v.z );
			next.push( v.x, v.y, v.z );

		}

		// special case: if the line is closed, 'next' of the last vertex is the second vertex of the buffer.
		// otherwise 'next' is identical to the last vertex

		if ( closed === true ) {

			v.fromBufferAttribute( position, 1 );

		} else {

			v.copy( vLast );

		}

		next.push( v.x, v.y, v.z );
		next.push( v.x, v.y, v.z );

		// build geometry

		this.geometry.setIndex( indices );

		this.geometry.addAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		this.geometry.addAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );
		this.geometry.addAttribute( 'side', new Float32BufferAttribute( side, 1 ) );
		this.geometry.addAttribute( 'width', new Float32BufferAttribute( width, 1 ) );
		this.geometry.addAttribute( 'prev', new Float32BufferAttribute( prev, 3 ) );
		this.geometry.addAttribute( 'next', new Float32BufferAttribute( next, 3 ) );

		if ( colors.length > 0 ) {

			this.geometry.addAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );

		}

	}

} );


export { MeshLine };
