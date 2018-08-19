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

    QUnit.test( 'parse - individual morph targets', ( assert ) => {

      var done = assert.async();

      // Creates a geometry with four (4) morph targets, three (3) of which are
      // animated by an animation clip. Because glTF requires all morph targets
      // to be animated in unison, the exporter should write an empty track for
      // the fourth target.

      var geometry = new THREE.BufferGeometry();
      var position = new THREE.BufferAttribute( new Float32Array( [ 0, 0, 0, 0, 0, 1, 1, 0, 1 ] ), 3 );
      geometry.addAttribute( 'position',  position );
      geometry.morphAttributes.position = [ position, position, position, position ];

      var mesh = new THREE.Mesh( geometry );
      mesh.morphTargetDictionary.a = 0;
      mesh.morphTargetDictionary.b = 1;
      mesh.morphTargetDictionary.c = 2;
      mesh.morphTargetDictionary.d = 3;

      var timesA =  [ 0, 1, 2 ];
      var timesB =  [       2, 3, 4 ];
      var timesC =  [             4, 5, 6 ];
      var valuesA = [ 0, 1, 0 ];
      var valuesB = [       0, 1, 0 ];
      var valuesC = [             0, 1, 0 ];
      var trackA = new THREE.VectorKeyframeTrack( '.morphTargetInfluences[a]', timesA, valuesA, THREE.InterpolateLinear );
      var trackB = new THREE.VectorKeyframeTrack( '.morphTargetInfluences[b]', timesB, valuesB, THREE.InterpolateLinear );
      var trackC = new THREE.VectorKeyframeTrack( '.morphTargetInfluences[c]', timesC, valuesC, THREE.InterpolateLinear );

      var clip = new THREE.AnimationClip( 'clip1', undefined, [ trackA, trackB, trackC ] );

      var exporter = new THREE.GLTFExporter();

      exporter.parse( mesh, function ( gltf ) {

        assert.equal( 1, gltf.animations.length, 'one animation' );
        assert.equal( 1, gltf.animations[ 0 ].channels.length, 'one channel' );
        assert.equal( 1, gltf.animations[ 0 ].samplers.length, 'one sampler' );

        var channel = gltf.animations[ 0 ].channels[ 0 ];
        var sampler = gltf.animations[ 0 ].samplers[ 0 ];

        assert.smartEqual( channel, { sampler: 0, target: { node: 0, path: 'weights' } } );
        assert.equal( sampler.interpolation, 'LINEAR' );

        var input = gltf.accessors[ sampler.input ];
        var output = gltf.accessors[ sampler.output ];

        assert.equal( input.count, 7 );
        assert.equal( input.type, 'SCALAR' );
        assert.smartEqual( input.min, [ 0 ] );
        assert.smartEqual( input.max, [ 6 ] );

        assert.equal( output.count, 28 ); // 4 targets * 7 frames
        assert.equal( output.type, 'SCALAR' );
        assert.smartEqual( output.min, [ 0 ] );
        assert.smartEqual( output.max, [ 1 ] );

        done();

      }, { animations: [ clip ] } );

    } );

  } );

} );
