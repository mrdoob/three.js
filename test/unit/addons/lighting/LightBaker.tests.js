import { Bone, BoxGeometry, Float32BufferAttribute, Group, InstancedMesh, Matrix4, Mesh, MeshStandardMaterial, PlaneGeometry, Scene, Skeleton, SkinnedMesh, Texture, Uint16BufferAttribute } from 'three/webgpu';
import { LightBaker } from '../../../../examples/jsm/lighting/LightBaker.js';

// the options and the preparation of the meshes work without a GPU

const renderer = { toneMapping: 0, toneMappingExposure: 1, shadowMap: { enabled: true } };

function captureWarnings( callback ) {

	const warnings = [];
	const warn = console.warn;
	console.warn = ( message ) => warnings.push( message );

	try {

		callback();

	} finally {

		console.warn = warn;

	}

	return warnings;

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Lighting', () => {

		QUnit.module( 'LightBaker', () => {

			QUnit.test( 'Options have defaults and per algorithm stopping criteria', assert => {

				const baker = new LightBaker( renderer );

				assert.strictEqual( baker.algorithm, 'stochastic' );
				assert.strictEqual( baker.resolution, 1024 );
				assert.strictEqual( baker.pageSize, 2048 );
				assert.strictEqual( baker.directLight, 'live' );
				assert.true( baker.unwrap && baker.directional && baker.denoise && baker.stitchSeams );
				assert.strictEqual( baker.samples, 0 );
				assert.false( baker.converged, 'A bake that has not started has not converged' );

				const tolerances = { stochastic: 0.03, ray: 0.03, probes: 0.02, vxgi: 0.04 };
				const maxSamples = { stochastic: 8192, ray: 1024, probes: 16, vxgi: 256 };

				for ( const algorithm in tolerances ) {

					baker.setOptions( { algorithm, denoise: true } );
					assert.strictEqual( baker.getNoiseTolerance(), tolerances[ algorithm ], `${ algorithm } stops at a higher noise when denoised` );
					assert.strictEqual( baker.getMaxSamples(), maxSamples[ algorithm ] );

					baker.denoise = false;
					assert.strictEqual( baker.getNoiseTolerance(), 0.02 );

				}

				assert.strictEqual( new LightBaker( renderer, { algorithm: 'stochastic' } ).getSamplesPerFrame(), 4 );
				assert.strictEqual( new LightBaker( renderer, { algorithm: 'ray' } ).getSamplesPerFrame(), 1 );

				baker.setOptions( { noiseTolerance: 0.05, maxSamples: 100, samplesPerFrame: 3 } );
				assert.strictEqual( baker.getNoiseTolerance(), 0.05, 'An explicit tolerance overrides the defaults' );
				assert.strictEqual( baker.getMaxSamples(), 100 );
				assert.strictEqual( baker.getSamplesPerFrame(), 3 );

				baker.setOptions( { noiseTolerance: null, maxSamples: null } );
				assert.strictEqual( baker.getMaxSamples(), maxSamples[ baker.algorithm ], 'null restores the default' );

			} );

			QUnit.test( 'Invalid options throw and unknown ones warn', assert => {

				assert.throws( () => new LightBaker( renderer, { algorithm: 'path tracing' } ), /Unknown algorithm/ );
				assert.throws( () => new LightBaker( renderer, { directLight: 'Baked' } ), /directLight/ );
				assert.throws( () => new LightBaker( renderer, { resolution: 1000.5 } ), /resolution/ );
				assert.throws( () => new LightBaker( renderer, { padding: 2 } ), /padding/ );
				assert.throws( () => new LightBaker( renderer, { noiseTolerance: 0 } ), /tolerance/ );
				assert.throws( () => new LightBaker( renderer, { maxSamples: - 1 } ), /maximum samples/ );

				const baker = new LightBaker( renderer );
				const warnings = captureWarnings( () => baker.setOptions( { tolerance: 0.1, resolution: 512 } ) );
				assert.strictEqual( warnings.length, 1 );
				assert.true( warnings[ 0 ].includes( 'tolerance' ), 'Typos are reported' );
				assert.strictEqual( baker.resolution, 512, 'The known options still apply' );
				assert.strictEqual( baker.setOptions( { resolution: undefined } ).resolution, 512, 'undefined keeps an option' );

			} );

			QUnit.test( 'Methods that need a prepared bake throw before it', async assert => {

				const baker = new LightBaker( renderer );

				assert.throws( () => baker.apply(), /prepare/ );
				assert.throws( () => baker.process(), /prepare/ );
				await assert.rejects( baker.export( { format: 'fbx' } ), /Unknown export format/ );
				await assert.rejects( baker.export( { bitDepth: 12 } ), /bit depth/ );
				await assert.rejects( baker.export(), /bake/ );

				const controller = new AbortController();
				controller.abort();

				await assert.rejects( baker.bake( new Scene(), { signal: controller.signal } ), ( error ) => error.name === 'AbortError', 'An aborted signal stops the bake before it starts' );

			} );

			QUnit.test( 'Meshes are unwrapped into pages with their own materials', assert => {

				const shared = new MeshStandardMaterial();
				const root = new Group();

				for ( let i = 0; i < 8; i ++ ) {

					const mesh = new Mesh( new BoxGeometry( 1 + i * 0.2, 1, 0.5 + i * 0.1 ), shared );
					mesh.position.set( i * 3, 0, 0 );
					root.add( mesh );

				}

				const prop = new Mesh( new PlaneGeometry(), shared );
				prop.userData.lightMapScale = 0;
				root.add( prop );

				const baker = new LightBaker( renderer, { resolution: 512, pageSize: 256 } );
				baker.prepareMeshes( root );

				assert.ok( baker.atlas.pages >= 4, `${ baker.atlas.pages } pages of 256` );
				assert.strictEqual( baker.atlasResolution, 512 );
				assert.deepEqual( baker.excludedMeshes, [ prop ], 'Meshes with a scale of 0 are left out' );
				assert.false( prop.geometry.hasAttribute( 'uv1' ) );
				assert.notStrictEqual( prop.material, shared, 'Meshes left out get a copy without a light map' );
				assert.strictEqual( baker.materialPages.get( prop.material ), - 1 );

				for ( const mesh of root.children.slice( 0, 8 ) ) {

					const page = mesh.userData.lightMapPage;

					assert.true( mesh.geometry.hasAttribute( 'uv1' ) );
					assert.strictEqual( baker.materialPages.get( mesh.material ), page );
					assert.strictEqual( mesh.material === shared, page === 0, 'The first page keeps the material, the others get copies' );

				}

				assert.strictEqual( baker.materials.size, baker.atlas.pages + 1, 'One material per page and one for the meshes left out' );

				// the atlas is kept while the meshes and options stay the same

				const geometries = root.children.map( ( mesh ) => mesh.geometry );
				const materials = root.children.map( ( mesh ) => mesh.material );
				baker.prepareMeshes( root );
				assert.deepEqual( root.children.map( ( mesh ) => mesh.geometry ), geometries, 'The atlas is reused' );
				assert.deepEqual( root.children.map( ( mesh ) => mesh.material ), materials, 'The materials are reused' );

				// a grown resolution is reused too, a new one unwraps again

				baker.resolution = baker.atlasResolution;
				baker.prepareMeshes( root );
				assert.strictEqual( root.children[ 0 ].geometry, geometries[ 0 ] );

				baker.resolution = 1024;
				baker.prepareMeshes( root );
				assert.notStrictEqual( root.children[ 0 ].geometry, geometries[ 0 ], 'A new resolution unwraps again' );

				baker.dispose();
				assert.true( root.children.every( ( mesh ) => mesh.material === shared ), 'dispose() restores the materials' );

			} );

			QUnit.test( 'Unwrapping keeps the textures of uv1 and skips skinned meshes', assert => {

				const aoMap = new Texture();
				aoMap.channel = 1;

				const geometry = new BoxGeometry();
				geometry.setAttribute( 'uv1', geometry.getAttribute( 'uv' ).clone() );
				const mesh = new Mesh( geometry, new MeshStandardMaterial( { aoMap } ) );

				const skinnedGeometry = new BoxGeometry();
				const count = skinnedGeometry.getAttribute( 'position' ).count;
				skinnedGeometry.setAttribute( 'skinIndex', new Uint16BufferAttribute( new Uint16Array( count * 4 ), 4 ) );
				skinnedGeometry.setAttribute( 'skinWeight', new Float32BufferAttribute( new Float32Array( count * 4 ).fill( 0.25 ), 4 ) );
				const skinned = new SkinnedMesh( skinnedGeometry, new MeshStandardMaterial() );
				const bone = new Bone();
				skinned.add( bone );
				skinned.bind( new Skeleton( [ bone ] ) );

				const instanced = new InstancedMesh( new BoxGeometry(), new MeshStandardMaterial(), 4 );
				for ( let i = 0; i < 4; i ++ ) instanced.setMatrixAt( i, new Matrix4().makeTranslation( i * 2, 0, 0 ) );

				const root = new Group().add( mesh, skinned, instanced );
				const baker = new LightBaker( renderer, { resolution: 256 } );

				const warnings = captureWarnings( () => baker.prepareMeshes( root ) );

				assert.true( warnings.some( ( message ) => message.includes( 'Skinned' ) ), 'Skinned meshes are reported' );
				assert.deepEqual( baker.excludedMeshes, [ skinned ] );
				assert.strictEqual( skinned.userData.lightMapScale, undefined, 'The scale of skinned meshes is restored' );

				assert.strictEqual( aoMap.channel, 2, 'The ambient occlusion map moves to uv2' );
				assert.true( mesh.geometry.hasAttribute( 'uv2' ) );
				assert.notStrictEqual( mesh.geometry.getAttribute( 'uv1' ), mesh.geometry.getAttribute( 'uv2' ), 'uv1 holds the light map UVs' );

				assert.true( instanced.geometry.hasAttribute( '_LIGHTMAP_OFFSET' ), 'Instances get atlas regions' );
				assert.strictEqual( instanced.material.lightMapInstances, true, 'Instanced materials look up the regions of their instances' );

			} );

			QUnit.test( 'Outline shells are left out of the bake', assert => {

				// a box turned inside out is only visible from inside

				const insideOut = ( geometry ) => {

					const index = geometry.index.array;
					for ( let i = 0; i < index.length; i += 3 ) [ index[ i + 1 ], index[ i + 2 ] ] = [ index[ i + 2 ], index[ i + 1 ] ];

					const normal = geometry.getAttribute( 'normal' ).array;
					for ( let i = 0; i < normal.length; i ++ ) normal[ i ] = - normal[ i ];

					return geometry;

				};

				const box = new Mesh( new BoxGeometry(), new MeshStandardMaterial() );
				const shell = new Mesh( insideOut( new BoxGeometry( 1.004, 1.004, 1.004 ) ), new MeshStandardMaterial( { color: 0x000000 } ) );
				const room = new Mesh( insideOut( new BoxGeometry( 10, 10, 10 ) ), new MeshStandardMaterial() );

				const root = new Group().add( box, shell, room );
				const baker = new LightBaker( renderer, { resolution: 256 } );

				const warnings = captureWarnings( () => baker.prepareMeshes( root ) );

				assert.deepEqual( baker.outlineMeshes, [ shell ], 'The shell around the box is an outline, the room is not' );
				assert.deepEqual( baker.excludedMeshes, [ shell ], 'The shell is left out of the light map' );
				assert.false( shell.geometry.hasAttribute( 'uv1' ), 'The shell is not unwrapped' );
				assert.true( warnings.some( ( message ) => message.includes( 'outline' ) ), 'Outlines are reported' );

				baker.ignoreOutlines = false;
				baker.prepareMeshes( root );

				assert.deepEqual( baker.outlineMeshes, [], 'Outlines can be baked' );
				assert.strictEqual( baker.excludedMeshes.length, 0 );

			} );

			QUnit.test( 'Existing light map UVs can be kept', assert => {

				const geometry = new PlaneGeometry();
				geometry.setAttribute( 'uv1', geometry.getAttribute( 'uv' ).clone() );
				const mapped = new Mesh( geometry, new MeshStandardMaterial() );
				const unmapped = new Mesh( new PlaneGeometry(), mapped.material );

				const root = new Group().add( mapped, unmapped );
				const baker = new LightBaker( renderer, { unwrap: false, resolution: 4096, pageSize: 2048 } );
				baker.prepareMeshes( root );

				assert.strictEqual( mapped.geometry, geometry, 'The geometry is kept' );
				assert.strictEqual( baker.atlas, null );
				assert.deepEqual( baker.excludedMeshes, [ unmapped ], 'Meshes without uv1 are left out' );
				assert.strictEqual( baker.materialPages.get( mapped.material ), 0 );
				assert.notStrictEqual( unmapped.material, mapped.material );

			} );

		} );

	} );

} );
