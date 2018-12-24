/**
 * @author moraxy / https://github.com/moraxy
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { DirectGeometry } from '../../../../src/core/DirectGeometry';
import { Vector2 } from '../../../../src/math/Vector2';
import { Vector3 } from '../../../../src/math/Vector3';
import { Vector4 } from '../../../../src/math/Vector4';
import { Color } from '../../../../src/math/Color';
import { Face3 } from '../../../../src/core/Face3';
import { Geometry } from '../../../../src/core/Geometry';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'DirectGeometry', () => {

		// INSTANCING
		QUnit.todo( "Instancing", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// PUBLIC STUFF
		QUnit.test( "computeGroups", ( assert ) => {

			var a = new DirectGeometry();
			var b = new Geometry();
			var expected = [
				{ start: 0, materialIndex: 0, count: 3 },
				{ start: 3, materialIndex: 1, count: 3 },
				{ start: 6, materialIndex: 2, count: 6 }
			];

			// we only care for materialIndex
			b.faces.push(
				new Face3( 0, 0, 0, undefined, undefined, 0 ),
				new Face3( 0, 0, 0, undefined, undefined, 1 ),
				new Face3( 0, 0, 0, undefined, undefined, 2 ),
				new Face3( 0, 0, 0, undefined, undefined, 2 )
			);

			a.computeGroups( b );

			assert.deepEqual( a.groups, expected, "Groups are as expected" );

		} );

		QUnit.test( "fromGeometry", ( assert ) => {

			// geometry definition

			var geometry = new Geometry();

			// vertices

			var v1 = new Vector3( 1, - 1, 0 );
			var v2 = new Vector3( 1, 1, 0 );
			var v3 = new Vector3( - 1, 1, 0 );
			var v4 = new Vector3( - 1, - 1, 0 );

			// faces, normals and colors

			geometry.vertices.push( v1, v2, v3, v4 );

			var f1 = new Face3( 0, 1, 2 );
			f1.normal.set( 0, 0, 1 );
			f1.color.set( 0xff0000 );
			var f2 = new Face3( 2, 3, 0 );
			f2.normal.set( 0, 0, 1 );
			f2.color.set( 0xff0000 );

			geometry.faces.push( f1, f2 );

			// uvs

			var uvs = geometry.faceVertexUvs[ 0 ];
			uvs.length = 0;

			uvs.push( [
				new Vector2( 1, 0 ),
				new Vector2( 1, 1 ),
				new Vector2( 0, 1 )
			] );

			uvs.push( [
				new Vector2( 0, 1 ),
				new Vector2( 0, 0 ),
				new Vector2( 1, 0 )
			] );

			// skin weights

			var sw1 = new Vector4( 0.8, 0.2, 0, 0 );
			var sw2 = new Vector4( 0.7, 0.2, 0.1, 0 );
			var sw3 = new Vector4( 0.8, 0.1, 0.1, 0 );
			var sw4 = new Vector4( 1, 0, 0, 0 );

			geometry.skinWeights.push( sw1, sw2, sw3, sw4 );

			// skin indices

			var si1 = new Vector4( 0, 1, 2, 3 );
			var si2 = new Vector4( 2, 3, 4, 5 );
			var si3 = new Vector4( 4, 5, 6, 7 );
			var si4 = new Vector4( 6, 7, 8, 9 );

			geometry.skinIndices.push( si1, si2, si3, si4 );

			// create DirectGeometry

			var directGeometry = new DirectGeometry().fromGeometry( geometry );

			// expected values

			var vertices = [
				// first face
				new Vector3( 1, - 1, 0 ),
				new Vector3( 1, 1, 0 ),
				new Vector3( - 1, 1, 0 ),
				// second face
				new Vector3( - 1, 1, 0 ),
				new Vector3( - 1, - 1, 0 ),
				new Vector3( 1, - 1, 0 )
			];

			var normals = [
				// first face
				new Vector3( 0, 0, 1 ),
				new Vector3( 0, 0, 1 ),
				new Vector3( 0, 0, 1 ),
				// second face
				new Vector3( 0, 0, 1 ),
				new Vector3( 0, 0, 1 ),
				new Vector3( 0, 0, 1 )
			];

			var colors = [
				// first face
				new Color( 1, 0, 0 ),
				new Color( 1, 0, 0 ),
				new Color( 1, 0, 0 ),
				// second face
				new Color( 1, 0, 0 ),
				new Color( 1, 0, 0 ),
				new Color( 1, 0, 0 )
			];

			var uvs = [
				// first face
				new Vector2( 1, 0 ),
				new Vector2( 1, 1 ),
				new Vector2( 0, 1 ),
				// second face
				new Vector2( 0, 1 ),
				new Vector2( 0, 0 ),
				new Vector2( 1, 0 )
			];

			var skinIndices = [
				// first face
				new Vector4( 0, 1, 2, 3 ),
				new Vector4( 2, 3, 4, 5 ),
				new Vector4( 4, 5, 6, 7 ),
				// second face
				new Vector4( 4, 5, 6, 7 ),
				new Vector4( 6, 7, 8, 9 ),
				new Vector4( 0, 1, 2, 3 )
			];

			var skinWeights = [
				// first face
				new Vector4( 0.8, 0.2, 0, 0 ),
				new Vector4( 0.7, 0.2, 0.1, 0 ),
				new Vector4( 0.8, 0.1, 0.1, 0 ),
				// second face
				new Vector4( 0.8, 0.1, 0.1, 0 ),
				new Vector4( 1, 0, 0, 0 ),
				new Vector4( 0.8, 0.2, 0, 0 )
			];

			assert.deepEqual( directGeometry.vertices, vertices, "Vertices are as expected" );
			assert.deepEqual( directGeometry.normals, normals, "Normals are as expected" );
			assert.deepEqual( directGeometry.colors, colors, "Colors are as expected" );
			assert.deepEqual( directGeometry.uvs, uvs, "Texture coordinates are as expected" );
			assert.deepEqual( directGeometry.skinIndices, skinIndices, "Skin indices are as expected" );
			assert.deepEqual( directGeometry.skinWeights, skinWeights, "Skin weights are as expected" );

		} );

	} );

} );
