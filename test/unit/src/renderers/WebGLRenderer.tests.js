import { DirectionalLight } from '../../../../src/lights/DirectionalLight.js';
import { InstancedMesh } from '../../../../src/objects/InstancedMesh.js';
import { MeshBasicMaterial } from '../../../../src/materials/MeshBasicMaterial.js';
import { Matrix4 } from '../../../../src/math/Matrix4.js';
import { OrthographicCamera } from '../../../../src/cameras/OrthographicCamera.js';
import { PlaneGeometry } from '../../../../src/geometries/PlaneGeometry.js';
import { Scene } from '../../../../src/scenes/Scene.js';
import { WebGLRenderer } from '../../../../src/renderers/WebGLRenderer.js';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGLRenderer', () => {

		QUnit.test( 'updates instanced geometry when the shadow map is not updated', ( assert ) => {

			const canvas = document.createElement( 'canvas' );
			const renderer = new WebGLRenderer( { canvas, antialias: false } );
			renderer.setSize( 200, 100, false );
			renderer.setPixelRatio( 1 );
			renderer.setClearColor( 0x000000, 1 );
			renderer.shadowMap.enabled = true;
			renderer.shadowMap.autoUpdate = false;

			const scene = new Scene();
			const camera = new OrthographicCamera( - 1, 1, 0.5, - 0.5, 0.1, 10 );
			camera.position.z = 5;

			const light = new DirectionalLight( 0xffffff, 3 );
			light.position.z = 5;
			light.castShadow = true;
			scene.add( light, light.target );

			const mesh = new InstancedMesh( new PlaneGeometry( 0.8, 0.8 ), new MeshBasicMaterial( { color: 0xff0000 } ), 1 );
			mesh.castShadow = true;
			scene.add( mesh );

			const matrix = new Matrix4();
			const gl = renderer.getContext();
			const pixel = new Uint8Array( 4 );

			for ( let frame = 1; frame <= 2; frame ++ ) {

				const x = frame === 1 ? - 0.5 : 0.5;
				mesh.setMatrixAt( 0, matrix.makeTranslation( x, 0, 0 ) );
				mesh.instanceMatrix.needsUpdate = true;
				renderer.shadowMap.needsUpdate = frame === 1;
				renderer.render( scene, camera );

			}

			gl.readPixels( 150, 50, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel );
			mesh.geometry.dispose();
			mesh.material.dispose();
			renderer.dispose();

			assert.ok( pixel[ 0 ] > 128, 'the instance is drawn at its updated position after the shadow pass is skipped' );

		} );

	} );

} );
