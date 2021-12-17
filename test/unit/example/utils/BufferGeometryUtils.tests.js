/* global QUnit */

import * as BufferGeometryUtils from '../../../../examples/jsm/utils/BufferGeometryUtils';

import { BufferAttribute } from '../../../../src/core/BufferAttribute';
import { BufferGeometry } from '../../../../src/core/BufferGeometry';
import { TriangleStripDrawMode, TriangleFanDrawMode } from '../../../../src/constants';

export default QUnit.module( 'Utils', () => {

	QUnit.module( 'BufferGeometryUtils', () => {

		QUnit.test( 'mergeBufferAttributes - basic', ( assert ) => {

			var array1 = new Float32Array( [ 1, 2, 3, 4 ] );
			var attr1 = new BufferAttribute( array1, 2, false );

			var array2 = new Float32Array( [ 5, 6, 7, 8 ] );
			var attr2 = new BufferAttribute( array2, 2, false );

			var mergedAttr = BufferGeometryUtils.mergeBufferAttributes( [ attr1, attr2 ] );

			assert.smartEqual( Array.from( mergedAttr.array ), [ 1, 2, 3, 4, 5, 6, 7, 8 ], 'merges elements' );
			assert.equal( mergedAttr.itemSize, 2, 'retains .itemSize' );
			assert.equal( mergedAttr.normalized, false, 'retains .normalized' );

		} );

		QUnit.test( 'mergeBufferAttributes - invalid', ( assert ) => {

			var array1 = new Float32Array( [ 1, 2, 3, 4 ] );
			var attr1 = new BufferAttribute( array1, 2, false );

			var array2 = new Float32Array( [ 5, 6, 7, 8 ] );
			var attr2 = new BufferAttribute( array2, 4, false );

			assert.notOk( BufferGeometryUtils.mergeBufferAttributes( [ attr1, attr2 ] ) );

			attr2.itemSize = 2;
			attr2.normalized = true;

			assert.notOk( BufferGeometryUtils.mergeBufferAttributes( [ attr1, attr2 ] ) );

			attr2.normalized = false;

			assert.ok( BufferGeometryUtils.mergeBufferAttributes( [ attr1, attr2 ] ) );

		} );

		QUnit.test( 'mergeBufferGeometries - basic', ( assert ) => {

			var geometry1 = new BufferGeometry();
			geometry1.setAttribute( 'position', new BufferAttribute( new Float32Array( [ 1, 2, 3 ] ), 1, false ) );

			var geometry2 = new BufferGeometry();
			geometry2.setAttribute( 'position', new BufferAttribute( new Float32Array( [ 4, 5, 6 ] ), 1, false ) );

			var mergedGeometry = BufferGeometryUtils.mergeBufferGeometries( [ geometry1, geometry2 ] );

			assert.ok( mergedGeometry, 'merge succeeds' );
			assert.smartEqual( Array.from( mergedGeometry.attributes.position.array ), [ 1, 2, 3, 4, 5, 6 ], 'merges elements' );
			assert.equal( mergedGeometry.attributes.position.itemSize, 1, 'retains .itemSize' );

		} );

		QUnit.test( 'mergeBufferGeometries - indexed', ( assert ) => {

			var geometry1 = new BufferGeometry();
			geometry1.setAttribute( 'position', new BufferAttribute( new Float32Array( [ 1, 2, 3 ] ), 1, false ) );
			geometry1.setIndex( new BufferAttribute( new Uint16Array( [ 0, 1, 2, 2, 1, 0 ] ), 1, false ) );

			var geometry2 = new BufferGeometry();
			geometry2.setAttribute( 'position', new BufferAttribute( new Float32Array( [ 4, 5, 6 ] ), 1, false ) );
			geometry2.setIndex( new BufferAttribute( new Uint16Array( [ 0, 1, 2 ] ), 1, false ) );

			var mergedGeometry = BufferGeometryUtils.mergeBufferGeometries( [ geometry1, geometry2 ] );

			assert.ok( mergedGeometry, 'merge succeeds' );
			assert.smartEqual( Array.from( mergedGeometry.attributes.position.array ), [ 1, 2, 3, 4, 5, 6 ], 'merges elements' );
			assert.smartEqual( Array.from( mergedGeometry.index.array ), [ 0, 1, 2, 2, 1, 0, 3, 4, 5 ], 'merges indices' );
			assert.equal( mergedGeometry.attributes.position.itemSize, 1, 'retains .itemSize' );

		} );

		QUnit.test( 'mergeBufferGeometries - morph targets', ( assert ) => {

			var geometry1 = new BufferGeometry();
			geometry1.setAttribute( 'position', new BufferAttribute( new Float32Array( [ 1, 2, 3 ] ), 1, false ) );
			geometry1.morphAttributes.position = [
				new BufferAttribute( new Float32Array( [ 10, 20, 30 ] ), 1, false ),
				new BufferAttribute( new Float32Array( [ 100, 200, 300 ] ), 1, false )
			];

			var geometry2 = new BufferGeometry();
			geometry2.setAttribute( 'position', new BufferAttribute( new Float32Array( [ 4, 5, 6 ] ), 1, false ) );
			geometry2.morphAttributes.position = [
				new BufferAttribute( new Float32Array( [ 40, 50, 60 ] ), 1, false ),
				new BufferAttribute( new Float32Array( [ 400, 500, 600 ] ), 1, false )
			];

			var mergedGeometry = BufferGeometryUtils.mergeBufferGeometries( [ geometry1, geometry2 ] );

			assert.ok( mergedGeometry, 'merge succeeds' );
			assert.smartEqual( Array.from( mergedGeometry.attributes.position.array ), [ 1, 2, 3, 4, 5, 6 ], 'merges elements' );
			assert.smartEqual( Array.from( mergedGeometry.morphAttributes.position[ 0 ].array ), [ 10, 20, 30, 40, 50, 60 ], 'merges morph targets' );
			assert.smartEqual( Array.from( mergedGeometry.morphAttributes.position[ 1 ].array ), [ 100, 200, 300, 400, 500, 600 ], 'merges morph targets' );
			assert.equal( mergedGeometry.attributes.position.itemSize, 1, 'retains .itemSize' );

		} );

		QUnit.test( 'mergeBufferGeometries - invalid', ( assert ) => {

			var geometry1 = new BufferGeometry();
			geometry1.setAttribute( 'position', new BufferAttribute( new Float32Array( [ 1, 2, 3 ] ), 1, false ) );
			geometry1.setIndex( new BufferAttribute( new Uint16Array( [ 0, 1, 2 ] ), 1, false ) );

			var geometry2 = new BufferGeometry();
			geometry2.setAttribute( 'position', new BufferAttribute( new Float32Array( [ 4, 5, 6 ] ), 1, false ) );

			assert.notOk( BufferGeometryUtils.mergeBufferGeometries( [ geometry1, geometry2 ] ) );

			geometry2.setIndex( new BufferAttribute( new Uint16Array( [ 0, 1, 2 ] ), 1, false ) );

			assert.ok( BufferGeometryUtils.mergeBufferGeometries( [ geometry1, geometry2 ] ) );

			geometry2.setAttribute( 'foo', new BufferAttribute( new Float32Array( [ 1, 2, 3 ] ), 1, false ) );

			assert.notOk( BufferGeometryUtils.mergeBufferGeometries( [ geometry1, geometry2 ] ) );

		} );

		QUnit.test( 'toTrianglesDrawMode()', ( assert ) => {

			// TRIANGLE_STRIP

			const vertices1 = [];

			vertices1.push( 0, 0, 0 ); // v0
			vertices1.push( 1, 0, 0 ); // v1
			vertices1.push( 0, 1, 0 ); // v2
			vertices1.push( 2, 0, 0 ); // v3
			vertices1.push( 2, 1, 0 ); // v4
			vertices1.push( 3, 0, 0 ); // v5

			var geometry1 = new BufferGeometry();

			geometry1.setAttribute( 'position', new BufferAttribute( new Float32Array( vertices1 ), 3 ) );
			geometry1 = BufferGeometryUtils.toTrianglesDrawMode( geometry1, TriangleStripDrawMode );

			assert.deepEqual( geometry1.index.array, new Uint16Array( [ 0, 1, 2, 3, 2, 1, 2, 3, 4, 5, 4, 3 ] ), 'correct triangle indices from triangle strip' );

			// TRIANGLE_FAN

			const vertices2 = [];

			vertices2.push( 0, 0, 0 ); // v0
			vertices2.push( 1, 0, 0 ); // v1
			vertices2.push( 1, 1, 0 ); // v2
			vertices2.push( 0, 1, 0 ); // v3
			vertices2.push( - 1, 1, 0 ); // v4
			vertices2.push( - 1, 0, 0 ); // v5

			var geometry2 = new BufferGeometry();

			geometry2.setAttribute( 'position', new BufferAttribute( new Float32Array( vertices2 ), 3 ) );
			geometry2 = BufferGeometryUtils.toTrianglesDrawMode( geometry2, TriangleFanDrawMode );

			assert.deepEqual( geometry2.index.array, new Uint16Array( [ 0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 5 ] ), 'correct triangle indices from triangle fan' );

		} );

	} );

} );
