import {
	Group,
	PerspectiveCamera
} from 'three';

import { GaussianSplatMesh } from '../../../../examples/jsm/objects/GaussianSplatMesh.js';
import { createGaussianSplatGeometry } from '../../../../examples/jsm/utils/GaussianSplatUtils.js';

function createMesh( centers = new Float32Array( [ 0, 0, 0 ] ) ) {

	const count = centers.length / 3;
	const covariances = new Float32Array( count * 6 );
	const colors = new Uint8Array( count * 4 );

	for ( let i = 0; i < count; i ++ ) {

		const i4 = i * 4;
		const i6 = i * 6;

		covariances[ i6 ] = 1;
		covariances[ i6 + 3 ] = 1;
		covariances[ i6 + 5 ] = 1;
		colors.fill( 255, i4, i4 + 4 );

	}

	const geometry = createGaussianSplatGeometry(
		centers,
		covariances,
		colors
	);

	return new GaussianSplatMesh( geometry, { autoSort: false } );

}

function createCamera() {

	const camera = new PerspectiveCamera( 60, 1, 0.1, 100 );
	camera.position.z = 5;
	camera.updateMatrixWorld();

	return camera;

}

function createRenderer() {

	return {
		computeCalls: 0,
		compute() {

			this.computeCalls ++;

		}
	};

}

function createWebGLRenderer() {

	return {
		backend: {
			isWebGLBackend: true
		}
	};

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Objects', () => {

		QUnit.module( 'GaussianSplatMesh', () => {

			QUnit.test( 'sorts on camera rotation but not translation', ( assert ) => {

				const mesh = createMesh();
				const camera = createCamera();
				const renderer = createRenderer();

				assert.true( mesh.updateSort( renderer, camera ), 'initial render sorts' );
				assert.strictEqual( renderer.computeCalls, 4, 'initial sort dispatches four compute passes' );
				assert.false( mesh.updateSort( renderer, camera ), 'unchanged camera does not sort again' );

				camera.position.set( 2, 1, 3 );
				camera.updateMatrixWorld();

				assert.false( mesh.updateSort( renderer, camera ), 'camera translation does not sort' );

				camera.rotation.y = 0.1;
				camera.updateMatrixWorld();

				assert.true( mesh.updateSort( renderer, camera ), 'camera rotation sorts' );
				assert.strictEqual( renderer.computeCalls, 8, 'camera rotation dispatches one sort' );

			} );

			QUnit.test( 'sorts on mesh rotation but not translation', ( assert ) => {

				const mesh = createMesh();
				const camera = createCamera();
				const renderer = createRenderer();

				mesh.updateSort( renderer, camera );
				mesh.position.set( 2, 1, 3 );

				assert.false( mesh.updateSort( renderer, camera ), 'mesh translation does not sort' );

				mesh.rotation.y = 0.1;

				assert.true( mesh.updateSort( renderer, camera ), 'mesh rotation sorts' );

			} );

			QUnit.test( 'preserves the sort order on camera translation', ( assert ) => {

				const centers = new Float32Array( [
					0, 0, - 2,
					0, 0, 2,
					0, 0, - 1,
					0, 0, 1,
					0, 0, 0
				] );
				const mesh = createMesh( centers );
				const camera = createCamera();
				const renderer = createWebGLRenderer();

				mesh.updateSort( renderer, camera );
				camera.position.set( 2, 1, 8 );
				camera.updateMatrixWorld();

				assert.false( mesh.updateSort( renderer, camera ), 'translated camera does not sort' );

				const translatedOrder = Array.from( mesh._sort.orderAttribute.array );
				const referenceMesh = createMesh( centers );

				referenceMesh.updateSort( createWebGLRenderer(), camera );

				assert.deepEqual(
					translatedOrder,
					Array.from( referenceMesh._sort.orderAttribute.array ),
					'translated order matches a fresh sort'
				);

			} );

			QUnit.test( 'accounts for parent transforms and non-uniform scale', ( assert ) => {

				const mesh = createMesh();
				const parent = new Group();
				const camera = createCamera();
				const renderer = createRenderer();

				parent.add( mesh );
				mesh.updateSort( renderer, camera );

				parent.position.set( 2, 1, 3 );

				assert.false( mesh.updateSort( renderer, camera ), 'parent translation does not sort' );

				parent.rotation.y = 0.1;

				assert.true( mesh.updateSort( renderer, camera ), 'parent rotation sorts' );

				mesh.scale.setScalar( 2 );

				assert.false( mesh.updateSort( renderer, camera ), 'uniform scale does not sort' );

				mesh.scale.set( 4, 2, 2 );

				assert.true( mesh.updateSort( renderer, camera ), 'non-uniform scale that changes local depth direction sorts' );

			} );

		} );

	} );

} );
