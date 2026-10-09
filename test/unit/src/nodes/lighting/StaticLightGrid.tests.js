import { buildStaticLightGrid } from '../../../../../src/nodes/lighting/StaticLightGrid.js';
import { PointLight } from '../../../../../src/lights/PointLight.js';
import { SpotLight } from '../../../../../src/lights/SpotLight.js';
import { Object3D } from '../../../../../src/core/Object3D.js';

function pointLight( x = 0, y = 0, z = 0, range = 1 ) {

	const light = new PointLight( 0xffffff, 1, range );
	light.position.set( x, y, z );
	light.updateMatrixWorld( true );
	return light;

}

function candidates( grid, position ) {

	const cell = position.map( ( value, axis ) => Math.floor( ( value - grid.origin[ axis ] ) / grid.cellSize ) );
	if ( cell.some( ( value, axis ) => value < 0 || value >= grid.dims[ axis ] ) ) return [];

	const offset = ( ( cell[ 2 ] * grid.dims[ 1 ] + cell[ 1 ] ) * grid.dims[ 0 ] + cell[ 0 ] ) * 2;
	return Array.from( grid.indices.subarray( grid.cells[ offset ], grid.cells[ offset ] + grid.cells[ offset + 1 ] ) );

}

export default QUnit.module( 'Nodes', () => {

	QUnit.module( 'Lighting', () => {

		QUnit.module( 'StaticLightGrid', () => {

			QUnit.test( 'all affecting lights are present at sampled points', ( assert ) => {

				let seed = 42;
				const random = () => {

					seed = ( Math.imul( seed, 1664525 ) + 1013904223 ) >>> 0;
					return seed / 4294967296;

				};

				const lights = [];

				for ( let i = 0; i < 40; i ++ ) {

					lights.push( pointLight( random() * 40 - 20, random() * 40 - 20, random() * 40 - 20, random() * 4 + 0.25 ) );

				}

				const grid = buildStaticLightGrid( lights );
				assert.ok( grid, 'The grid is built.' );

				let missing = 0;
				let checked = 0;

				for ( const light of lights ) {

					for ( let sample = 0; sample < 20; sample ++ ) {

						const position = light.position.toArray().map( value => value + ( random() * 2 - 1 ) * light.distance / Math.sqrt( 3 ) );
						const actual = candidates( grid, position );

						for ( let i = 0; i < lights.length; i ++ ) {

							const source = lights[ i ];
							const distance = Math.hypot( position[ 0 ] - source.position.x, position[ 1 ] - source.position.y, position[ 2 ] - source.position.z );

							if ( distance < source.distance ) {

								checked ++;
								if ( ! actual.includes( i ) ) missing ++;

							}

						}

					}

				}

				assert.ok( checked >= 800, 'Reference sphere tests cover every sampled interior point.' );
				assert.strictEqual( missing, 0, 'Every sphere affecting a point is listed in its cell.' );
				assert.deepEqual( candidates( grid, [ 1000, 1000, 1000 ] ), [], 'Positions outside the grid have no candidates.' );

			} );

			QUnit.test( 'dense cells retain more than 255 lights', ( assert ) => {

				const lights = Array.from( { length: 300 }, () => pointLight() );
				const grid = buildStaticLightGrid( lights );

				assert.deepEqual( candidates( grid, [ 0, 0, 0 ] ), lights.map( ( light, index ) => index ), 'All overlapping lights are retained in input order.' );

			} );

			QUnit.test( 'point and spot records use world matrices and preserve photometry', ( assert ) => {

				const parent = new Object3D();
				parent.position.set( 10, 20, 30 );
				parent.rotation.z = Math.PI / 2;

				const spot = new SpotLight( 0xffffff, 7, 15, Math.PI / 3, 0.4, 1.5 );
				spot.color.setRGB( 0.2, 0.3, 0.4 );
				spot.position.set( 2, 0, 0 );
				spot.target.position.set( 2, 0, - 3 );
				parent.add( spot, spot.target );
				parent.updateMatrixWorld( true );

				const point = pointLight( - 4, 2, 1, 5 );
				point.intensity = 3;
				point.decay = 0;
				const grid = buildStaticLightGrid( [ point, spot ] );
				const data = grid.data;
				const close = ( actual, expected, message ) => assert.ok( Math.abs( actual - expected ) < 1e-6, message );

				assert.deepEqual( Array.from( data.subarray( 0, 8 ) ), [ - 4, 2, 1, 5, 3, 3, 3, 0 ], 'Point position, range, color, intensity and custom decay are packed.' );
				assert.deepEqual( Array.from( data.subarray( 8, 16 ) ), [ 0, 0, 0, 0, 0, 0, 0, 0 ], 'Point records have a zero spotlight flag and padding.' );
				assert.deepEqual( Array.from( data.subarray( 16, 20 ) ), [ 10, 22, 30, 15 ], 'The spotlight uses its parent-transformed world position.' );
				close( data[ 20 ], 1.4, 'Red radiance includes intensity.' );
				close( data[ 21 ], 2.1, 'Green radiance includes intensity.' );
				close( data[ 22 ], 2.8, 'Blue radiance includes intensity.' );
				assert.strictEqual( data[ 23 ], 1.5, 'Spotlight decay is preserved.' );
				assert.deepEqual( Array.from( data.subarray( 24, 27 ) ), [ 0, 0, 1 ], 'Direction points from the world-space target toward the light.' );
				close( data[ 27 ], Math.cos( Math.PI / 3 ), 'Outer cone cosine is packed.' );
				close( data[ 28 ], Math.cos( Math.PI / 3 * 0.6 ), 'Penumbra cosine is packed.' );
				assert.strictEqual( data[ 29 ], 1, 'The spotlight flag is set.' );
				assert.ok( candidates( grid, [ 10, 22, 29 ] ).includes( 1 ), 'The spotlight range sphere is binned.' );

			} );

			QUnit.test( 'sparse and very large bounds have bounded allocation', ( assert ) => {

				for ( const extent of [ 1000000, 1e20 ] ) {

					const grid = buildStaticLightGrid( [ pointLight( - extent, 0, 0, 10 ), pointLight( extent, 0, 0, 10 ) ] );

					assert.ok( grid, 'A sparse scene can build a grid.' );
					assert.ok( grid.cells.length <= 262144 * 2, 'Cell allocation stays bounded.' );
					assert.ok( grid.indices.length <= 1048576, 'Reference allocation stays bounded.' );
					assert.ok( candidates( grid, [ - extent, 0, 0 ] ).includes( 0 ), 'The negative extreme remains covered.' );
					assert.ok( candidates( grid, [ extent, 0, 0 ] ).includes( 1 ), 'The positive extreme remains covered.' );

				}

			} );

			QUnit.test( 'budgets fall back instead of dropping lights', ( assert ) => {

				const large = Array.from( { length: 10 }, () => pointLight( 0, 0, 0, 100 ) );
				const small = Array.from( { length: 11 }, () => pointLight() );

				assert.strictEqual( buildStaticLightGrid( [ ...large, ...small ] ), null, 'Too many sphere-cell references fall back.' );
				assert.strictEqual( buildStaticLightGrid( Array( 65537 ).fill( small[ 0 ] ) ), null, 'Too much light data falls back before allocating buffers.' );

			} );

			QUnit.test( 'empty and invalid input falls back', ( assert ) => {

				assert.strictEqual( buildStaticLightGrid( [] ), null, 'Empty light sets need no grid.' );

				for ( const range of [ 0, - 1, Infinity, NaN, 1e-100, 1e40 ] ) {

					assert.strictEqual( buildStaticLightGrid( [ pointLight( 0, 0, 0, range ) ] ), null, 'An invalid or unrepresentable range falls back.' );

				}

				const light = pointLight();
				light.matrixWorld.elements[ 12 ] = NaN;
				assert.strictEqual( buildStaticLightGrid( [ light ] ), null, 'Invalid positions fall back.' );
				light.matrixWorld.elements[ 12 ] = 0;
				light.intensity = 1e40;
				assert.strictEqual( buildStaticLightGrid( [ light ] ), null, 'Unrepresentable radiance falls back.' );
				light.intensity = 1;
				light.decay = NaN;
				assert.strictEqual( buildStaticLightGrid( [ light ] ), null, 'Invalid decay falls back.' );

				const spot = new SpotLight( 0xffffff, 1, 10 );
				spot.angle = Infinity;
				assert.strictEqual( buildStaticLightGrid( [ spot ] ), null, 'Invalid cone angles fall back.' );
				spot.angle = Math.PI / 3;
				spot.target.matrixWorld.elements[ 12 ] = NaN;
				assert.strictEqual( buildStaticLightGrid( [ spot ] ), null, 'Invalid spotlight targets fall back.' );

			} );

		} );

	} );

} );
