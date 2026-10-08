import { BackSide, BoxGeometry, Color, Mesh, MeshStandardMaterial, PlaneGeometry, PointLight, Scene, Vector3 } from '../../../../src/Three.js';
import { VirtualPointLightGenerator } from '../../../../examples/jsm/lighting/VirtualPointLightGenerator.js';

function createRoom() {

	const scene = new Scene();
	const room = new Mesh( new BoxGeometry( 10, 10, 10 ), new MeshStandardMaterial( { color: new Color( 0.5, 0.25, 1 ), side: BackSide } ) );
	scene.add( room );
	return scene;

}

QUnit.module( 'Lighting', () => {

	QUnit.module( 'VirtualPointLightGenerator', () => {

		QUnit.test( 'source-power importance allocation conserves each source', assert => {

			const scene = createRoom();
			scene.children[ 0 ].material.color.setRGB( 1, 1, 1 );
			const red = new PointLight( 0xff0000, 1 );
			const blue = new PointLight( 0x0000ff, 100 );
			scene.add( red, blue );
			const generator = new VirtualPointLightGenerator( 64 );
			generator.generate( scene, [ red, blue ], { count: 64 } );
			const blueSamples = generator.flux.filter( flux => flux.z > 0 ).length;
			const total = generator.flux.reduce( ( sum, flux ) => sum.add( flux ), new Vector3() );
			assert.ok( blueSamples > 50, 'More paths are allocated to the stronger source' );
			assert.ok( Math.abs( total.x - 4 * Math.PI ) < 1e-10, 'Dim source retains its full power' );
			assert.ok( Math.abs( total.z - 400 * Math.PI ) < 1e-9, 'Bright source retains its full power' );

		} );

		QUnit.test( 'transformed emissive mesh lights the room without analytic lights', assert => {

			const scene = createRoom();
			scene.children[ 0 ].material.color.setRGB( 1, 1, 1 );
			const emitter = new Mesh( new PlaneGeometry( 2, 2 ), new MeshStandardMaterial( { color: 0x000000, emissive: 0xffffff, emissiveIntensity: 3 } ) );
			emitter.scale.set( 2, 1.5, 1 );
			scene.add( emitter );
			const generator = new VirtualPointLightGenerator( 64 );
			generator.generate( scene, [], { count: 64, candidateMultiplier: 4 } );
			const total = generator.flux.reduce( ( sum, flux ) => sum.add( flux ), new Vector3() );
			const expected = 2 * Math.PI * 12 * 3;
			assert.strictEqual( generator.count, 64, 'CPU candidate pool is compressed to the fixed GPU budget' );
			assert.strictEqual( generator.candidateCount, 512, 'Emission and one reflected bounce are both represented' );
			assert.ok( Math.abs( total.x - expected ) < 1e-8, 'World area times radiance gives emitted and reflected flux' );
			generator.generate( scene, [], { count: 64, emissive: false } );
			assert.strictEqual( generator.count, 0, 'Disabling emissive transport removes the only source' );
			emitter.visible = false;
			generator.generate( scene, [], { count: 64 } );
			assert.strictEqual( generator.count, 0, 'Invisible emitters are excluded' );

		} );

		QUnit.test( 'importance compression preserves luminance and determinism', assert => {

			const scene = createRoom();
			const light = new PointLight( 0xffffff, 10 );
			scene.add( light );
			const generator = new VirtualPointLightGenerator( 64 );
			generator.generate( scene, [ light ], { count: 64, bounces: 4, candidateMultiplier: 8, seed: 9 } );
			const first = generator.flux.map( flux => flux.toArray() );
			const sum = generator.flux.reduce( ( value, flux ) => value + flux.x * 0.2126 + flux.y * 0.7152 + flux.z * 0.0722, 0 );
			let expected = 0;
			for ( let bounce = 1; bounce <= 4; bounce ++ ) expected += 4 * Math.PI * 10 * ( 0.2126 * Math.pow( 0.5, bounce ) + 0.7152 * Math.pow( 0.25, bounce ) + 0.0722 );
			assert.ok( Math.abs( sum - expected ) < 1e-8, 'Compression retains aggregate candidate luminance' );
			assert.strictEqual( generator.count, 64, 'GPU work does not grow with candidate multiplier' );
			generator.generate( scene, [ light ], { count: 64, bounces: 4, candidateMultiplier: 8, seed: 9 } );
			assert.deepEqual( generator.flux.map( flux => flux.toArray() ), first, 'Seed also reproduces compression' );

		} );

		QUnit.test( 'determinism, inward normals and power conservation', assert => {

			const scene = createRoom();
			const light = new PointLight( 0xffffff, 10 );
			scene.add( light );
			const generator = new VirtualPointLightGenerator( 64 );
			generator.generate( scene, [ light ], { count: 64, seed: 7 } );
			assert.strictEqual( generator.count, 64, 'Every ray hits the enclosed room' );
			const positions = generator.positions.map( position => position.toArray() );
			const total = new Vector3();

			for ( let i = 0; i < generator.count; i ++ ) {

				total.add( generator.flux[ i ] );
				assert.ok( generator.normals[ i ].dot( generator.positions[ i ] ) < 0, 'Back-side hit emits into the room' );
				assert.ok( Math.abs( generator.normals[ i ].length() - 1 ) < 1e-12, 'Normal is normalized' );

			}

			const expected = new Vector3( 0.5, 0.25, 1 ).multiplyScalar( 4 * Math.PI * 10 );
			assert.ok( total.distanceTo( expected ) < 1e-10, 'Reflected flux equals albedo times source power' );
			generator.generate( scene, [ light ], { count: 64, seed: 7 } );
			assert.deepEqual( generator.positions.map( position => position.toArray() ), positions, 'Seed reproduces samples' );
			generator.generate( scene, [ light ], { count: 64, seed: 8 } );
			assert.notDeepEqual( generator.positions.map( position => position.toArray() ), positions, 'Different seed changes samples' );

		} );

		QUnit.test( 'multiple colored lights with an uneven sample budget', assert => {

			const scene = createRoom();
			const red = new PointLight( 0xff0000, 10 );
			const blue = new PointLight( 0x0000ff, 20 );
			scene.add( red, blue );
			const generator = new VirtualPointLightGenerator( 65 );
			generator.generate( scene, [ red, blue ], { count: 65 } );
			const total = generator.flux.reduce( ( sum, flux ) => sum.add( flux ), new Vector3() );
			assert.strictEqual( generator.count, 65, 'Total budget is shared across both lights' );
			assert.ok( Math.abs( total.x - 4 * Math.PI * 10 * 0.5 ) < 1e-10, 'Red source retains its own power' );
			assert.strictEqual( total.y, 0, 'Light colors tint the reflected flux' );
			assert.ok( Math.abs( total.z - 4 * Math.PI * 20 ) < 1e-10, 'Blue source retains its own power' );

		} );

		QUnit.test( 'escaped rays do not redistribute source power', assert => {

			const scene = new Scene();
			const floor = new Mesh( new PlaneGeometry( 100, 100 ), new MeshStandardMaterial( { color: 0xffffff } ) );
			floor.rotation.x = - Math.PI / 2;
			floor.position.y = - 1;
			scene.add( floor );
			const light = new PointLight( 0xffffff, 10 );
			scene.add( light );
			const generator = new VirtualPointLightGenerator( 64 );
			generator.generate( scene, [ light ], { count: 64 } );
			assert.ok( generator.count > 0 && generator.count < 64, 'Some rays hit the floor and some escape' );

			for ( let i = 0; i < generator.count; i ++ ) {

				assert.ok( Math.abs( generator.flux[ i ].x - 4 * Math.PI * 10 / 64 ) < 1e-12, 'Hits keep their original share of source power' );

			}

		} );

		QUnit.test( 'transforms, metalness and visibility', assert => {

			const scene = createRoom();
			const room = scene.children[ 0 ];
			room.scale.set( 1, 2, 0.5 );
			room.rotation.z = 0.3;
			room.material.metalness = 1;
			const light = new PointLight( 0xffffff, 10 );
			scene.add( light );
			const generator = new VirtualPointLightGenerator( 32 );
			generator.generate( scene, [ light ], { count: 32 } );
			assert.strictEqual( generator.count, 32, 'Transformed room is updated before casting' );

			for ( let i = 0; i < generator.count; i ++ ) {

				assert.ok( Math.abs( generator.normals[ i ].length() - 1 ) < 1e-12, 'Normal matrix handles nonuniform scaling' );
				assert.strictEqual( generator.flux[ i ].length(), 0, 'Metal has no diffuse bounce' );

			}

			room.visible = false;
			generator.generate( scene, [ light ], { count: 32 } );
			assert.strictEqual( generator.count, 0, 'Invisible geometry does not intercept escaped rays' );

		} );

	} );

} );
