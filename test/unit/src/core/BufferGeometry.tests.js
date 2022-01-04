/* global QUnit */

import { BufferGeometry } from '../../../../src/core/BufferGeometry';
import {
	BufferAttribute,
	Uint16BufferAttribute,
	Uint32BufferAttribute
} from '../../../../src/core/BufferAttribute';
import { Vector3 } from '../../../../src/math/Vector3';
import { Matrix4 } from '../../../../src/math/Matrix4';
import { Quaternion } from '../../../../src/math/Quaternion';
import { Sphere } from '../../../../src/math/Sphere';
import {
	x,
	y,
	z
} from '../math/Constants.tests';
import { CONSOLE_LEVEL } from '../../utils/console-wrapper';

var DegToRad = Math.PI / 180;

function bufferAttributeEquals( a, b, tolerance ) {

	tolerance = tolerance || 0.0001;

	if ( a.count !== b.count || a.itemSize !== b.itemSize ) {

		return false;

	}

	for ( var i = 0, il = a.count * a.itemSize; i < il; i ++ ) {

		var delta = a[ i ] - b[ i ];
		if ( delta > tolerance ) {

			return false;

		}

	}

	return true;

}

function getBBForVertices( vertices ) {

	var geometry = new BufferGeometry();

	geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( vertices ), 3 ) );
	geometry.computeBoundingBox();

	return geometry.boundingBox;

}

function getBSForVertices( vertices ) {

	var geometry = new BufferGeometry();

	geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( vertices ), 3 ) );
	geometry.computeBoundingSphere();

	return geometry.boundingSphere;

}

function getNormalsForVertices( vertices, assert ) {

	var geometry = new BufferGeometry();

	geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( vertices ), 3 ) );

	geometry.computeVertexNormals();

	assert.ok( geometry.attributes.normal !== undefined, 'normal attribute was created' );

	return geometry.attributes.normal.array;

}

