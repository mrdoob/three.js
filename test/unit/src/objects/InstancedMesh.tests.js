import { InstancedMesh } from '../../../../src/objects/InstancedMesh.js';

import { Mesh } from '../../../../src/objects/Mesh.js';
import { BoxGeometry } from '../../../../src/geometries/BoxGeometry.js';
import { Matrix4 } from '../../../../src/math/Matrix4.js';
import MeshBasicNodeMaterial from '../../../../src/materials/nodes/MeshBasicNodeMaterial.js';
import { PerspectiveCamera } from '../../../../src/cameras/PerspectiveCamera.js';
import { Scene } from '../../../../src/scenes/Scene.js';
import WebGPURenderer from '../../../../src/renderers/webgpu/WebGPURenderer.js';

export default QUnit.module( 'Objects', () => {

	QUnit.module( 'InstancedMesh', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new InstancedMesh();
			assert.strictEqual(
				object instanceof Mesh, true,
				'InstancedMesh extends from Mesh'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new InstancedMesh();
			assert.ok( object, 'Can instantiate a InstancedMesh.' );

		} );

		QUnit.test( 'Instance matrix buffer uses the backing capacity', ( assert ) => {

			const canvas = {
				style: {},
				width: 4,
				height: 4,
				addEventListener() {},
				removeEventListener() {},
				getRootNode() {

					return {};

				}
			};
			const renderer = new WebGPURenderer( { canvas } );
			renderer._initialized = true;
			renderer.backend.hasFeature = () => true;
			renderer.backend.renderer = renderer;
			renderer.backend.capabilities = { getUniformBufferLimit: () => 65536 };

			const geometry = new BoxGeometry( 1, 1, 1 );
			const material = new MeshBasicNodeMaterial();
			const mesh = new InstancedMesh( geometry, material, 16 );
			mesh.count = 1;
			mesh.setMatrixAt( 0, new Matrix4() );

			const scene = new Scene();
			scene.add( mesh );
			const builder = renderer.backend.createNodeBuilder( mesh, renderer );
			builder.scene = scene;
			builder.camera = new PerspectiveCamera();
			builder.build();

			assert.ok(
				builder.vertexShader.includes( 'value : array< mat4x4<f32>, 16 >' ),
				'The shader buffer keeps the constructor capacity when the draw count is lower.'
			);

			geometry.dispose();
			material.dispose();
			mesh.dispose();

		} );

		// PUBLIC STUFF
		QUnit.test( 'isInstancedMesh', ( assert ) => {

			const object = new InstancedMesh();
			assert.ok(
				object.isInstancedMesh,
				'InstancedMesh.isInstancedMesh should be true'
			);

		} );

		QUnit.test( 'dispose', ( assert ) => {

			assert.expect( 0 );

			const object = new InstancedMesh();
			object.dispose();

		} );

	} );

} );
