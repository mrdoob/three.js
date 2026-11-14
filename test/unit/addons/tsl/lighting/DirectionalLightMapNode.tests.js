import { BasicLightMapNode, InstancedBufferAttribute, IrradianceNode, MeshBasicNodeMaterial, MeshStandardMaterial, MeshStandardNodeMaterial, PlaneGeometry, Texture } from 'three/webgpu';
import { materialLightMap } from 'three/tsl';
import { DirectionalLightMapNode, directionalLightMap, instancedLightMap } from '../../../../../examples/jsm/tsl/lighting/DirectionalLightMapNode.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'TSL', () => {

		QUnit.module( 'DirectionalLightMapNode', () => {

			QUnit.test( 'directionalLightMap() shades lit light maps with the direction texture', assert => {

				const material = new MeshStandardMaterial( { lightMap: new Texture() } );
				const direction = new Texture();
				const builder = { material };

				directionalLightMap( material, direction, { specularIntensity: 0.5 } );
				assert.strictEqual( material.lightMapDirection, direction, 'Keeps the direction texture on the material' );
				assert.strictEqual( material.lightMapSpecularIntensity, 0.5 );

				const node = material.setupLightMap.call( new MeshStandardNodeMaterial(), builder );
				assert.true( node instanceof DirectionalLightMapNode, 'Lit materials use the directional light map' );
				assert.notStrictEqual( node.specularIntensityNode, null, 'with a specular term' );
				assert.false( material.setupLightMap.call( new MeshBasicNodeMaterial(), builder ) instanceof DirectionalLightMapNode, 'Unlit materials keep their light map' );

				directionalLightMap( material, direction, { specularIntensity: 0 } );
				assert.strictEqual( material.setupLightMap.call( new MeshStandardNodeMaterial(), builder ).specularIntensityNode, null, 'A zero intensity leaves the specular term out' );

				material.lightMap = null;
				assert.strictEqual( material.setupLightMap.call( new MeshStandardNodeMaterial(), builder ), null, 'Materials without a light map get no light map node' );

				material.lightMap = new Texture();
				directionalLightMap( material, null );
				assert.false( Object.hasOwn( material, 'setupLightMap' ), 'A null direction texture restores the default light map' );
				assert.strictEqual( material.lightMapDirection, undefined );
				assert.true( new MeshStandardNodeMaterial().setupLightMap( builder ) instanceof IrradianceNode );

			} );

			QUnit.test( 'instancedLightMap() and directionalLightMap() compose in any order', assert => {

				const instanced = new PlaneGeometry();
				instanced.setAttribute( 'instanceLightMapOffset', new InstancedBufferAttribute( new Float32Array( 2 ), 2 ) );
				const plain = new PlaneGeometry();
				const direction = new Texture();

				for ( const order of [ 0, 1 ] ) {

					const material = new MeshStandardMaterial( { lightMap: new Texture() } );

					if ( order === 0 ) {

						instancedLightMap( material );
						directionalLightMap( material, direction );

					} else {

						directionalLightMap( material, direction );
						instancedLightMap( material );

					}

					const node = material.setupLightMap.call( new MeshStandardNodeMaterial(), { material, geometry: instanced } );
					assert.true( node instanceof DirectionalLightMapNode, 'Instanced directional light maps keep their directions' );
					assert.notStrictEqual( node.lightMapNode, materialLightMap, 'and look their light map up in the instance regions' );
					assert.strictEqual( material.setupLightMap.call( new MeshStandardNodeMaterial(), { material, geometry: plain } ).lightMapNode, materialLightMap, 'Meshes without instances use the light map UVs' );

					directionalLightMap( material, null );
					assert.true( Object.hasOwn( material, 'setupLightMap' ), 'Removing the direction keeps the instanced light map' );
					assert.true( material.setupLightMap.call( new MeshStandardNodeMaterial(), { material, geometry: instanced } ) instanceof IrradianceNode );
					assert.true( material.setupLightMap.call( new MeshBasicNodeMaterial(), { material, geometry: instanced } ) instanceof BasicLightMapNode, 'Unlit materials keep a basic light map' );

				}

				instanced.dispose();
				plain.dispose();

			} );

		} );

	} );

} );
