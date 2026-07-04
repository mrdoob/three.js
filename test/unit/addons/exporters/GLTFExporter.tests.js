import { GLTFExporter } from '../../../../examples/jsm/exporters/GLTFExporter.js';
import { GLTFLoader } from '../../../../examples/jsm/loaders/GLTFLoader.js';
import { GaussianSplatData } from '../../../../examples/jsm/objects/GaussianSplatData.js';
import { GaussianSplatMesh } from '../../../../examples/jsm/objects/GaussianSplatMesh.js';

const EPS = 1e-5;

function closeTo( assert, actual, expected, message ) {

	assert.ok( Math.abs( actual - expected ) < EPS, `${ message }: ${ actual } ~= ${ expected }` );

}

function createGaussianSplatMesh() {

	return new GaussianSplatMesh( new GaussianSplatData( {
		centers: new Float32Array( [ 1, 2, 3 ] ),
		covariances: new Float32Array( [ 4, 0, 0, 9, 0, 16 ] ),
		colors: new Uint8Array( [ 128, 128, 128, 128 ] )
	} ) );

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Exporters', () => {

		QUnit.module( 'GLTFExporter', () => {

			QUnit.test( 'exports GaussianSplatMesh with KHR_gaussian_splatting primitive', async ( assert ) => {

				const exporter = new GLTFExporter();
				const json = await exporter.parseAsync( createGaussianSplatMesh() );
				const primitive = json.meshes[ 0 ].primitives[ 0 ];

				assert.strictEqual( primitive.mode, 0, 'exports a POINTS primitive' );
				assert.ok( json.extensionsUsed.includes( 'KHR_gaussian_splatting' ), 'marks extension used' );
				assert.ok( primitive.extensions.KHR_gaussian_splatting, 'writes primitive extension' );
				assert.strictEqual( primitive.extensions.KHR_gaussian_splatting.kernel, 'ellipse', 'writes ellipse kernel' );
				assert.ok( primitive.attributes.POSITION !== undefined, 'writes POSITION' );
				assert.ok( primitive.attributes.COLOR_0 !== undefined, 'writes fallback COLOR_0' );
				assert.ok( primitive.attributes[ 'KHR_gaussian_splatting:SCALE' ] !== undefined, 'writes splat scale' );
				assert.ok( primitive.attributes[ 'KHR_gaussian_splatting:ROTATION' ] !== undefined, 'writes splat rotation' );
				assert.ok( primitive.attributes[ 'KHR_gaussian_splatting:OPACITY' ] !== undefined, 'writes splat opacity' );
				assert.ok( primitive.attributes[ 'KHR_gaussian_splatting:SH_DEGREE_0_COEF_0' ] !== undefined, 'writes degree-0 SH' );

			} );

			QUnit.test( 'round-trips exported GaussianSplatMesh through GLTFLoader', async ( assert ) => {

				const exporter = new GLTFExporter();
				const loader = new GLTFLoader();
				const json = await exporter.parseAsync( createGaussianSplatMesh() );
				const gltf = await loader.parseAsync( JSON.stringify( json ), '' );
				const mesh = gltf.scene.children[ 0 ];

				assert.ok( mesh.isGaussianSplatMesh, 'loads exported splat as GaussianSplatMesh' );
				assert.deepEqual( Array.from( mesh.splatData.centers ), [ 1, 2, 3 ], 'round-trips centers' );
				closeTo( assert, mesh.splatData.covariances[ 0 ], 4, 'round-trips covariance xx' );
				closeTo( assert, mesh.splatData.covariances[ 3 ], 9, 'round-trips covariance yy' );
				closeTo( assert, mesh.splatData.covariances[ 5 ], 16, 'round-trips covariance zz' );
				assert.deepEqual( Array.from( mesh.splatData.colors ), [ 128, 128, 128, 128 ], 'round-trips color and opacity' );

			} );

		} );

	} );

} );
