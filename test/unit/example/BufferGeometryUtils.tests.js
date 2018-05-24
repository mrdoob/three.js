/**
 * @author Don McCurdy / https://www.donmccurdy.com
 */
/* global QUnit */

import * as BufferGeometryUtils from '../../../examples/js/BufferGeometryUtils';

export default QUnit.module( 'BufferGeometryUtils', () => {

  QUnit.test( 'mergeBufferAttributes - basic', ( assert ) => {

    var array1 = new Float32Array( [ 1, 2, 3, 4 ] );
    var attr1 = new THREE.BufferAttribute( array1, 2, false );

    var array2 = new Float32Array( [ 5, 6, 7, 8 ] );
    var attr2 = new THREE.BufferAttribute( array2, 2, false );

    var mergedAttr = THREE.BufferGeometryUtils.mergeBufferAttributes( [ attr1, attr2 ] );

    assert.smartEqual( Array.from( mergedAttr.array ), [ 1, 2, 3, 4, 5, 6, 7, 8 ], 'merges elements' );
    assert.equal( mergedAttr.itemSize, 2, 'retains .itemSize' );
    assert.equal( mergedAttr.normalized, false, 'retains .normalized' );

  } );

  QUnit.test( 'mergeBufferAttributes - invalid', ( assert ) => {

    var array1 = new Float32Array( [ 1, 2, 3, 4 ] );
    var attr1 = new THREE.BufferAttribute( array1, 2, false );

    var array2 = new Float32Array( [ 5, 6, 7, 8 ] );
    var attr2 = new THREE.BufferAttribute( array2, 4, false );

    assert.notOk( THREE.BufferGeometryUtils.mergeBufferAttributes( [ attr1, attr2 ] ) );

    attr2.itemSize = 2;
    attr2.normalized = true;

    assert.notOk( THREE.BufferGeometryUtils.mergeBufferAttributes( [ attr1, attr2 ] ) );

    attr2.normalized = false;

    assert.ok( THREE.BufferGeometryUtils.mergeBufferAttributes( [ attr1, attr2 ] ) );

  } );

  QUnit.test( 'mergeBufferGeometries - basic', ( assert ) => {

    var geometry1 = new THREE.BufferGeometry();
    geometry1.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( [ 1, 2, 3 ] ), 1, false ) );

    var geometry2 = new THREE.BufferGeometry();
    geometry2.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( [ 4, 5, 6 ] ), 1, false ) );

    var mergedGeometry = THREE.BufferGeometryUtils.mergeBufferGeometries( [ geometry1, geometry2 ] );

    assert.ok( mergedGeometry, 'merge succeeds' );
    assert.smartEqual( Array.from( mergedGeometry.attributes.position.array ), [ 1, 2, 3, 4, 5, 6 ], 'merges elements' );
    assert.equal( mergedGeometry.attributes.position.itemSize, 1, 'retains .itemSize' );

  } );

  QUnit.test( 'mergeBufferGeometries - indexed', ( assert ) => {

    var geometry1 = new THREE.BufferGeometry();
    geometry1.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( [ 1, 2, 3 ] ), 1, false ) );
    geometry1.setIndex( new THREE.BufferAttribute( new Uint16Array( [ 0, 1, 2, 2, 1, 0 ] ), 1, false ) );

    var geometry2 = new THREE.BufferGeometry();
    geometry2.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( [ 4, 5, 6 ] ), 1, false ) );
    geometry2.setIndex( new THREE.BufferAttribute( new Uint16Array( [ 0, 1, 2 ] ), 1, false ) );

    var mergedGeometry = THREE.BufferGeometryUtils.mergeBufferGeometries( [ geometry1, geometry2 ] );

    assert.ok( mergedGeometry, 'merge succeeds' );
    assert.smartEqual( Array.from( mergedGeometry.attributes.position.array ), [ 1, 2, 3, 4, 5, 6 ], 'merges elements' );
    assert.smartEqual( Array.from( mergedGeometry.index.array ), [ 0, 1, 2, 2, 1, 0, 3, 4, 5 ], 'merges indices' );
    assert.equal( mergedGeometry.attributes.position.itemSize, 1, 'retains .itemSize' );

  } );

  QUnit.test( 'mergeBufferGeometries - morph targets', ( assert ) => {

    var geometry1 = new THREE.BufferGeometry();
    geometry1.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( [ 1, 2, 3 ] ), 1, false ) );
    geometry1.morphAttributes.position = [
      new THREE.BufferAttribute( new Float32Array( [ 10, 20, 30 ] ), 1, false ),
      new THREE.BufferAttribute( new Float32Array( [ 100, 200, 300 ] ), 1, false )
    ];

    var geometry2 = new THREE.BufferGeometry();
    geometry2.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( [ 4, 5, 6 ] ), 1, false ) );
    geometry2.morphAttributes.position = [
      new THREE.BufferAttribute( new Float32Array( [ 40, 50, 60 ] ), 1, false ),
      new THREE.BufferAttribute( new Float32Array( [ 400, 500, 600 ] ), 1, false )
    ];

    var mergedGeometry = THREE.BufferGeometryUtils.mergeBufferGeometries( [ geometry1, geometry2 ] );

    assert.ok( mergedGeometry, 'merge succeeds' );
    assert.smartEqual( Array.from( mergedGeometry.attributes.position.array ), [ 1, 2, 3, 4, 5, 6 ], 'merges elements' );
    assert.smartEqual( Array.from( mergedGeometry.morphAttributes.position[ 0 ].array ), [ 10, 20, 30, 40, 50, 60 ], 'merges morph targets' );
    assert.smartEqual( Array.from( mergedGeometry.morphAttributes.position[ 1 ].array ), [ 100, 200, 300, 400, 500, 600 ], 'merges morph targets' );
    assert.equal( mergedGeometry.attributes.position.itemSize, 1, 'retains .itemSize' );

  } );

  QUnit.test( 'mergeBufferGeometries - invalid', ( assert ) => {

    var geometry1 = new THREE.BufferGeometry();
    geometry1.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( [ 1, 2, 3 ] ), 1, false ) );
    geometry1.setIndex( new THREE.BufferAttribute( new Uint16Array( [ 0, 1, 2 ] ), 1, false ) );

    var geometry2 = new THREE.BufferGeometry();
    geometry2.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( [ 4, 5, 6 ] ), 1, false ) );

    assert.notOk( THREE.BufferGeometryUtils.mergeBufferGeometries( [ geometry1, geometry2 ] ) );

    geometry2.setIndex( new THREE.BufferAttribute( new Uint16Array( [ 0, 1, 2 ] ), 1, false ) );

    assert.ok( THREE.BufferGeometryUtils.mergeBufferGeometries( [ geometry1, geometry2 ] ) );

    geometry2.addAttribute( 'foo', new THREE.BufferAttribute( new Float32Array( [ 1, 2, 3 ] ), 1, false ) );

    assert.notOk( THREE.BufferGeometryUtils.mergeBufferGeometries( [ geometry1, geometry2 ] ) );

  } );

} );