export default QUnit.module( 'Core', () => {

	QUnit.module( 'BufferGeometry', () => {

		// INHERITANCE
		QUnit.todo( 'Extending', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// INSTANCING
		QUnit.todo( 'Instancing', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC STUFF
		QUnit.todo( 'isBufferGeometry', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'setIndex/getIndex', ( assert ) => {

			var a = new BufferGeometry();
			var uint16 = [ 1, 2, 3 ];
			var uint32 = [ 65535, 65536, 65537 ];
			var str = 'foo';

			a.setIndex( uint16 );
			assert.ok( a.getIndex() instanceof Uint16BufferAttribute, 'Index has the right type' );
			assert.deepEqual( a.getIndex().array, new Uint16Array( uint16 ), 'Small index gets stored correctly' );

			a.setIndex( uint32 );
			assert.ok( a.getIndex() instanceof Uint32BufferAttribute, 'Index has the right type' );
			assert.deepEqual( a.getIndex().array, new Uint32Array( uint32 ), 'Large index gets stored correctly' );

			a.setIndex( str );
			assert.strictEqual( a.getIndex(), str, 'Weird index gets stored correctly' );

		} );

		QUnit.todo( 'getAttribute', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'set / delete Attribute', ( assert ) => {

			var geometry = new BufferGeometry();
			var attributeName = 'position';

			assert.ok( geometry.attributes[ attributeName ] === undefined, 'no attribute defined' );

			geometry.setAttribute( attributeName, new BufferAttribute( new Float32Array( [ 1, 2, 3 ], 1 ) ) );

			assert.ok( geometry.attributes[ attributeName ] !== undefined, 'attribute is defined' );

			geometry.deleteAttribute( attributeName );

			assert.ok( geometry.attributes[ attributeName ] === undefined, 'no attribute defined' );

		} );

		QUnit.test( 'addGroup', ( assert ) => {

			var a = new BufferGeometry();
			var expected = [
				{
					start: 0,
					count: 1,
					materialIndex: 0
				},
				{
					start: 1,
					count: 2,
					materialIndex: 2
				}
			];

			a.addGroup( 0, 1, 0 );
			a.addGroup( 1, 2, 2 );

			assert.deepEqual( a.groups, expected, 'Check groups were stored correctly and in order' );

			a.clearGroups();
			assert.strictEqual( a.groups.length, 0, 'Check groups were deleted correctly' );

		} );
		QUnit.todo( 'clearGroups', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'setDrawRange', ( assert ) => {

			var a = new BufferGeometry();

			a.setDrawRange( 1.0, 7 );

			assert.deepEqual( a.drawRange, {
				start: 1,
				count: 7
			}, 'Check draw range was stored correctly' );

		} );

		QUnit.test( 'applyMatrix4', ( assert ) => {

			var geometry = new BufferGeometry();
			geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( 6 ), 3 ) );

			var matrix = new Matrix4().set(
				1, 0, 0, 1.5,
				0, 1, 0, - 2,
				0, 0, 1, 3,
				0, 0, 0, 1
			);
			geometry.applyMatrix4( matrix );

			var position = geometry.attributes.position.array;
			var m = matrix.elements;
			assert.ok( position[ 0 ] === m[ 12 ] && position[ 1 ] === m[ 13 ] && position[ 2 ] === m[ 14 ], 'position was extracted from matrix' );
			assert.ok( position[ 3 ] === m[ 12 ] && position[ 4 ] === m[ 13 ] && position[ 5 ] === m[ 14 ], 'position was extracted from matrix twice' );
			assert.ok( geometry.attributes.position.version === 1, 'version was increased during update' );

		} );

		QUnit.test( 'applyQuaternion', ( assert ) => {

			var geometry = new BufferGeometry();
			geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( [ 1, 2, 3, 4, 5, 6 ] ), 3 ) );

			var q = new Quaternion( 0.5, 0.5, 0.5, 0.5 );
			geometry.applyQuaternion( q );

			var pos = geometry.attributes.position.array;

			// geometry was rotated around the (1, 1, 1) axis.
			assert.ok( pos[ 0 ] === 3 && pos[ 1 ] === 1 && pos[ 2 ] === 2 &&
				pos[ 3 ] === 6 && pos[ 4 ] === 4 && pos[ 5 ] === 5, 'vertices were rotated properly' );

		} );

		QUnit.test( 'rotateX/Y/Z', ( assert ) => {

			var geometry = new BufferGeometry();
			geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( [ 1, 2, 3, 4, 5, 6 ] ), 3 ) );

			var pos = geometry.attributes.position.array;

			geometry.rotateX( 180 * DegToRad );

			// object was rotated around x so all items should be flipped but the x ones
			assert.ok( pos[ 0 ] === 1 && pos[ 1 ] === - 2 && pos[ 2 ] === - 3 &&
				pos[ 3 ] === 4 && pos[ 4 ] === - 5 && pos[ 5 ] === - 6, 'vertices were rotated around x by 180 degrees' );

			geometry.rotateY( 180 * DegToRad );

			// vertices were rotated around y so all items should be flipped again but the y ones
			assert.ok( pos[ 0 ] === - 1 && pos[ 1 ] === - 2 && pos[ 2 ] === 3 &&
				pos[ 3 ] === - 4 && pos[ 4 ] === - 5 && pos[ 5 ] === 6, 'vertices were rotated around y by 180 degrees' );

			geometry.rotateZ( 180 * DegToRad );

			// vertices were rotated around z so all items should be flipped again but the z ones
			assert.ok( pos[ 0 ] === 1 && pos[ 1 ] === 2 && pos[ 2 ] === 3 &&
				pos[ 3 ] === 4 && pos[ 4 ] === 5 && pos[ 5 ] === 6, 'vertices were rotated around z by 180 degrees' );

		} );

		QUnit.test( 'translate', ( assert ) => {

			var geometry = new BufferGeometry();
			geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( [ 1, 2, 3, 4, 5, 6 ] ), 3 ) );

			var pos = geometry.attributes.position.array;

			geometry.translate( 10, 20, 30 );

			assert.ok( pos[ 0 ] === 11 && pos[ 1 ] === 22 && pos[ 2 ] === 33 &&
				pos[ 3 ] === 14 && pos[ 4 ] === 25 && pos[ 5 ] === 36, 'vertices were translated' );

		} );

		QUnit.test( 'scale', ( assert ) => {

			var geometry = new BufferGeometry();
			geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( [ - 1, - 1, - 1, 2, 2, 2 ] ), 3 ) );

			var pos = geometry.attributes.position.array;

			geometry.scale( 1, 2, 3 );

			assert.ok( pos[ 0 ] === - 1 && pos[ 1 ] === - 2 && pos[ 2 ] === - 3 &&
				pos[ 3 ] === 2 && pos[ 4 ] === 4 && pos[ 5 ] === 6, 'vertices were scaled' );

		} );

		QUnit.test( 'lookAt', ( assert ) => {

			var a = new BufferGeometry();
			var vertices = new Float32Array( [
				- 1.0, - 1.0, 1.0,
				1.0, - 1.0, 1.0,
				1.0, 1.0, 1.0,

				1.0, 1.0, 1.0,
				- 1.0, 1.0, 1.0,
				- 1.0, - 1.0, 1.0
			] );
			a.setAttribute( 'position', new BufferAttribute( vertices, 3 ) );

			var sqrt = Math.sqrt( 2 );
			var expected = new Float32Array( [
				1, 0, - sqrt,
				- 1, 0, - sqrt,
				- 1, sqrt, 0,

				- 1, sqrt, 0,
				1, sqrt, 0,
				1, 0, - sqrt
			] );

			a.lookAt( new Vector3( 0, 1, - 1 ) );

			assert.ok( bufferAttributeEquals( a.attributes.position.array, expected ), 'Rotation is correct' );

		} );

		QUnit.test( 'center', ( assert ) => {

			var geometry = new BufferGeometry();
			geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( [
				- 1, - 1, - 1,
				1, 1, 1,
				4, 4, 4
			] ), 3 ) );

			geometry.center();

			var pos = geometry.attributes.position.array;

			// the boundingBox should go from (-1, -1, -1) to (4, 4, 4) so it has a size of (5, 5, 5)
			// after centering it the vertices should be placed between (-2.5, -2.5, -2.5) and (2.5, 2.5, 2.5)
			assert.ok( pos[ 0 ] === - 2.5 && pos[ 1 ] === - 2.5 && pos[ 2 ] === - 2.5 &&
				pos[ 3 ] === - 0.5 && pos[ 4 ] === - 0.5 && pos[ 5 ] === - 0.5 &&
				pos[ 6 ] === 2.5 && pos[ 7 ] === 2.5 && pos[ 8 ] === 2.5, 'vertices were replaced by boundingBox dimensions' );

		} );

		QUnit.test( 'computeBoundingBox', ( assert ) => {

			var bb = getBBForVertices( [ - 1, - 2, - 3, 13, - 2, - 3.5, - 1, - 20, 0, - 4, 5, 6 ] );

			assert.ok( bb.min.x === - 4 && bb.min.y === - 20 && bb.min.z === - 3.5, 'min values are set correctly' );
			assert.ok( bb.max.x === 13 && bb.max.y === 5 && bb.max.z === 6, 'max values are set correctly' );

			var bb = getBBForVertices( [ - 1, - 1, - 1 ] );

			assert.ok( bb.min.x === bb.max.x && bb.min.y === bb.max.y && bb.min.z === bb.max.z, 'since there is only one vertex, max and min are equal' );
			assert.ok( bb.min.x === - 1 && bb.min.y === - 1 && bb.min.z === - 1, 'since there is only one vertex, min and max are this vertex' );

		} );

		QUnit.test( 'computeBoundingSphere', ( assert ) => {

			var bs = getBSForVertices( [ - 10, 0, 0, 10, 0, 0 ] );

			assert.ok( bs.radius === ( 10 + 10 ) / 2, 'radius is equal to deltaMinMax / 2' );
			assert.ok( bs.center.x === 0 && bs.center.y === 0 && bs.center.y === 0, 'bounding sphere is at ( 0, 0, 0 )' );

			var bs = getBSForVertices( [ - 5, 11, - 3, 5, - 11, 3 ] );
			var radius = new Vector3( 5, 11, 3 ).length();

			assert.ok( bs.radius === radius, 'radius is equal to directionLength' );
			assert.ok( bs.center.x === 0 && bs.center.y === 0 && bs.center.y === 0, 'bounding sphere is at ( 0, 0, 0 )' );

		} );

		QUnit.test( 'computeVertexNormals', ( assert ) => {

			// get normals for a counter clockwise created triangle
			var normals = getNormalsForVertices( [ - 1, 0, 0, 1, 0, 0, 0, 1, 0 ], assert );

			assert.ok( normals[ 0 ] === 0 && normals[ 1 ] === 0 && normals[ 2 ] === 1,
				'first normal is pointing to screen since the the triangle was created counter clockwise' );

			assert.ok( normals[ 3 ] === 0 && normals[ 4 ] === 0 && normals[ 5 ] === 1,
				'second normal is pointing to screen since the the triangle was created counter clockwise' );

			assert.ok( normals[ 6 ] === 0 && normals[ 7 ] === 0 && normals[ 8 ] === 1,
				'third normal is pointing to screen since the the triangle was created counter clockwise' );

			// get normals for a clockwise created triangle
			var normals = getNormalsForVertices( [ 1, 0, 0, - 1, 0, 0, 0, 1, 0 ], assert );

			assert.ok( normals[ 0 ] === 0 && normals[ 1 ] === 0 && normals[ 2 ] === - 1,
				'first normal is pointing to screen since the the triangle was created clockwise' );

			assert.ok( normals[ 3 ] === 0 && normals[ 4 ] === 0 && normals[ 5 ] === - 1,
				'second normal is pointing to screen since the the triangle was created clockwise' );

			assert.ok( normals[ 6 ] === 0 && normals[ 7 ] === 0 && normals[ 8 ] === - 1,
				'third normal is pointing to screen since the the triangle was created clockwise' );

			var normals = getNormalsForVertices( [ 0, 0, 1, 0, 0, - 1, 1, 1, 0 ], assert );

			// the triangle is rotated by 45 degrees to the right so the normals of the three vertices
			// should point to (1, -1, 0).normalized(). The simplest solution is to check against a normalized
			// vector (1, -1, 0) but you will get calculation errors because of floating calculations so another
			// valid technique is to create a vector which stands in 90 degrees to the normals and calculate the
			// dot product which is the cos of the angle between them. This should be < floating calculation error
			// which can be taken from Number.EPSILON
			var direction = new Vector3( 1, 1, 0 ).normalize(); // a vector which should have 90 degrees difference to normals
			var difference = direction.dot( new Vector3( normals[ 0 ], normals[ 1 ], normals[ 2 ] ) );
			assert.ok( difference < Number.EPSILON, 'normal is equal to reference vector' );

			// get normals for a line should be NAN because you need min a triangle to calculate normals
			var normals = getNormalsForVertices( [ 1, 0, 0, - 1, 0, 0 ], assert );
			for ( var i = 0; i < normals.length; i ++ ) {

				assert.ok( ! normals[ i ], 'normals can\'t be calculated which is good' );

			}

		} );
		QUnit.test( 'computeVertexNormals (indexed)', ( assert ) => {

			var sqrt = 0.5 * Math.sqrt( 2 );
			var normal = new BufferAttribute( new Float32Array( [
				- 1, 0, 0, - 1, 0, 0, - 1, 0, 0,
				sqrt, sqrt, 0, sqrt, sqrt, 0, sqrt, sqrt, 0,
				- 1, 0, 0
			] ), 3 );
			var position = new BufferAttribute( new Float32Array( [
				0.5, 0.5, 0.5, 0.5, 0.5, - 0.5, 0.5, - 0.5, 0.5,
				0.5, - 0.5, - 0.5, - 0.5, 0.5, - 0.5, - 0.5, 0.5, 0.5,
				- 0.5, - 0.5, - 0.5
			] ), 3 );
			var index = new BufferAttribute( new Uint16Array( [
				0, 2, 1, 2, 3, 1, 4, 6, 5, 6, 7, 5
			] ), 1 );

			var a = new BufferGeometry();
			a.setAttribute( 'position', position );
			a.computeVertexNormals();
			assert.ok(
				bufferAttributeEquals( normal, a.getAttribute( 'normal' ) ),
				'Regular geometry: first computed normals are correct'
			);

			// a second time to see if the existing normals get properly deleted
			a.computeVertexNormals();
			assert.ok(
				bufferAttributeEquals( normal, a.getAttribute( 'normal' ) ),
				'Regular geometry: second computed normals are correct'
			);

			// indexed geometry
			var a = new BufferGeometry();
			a.setAttribute( 'position', position );
			a.setIndex( index );
			a.computeVertexNormals();
			assert.ok( bufferAttributeEquals( normal, a.getAttribute( 'normal' ) ), 'Indexed geometry: computed normals are correct' );

		} );

		QUnit.test( 'merge', ( assert ) => {

			var geometry1 = new BufferGeometry();
			geometry1.setAttribute( 'attrName', new BufferAttribute( new Float32Array( [ 1, 2, 3, 0, 0, 0 ] ), 3 ) );

			var geometry2 = new BufferGeometry();
			geometry2.setAttribute( 'attrName', new BufferAttribute( new Float32Array( [ 4, 5, 6 ] ), 3 ) );

			var attr = geometry1.attributes.attrName.array;

			geometry1.merge( geometry2, 1 );

			// merged array should be 1, 2, 3, 4, 5, 6
			for ( var i = 0; i < attr.length; i ++ ) {

				assert.ok( attr[ i ] === i + 1, '' );

			}

			console.level = CONSOLE_LEVEL.ERROR;
			geometry1.merge( geometry2 );
			console.level = CONSOLE_LEVEL.DEFAULT;

			assert.ok( attr[ 0 ] === 4 && attr[ 1 ] === 5 && attr[ 2 ] === 6, 'copied the 3 attributes without offset' );

		} );

		QUnit.todo( 'normalizeNormals', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'toNonIndexed', ( assert ) => {

			var geometry = new BufferGeometry();
			var vertices = new Float32Array( [
				0.5, 0.5, 0.5, 0.5, 0.5, - 0.5, 0.5, - 0.5, 0.5, 0.5, - 0.5, - 0.5
			] );
			var index = new BufferAttribute( new Uint16Array( [ 0, 2, 1, 2, 3, 1 ] ) );
			var expected = new Float32Array( [
				0.5, 0.5, 0.5, 0.5, - 0.5, 0.5, 0.5, 0.5, - 0.5,
				0.5, - 0.5, 0.5, 0.5, - 0.5, - 0.5, 0.5, 0.5, - 0.5
			] );

			geometry.setAttribute( 'position', new BufferAttribute( vertices, 3 ) );
			geometry.setIndex( index );

			var nonIndexed = geometry.toNonIndexed();

			assert.deepEqual( nonIndexed.getAttribute( 'position' ).array, expected, 'Expected vertices' );

		} );

		QUnit.test( 'toJSON', ( assert ) => {

			var index = new BufferAttribute( new Uint16Array( [ 0, 1, 2, 3 ] ), 1 );
			var attribute1 = new BufferAttribute( new Uint16Array( [ 1, 3, 5, 7 ] ), 1 );
			attribute1.name = 'attribute1';
			var a = new BufferGeometry();
			a.name = 'JSONQUnit.test';
			// a.parameters = { "placeholder": 0 };
			a.setAttribute( 'attribute1', attribute1 );
			a.setIndex( index );
			a.addGroup( 0, 1, 2 );
			a.boundingSphere = new Sphere( new Vector3( x, y, z ), 0.5 );
			var j = a.toJSON();
			var gold = {
				'metadata': {
					'version': 4.5,
					'type': 'BufferGeometry',
					'generator': 'BufferGeometry.toJSON'
				},
				'uuid': a.uuid,
				'type': 'BufferGeometry',
				'name': 'JSONQUnit.test',
				'data': {
					'attributes': {
						'attribute1': {
							'itemSize': 1,
							'type': 'Uint16Array',
							'array': [ 1, 3, 5, 7 ],
							'normalized': false,
							'name': 'attribute1'
						}
					},
					'index': {
						'type': 'Uint16Array',
						'array': [ 0, 1, 2, 3 ]
					},
					'groups': [
						{
							'start': 0,
							'count': 1,
							'materialIndex': 2
						}
					],
					'boundingSphere': {
						'center': [ 2, 3, 4 ],
						'radius': 0.5
					}
				}
			};

			assert.deepEqual( j, gold, 'Generated JSON is as expected' );

			// add morphAttributes
			a.morphAttributes.attribute1 = [];
			a.morphAttributes.attribute1.push( attribute1.clone() );
			j = a.toJSON();
			gold.data.morphAttributes = {
				'attribute1': [ {
					'itemSize': 1,
					'type': 'Uint16Array',
					'array': [ 1, 3, 5, 7 ],
					'normalized': false,
					'name': 'attribute1'
				} ]
			};
			gold.data.morphTargetsRelative = false;

			assert.deepEqual( j, gold, 'Generated JSON with morphAttributes is as expected' );

		} );

		QUnit.test( 'clone', ( assert ) => {

			var a = new BufferGeometry();
			a.setAttribute( 'attribute1', new BufferAttribute( new Float32Array( [ 1, 2, 3, 4, 5, 6 ] ), 3 ) );
			a.setAttribute( 'attribute2', new BufferAttribute( new Float32Array( [ 0, 1, 3, 5, 6 ] ), 1 ) );
			a.addGroup( 0, 1, 2 );
			a.computeBoundingBox();
			a.computeBoundingSphere();
			a.setDrawRange( 0, 1 );
			var b = a.clone();

			assert.notEqual( a, b, 'A new object was created' );
			assert.notEqual( a.id, b.id, 'New object has a different GUID' );

			assert.strictEqual(
				Object.keys( a.attributes ).count, Object.keys( b.attributes ).count,
				'Both objects have the same amount of attributes'
			);
			assert.ok(
				bufferAttributeEquals( a.getAttribute( 'attribute1' ), b.getAttribute( 'attribute1' ) ),
				'First attributes buffer is identical'
			);
			assert.ok(
				bufferAttributeEquals( a.getAttribute( 'attribute2' ), b.getAttribute( 'attribute2' ) ),
				'Second attributes buffer is identical'
			);

			assert.deepEqual( a.groups, b.groups, 'Groups are identical' );

			assert.ok( a.boundingBox.equals( b.boundingBox ), 'BoundingBoxes are equal' );
			assert.ok( a.boundingSphere.equals( b.boundingSphere ), 'BoundingSpheres are equal' );

			assert.strictEqual( a.drawRange.start, b.drawRange.start, 'DrawRange start is identical' );
			assert.strictEqual( a.drawRange.count, b.drawRange.count, 'DrawRange count is identical' );

		} );

		QUnit.test( 'copy', ( assert ) => {

			var geometry = new BufferGeometry();
			geometry.setAttribute( 'attrName', new BufferAttribute( new Float32Array( [ 1, 2, 3, 4, 5, 6 ] ), 3 ) );
			geometry.setAttribute( 'attrName2', new BufferAttribute( new Float32Array( [ 0, 1, 3, 5, 6 ] ), 1 ) );

			var copy = new BufferGeometry().copy( geometry );

			assert.ok( copy !== geometry && geometry.id !== copy.id, 'new object was created' );

			Object.keys( geometry.attributes ).forEach( function ( key ) {

				var attribute = geometry.attributes[ key ];
				assert.ok( attribute !== undefined, 'all attributes where copied' );

				for ( var i = 0; i < attribute.array.length; i ++ ) {

					assert.ok( attribute.array[ i ] === copy.attributes[ key ].array[ i ], 'values of the attribute are equal' );

				}

			} );

		} );

		QUnit.todo( 'dispose', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
