/**
 * @author Don McCurdy / https://www.donmccurdy.com
 */
/* global QUnit */

import * as GLTFExporter from '../../../../examples/js/exporters/GLTFExporter';

export default QUnit.module( 'Exporters', () => {

  QUnit.module( 'GLTFExporter', () => {

    QUnit.test( 'constructor', ( assert ) => {

      assert.ok( new THREE.GLTFExporter(), 'Can instantiate an exporter.' );

    } );

    QUnit.test( 'parse - metadata', ( assert ) => {

      var done = assert.async();

      var object = new THREE.Object3D();

      var exporter = new THREE.GLTFExporter();

      exporter.parse( object, function ( gltf ) {

        assert.equal( '2.0', gltf.asset.version, 'asset.version' );
        assert.equal( 'THREE.GLTFExporter', gltf.asset.generator, 'asset.generator' );

        done();

      } );

    } );

    QUnit.test( 'parse - basic', ( assert ) => {

      var done = assert.async();

      var box = new THREE.Mesh(
        new THREE.CubeGeometry( 1, 1, 1 ),
        new THREE.MeshStandardMaterial( { color: 0xFF0000 } )
      );

      var exporter = new THREE.GLTFExporter();

      exporter.parse( box, function ( gltf ) {

        assert.equal( 1, gltf.nodes.length, 'correct number of nodes' );
        assert.equal( 0, gltf.nodes[ 0 ].mesh, 'node references mesh' );
        assert.equal( 1, gltf.meshes[ 0 ].primitives.length, 'correct number of primitives' );

        var primitive = gltf.meshes[ 0 ].primitives[ 0 ];
        var material = gltf.materials[ primitive.material ];

        assert.equal( 4, primitive.mode, 'mesh uses TRIANGLES mode' );
        assert.ok( primitive.attributes.POSITION !== undefined, 'mesh contains position data' );
        assert.ok( primitive.attributes.NORMAL !== undefined, 'mesh contains normal data' );

        assert.smartEqual( {

          baseColorFactor: [ 1, 0, 0, 1 ],
          metallicFactor: 0.5,
          roughnessFactor: 0.5

        }, material.pbrMetallicRoughness, 'material' );

        done();

      } );

    } );

    QUnit.test( 'parse - animation', ( assert ) => {

      var done = assert.async();

      var mesh1 = new THREE.Mesh();
      mesh1.name = 'mesh1';

      var mesh2 = new THREE.Mesh();
      mesh2.name = 'mesh2';

      var mesh3 = new THREE.Mesh();
      mesh3.name = 'mesh3';

      var scene = new THREE.Scene();
      scene.add( mesh1, mesh2, mesh3 );

      var clip1 = new THREE.AnimationClip( 'clip1', undefined, [

        new THREE.VectorKeyframeTrack( 'mesh1.position', [ 0, 1, 2 ], [ 0, 0, 0, 30, 0, 0, 0, 0, 0 ] )

      ] );

      var clip2 = new THREE.AnimationClip( 'clip2', undefined, [

        new THREE.VectorKeyframeTrack( 'mesh3.scale', [ 0, 1, 2 ], [ 1, 1, 1, 2, 2, 2, 1, 1, 1 ] )

      ] );

      var exporter = new THREE.GLTFExporter();

      exporter.parse( scene, function ( gltf ) {

        assert.equal( 2, gltf.animations.length, 'one animation per clip' );

        var target1 = gltf.animations[ 0 ].channels[ 0 ].target;
        var target2 = gltf.animations[ 1 ].channels[ 0 ].target;

        assert.equal( 'mesh1', gltf.nodes[ target1.node ].name, 'clip1 node' );
        assert.equal( 'translation', target1.path, 'clip1 property' );
        assert.equal( 'mesh3', gltf.nodes[ target2.node ].name, 'clip2 node' );
        assert.equal( 'scale', target2.path, 'clip2 property' );

        done();

      }, { animations: [ clip1, clip2 ] } );

    } );

    QUnit.test( 'parse - empty buffergeometry', ( assert ) => {

      var done = assert.async();

      var scene = new THREE.Scene();
      var geometry = new THREE.BufferGeometry();
      var numElements = 6;

      var positions = new Float32Array( ( numElements ) * 3 );
      var colors = new Float32Array( ( numElements ) * 3 );

      geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
      geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
      geometry.setDrawRange( 0, 0 );

      var empty = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { side: THREE.DoubleSide, vertexColors: THREE.VertexColors } ) );
      empty.name = 'Custom buffered empty (drawrange)';
      scene.add( empty );

      var exporter = new THREE.GLTFExporter();

      exporter.parse( scene, function ( gltf ) {

        assert.equal( gltf.meshes, undefined, 'empty meshes');
        assert.equal( gltf.materials, undefined, 'empty materials');
        assert.equal( gltf.bufferViews, undefined, 'empty bufferViews');
        assert.equal( gltf.buffers, undefined, 'buffers');
        assert.equal( gltf.accessors, undefined, 'accessors');
        assert.equal( gltf.nodes[0].mesh, undefined, 'nodes[0].mesh');

        done();

      });

    } );

  } );

} );
