/* global QUnit */

import { USDZExporter } from '../../../../examples/jsm/exporters/USDZExporter.js';
import { USDLoader } from '../../../../examples/jsm/loaders/USDLoader.js';
import {
	unzipSync,
	strFromU8,
} from '../../../../examples/jsm/libs/fflate.module.js';
import {
	BoxGeometry,
	Mesh,
	MeshStandardMaterial,
	Scene,
	SphereGeometry,
} from '../../../../src/Three.js';

function isValidUSDA( usda ) {

	const header = usda.split( '\n' )[ 0 ];
	if ( header !== '#usda 1.0' ) return false;

	return true;

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Exporters', () => {

		QUnit.module( 'USDZExporter', () => {

			QUnit.test( 'methods', ( assert ) => {

				const exporter = new USDZExporter();
				assert.ok(
					exporter instanceof USDZExporter,
					'USDZExporter can be instantiated'
				);
				assert.ok(
					typeof exporter.parseAsync === 'function',
					'parseAsync method exists'
				);
				assert.ok( typeof exporter.parse === 'function', 'parse method exists' );
				assert.ok(
					typeof exporter.setTextureUtils === 'function',
					'setTextureUtils method exists'
				);

			} );

			QUnit.test( 'export basic scene', async ( assert ) => {

				const exporter = new USDZExporter();

				const scene = new Scene();
				const geometry = new BoxGeometry( 1, 1, 1 );
				const material = new MeshStandardMaterial( {
					color: 0x00ff00,
					roughness: 0.5,
					metalness: 0.8,
				} );
				const mesh = new Mesh( geometry, material );
				mesh.name = 'box';
				scene.add( mesh );

				const result = await exporter.parseAsync( scene );

				assert.ok(
					result.buffer instanceof ArrayBuffer,
					'Export returns a ArrayBuffer'
				);
				assert.ok(
					result.buffer.byteLength > 0,
					'ArrayBuffer has non-zero length'
				);

				const unzipped = unzipSync( result );
				const fileNames = Object.keys( unzipped );

				const modelFileName = 'model.usda';

				assert.ok( fileNames.length > 0, 'ZIP contains at least one file' );
				assert.equal(
					fileNames[ 0 ],
					modelFileName,
					`First file is ${modelFileName}`
				);
				assert.ok(
					isValidUSDA( strFromU8( unzipped[ modelFileName ] ) ),
					`${modelFileName} has content`
				);

			} );

			QUnit.test( 'export scene with onlyVisible option', async ( assert ) => {

				const exporter = new USDZExporter( );

				const scene = new Scene();

				const geometry = new BoxGeometry( 1, 1, 1 );
				const material1 = new MeshStandardMaterial( { color: 0xff0000 } );
				const material2 = new MeshStandardMaterial( { color: 0x00ff00 } );

				const box1 = new Mesh( geometry, material1 );
				box1.name = 'box1';
				box1.position.set( - 1, 0, 0 );

				const box2 = new Mesh( geometry, material2 );
				box2.name = 'box2';
				box2.position.set( 1, 0, 0 );
				box2.visible = false;

				scene.add( box1 );
				scene.add( box2 );

				// onlyVisible = true

				const options = {
					onlyVisible: true,
				};
				const exportResult = await exporter.parseAsync( scene, options );

				assert.ok(
					exportResult.buffer instanceof ArrayBuffer,
					'Export returns an ArrayBuffer'
				);
				assert.ok(
					exportResult.buffer.byteLength > 0,
					'ArrayBuffer has non-zero length'
				);

				const unzipped = unzipSync( exportResult );
				const fileNames = Object.keys( unzipped );
				const modelFileName = 'model.usda';

				assert.ok( fileNames.includes( modelFileName ), `ZIP contains ${modelFileName}` );

				const usdaContent = strFromU8( unzipped[ modelFileName ] );
				assert.ok( isValidUSDA( usdaContent ), `${modelFileName} is valid USDA` );

				assert.ok( usdaContent.includes( 'box1' ), 'USDA contains box1' );
				assert.ok( ! usdaContent.includes( 'box2' ), 'USDA does not contain box2' );

				// onlyVisible = false

				options.onlyVisible = false;
				const exportResult2 = await exporter.parseAsync( scene, options );

				assert.ok(
					exportResult2.buffer instanceof ArrayBuffer,
					'Export returns an ArrayBuffer'
				);
				assert.ok(
					exportResult2.buffer.byteLength > 0,
					'ArrayBuffer has non-zero length'
				);

				const unzipped2 = unzipSync( exportResult2 );
				const fileNames2 = Object.keys( unzipped2 );

				assert.ok( fileNames2.includes( modelFileName ), `ZIP contains ${modelFileName}` );

				const usdaContent2 = strFromU8( unzipped2[ modelFileName ] );
				assert.ok( isValidUSDA( usdaContent2 ), `${modelFileName} is valid USDA` );

				assert.ok( usdaContent2.includes( 'box1' ), 'USDA contains box1' );
				assert.ok( usdaContent2.includes( 'box2' ), 'USDA contains box2' );

			} );

			QUnit.test( 'export and import', async ( assert ) => {

				const exporter = new USDZExporter();

				const originalScene = new Scene();
				const boxGeometry = new BoxGeometry( 1, 1, 1 );
				const boxMaterial = new MeshStandardMaterial( {
					color: 0x00ff00,
					roughness: 0.5,
					metalness: 0.8,
				} );
				const box = new Mesh( boxGeometry, boxMaterial );
				box.name = 'box1';
				box.position.set( 1, 2, 3 );
				box.scale.set( 0.5, 1.5, 2.0 );
				box.rotation.set( Math.PI / 4, Math.PI / 3, Math.PI / 2 );
				originalScene.add( box );

				const sphereGeometry = new SphereGeometry( 1, 8, 6 );
				const sphereMaterial = new MeshStandardMaterial( {
					color: 0x0000ff,
					roughness: 0.9,
					metalness: 0.1,
				} );
				const sphere = new Mesh( sphereGeometry, sphereMaterial );
				sphere.name = 'sphere1';
				sphere.position.set( 0, 0, 0 );
				originalScene.add( sphere );

				const meshes = [ box, sphere ];

				originalScene.updateMatrixWorld( true );

				const exportResult = await exporter.parseAsync( originalScene );

				assert.ok(
					exportResult.buffer instanceof ArrayBuffer,
					'Export returns an ArrayBuffer'
				);

				const loader = new USDLoader();
				const importedScene = loader.parse( exportResult.buffer );

				assert.ok( importedScene, 'Loader successfully parses exported data' );

				for ( const mesh of meshes ) {

					const name = mesh.name;

					const importedMesh = importedScene.getObjectByName( name );

					assert.ok( importedMesh, 'Found imported mesh in scene' );
					assert.equal( importedMesh.name, name, 'Mesh name preserved' );

					const tolerance = 0.0000001;
					const vectorCloseTo = ( a, b, tolerance ) => {

						assert.closeTo( a.x, b.x, tolerance, 'X matches' );
						assert.closeTo( a.y, b.y, tolerance, 'Y matches' );
						assert.closeTo( a.z, b.z, tolerance, 'Z matches' );

					};

					vectorCloseTo( importedMesh.position, mesh.position, tolerance );
					vectorCloseTo( importedMesh.scale, mesh.scale, tolerance );
					vectorCloseTo( importedMesh.rotation, mesh.rotation, tolerance );

					assert.ok( importedMesh.geometry, 'Geometry exists' );
					assert.ok(
						importedMesh.geometry.attributes.position,
						'Position attribute exists'
					);

					assert.ok( importedMesh.material, 'Material exists' );
					assert.ok( importedMesh.material.isMeshStandardMaterial, 'Material is a MeshStandardMaterial' );
					assert.closeTo( importedMesh.material.color.r, mesh.material.color.r, tolerance, 'Material color r matches' );
					assert.closeTo( importedMesh.material.color.g, mesh.material.color.g, tolerance, 'Material color g matches' );
					assert.closeTo( importedMesh.material.color.b, mesh.material.color.b, tolerance, 'Material color b matches' );
					assert.closeTo( importedMesh.material.roughness, mesh.material.roughness, tolerance, 'Material roughness matches' );
					assert.closeTo( importedMesh.material.metalness, mesh.material.metalness, tolerance, 'Material metalness matches' );

				}

			} );

		} );

	} );

} );
