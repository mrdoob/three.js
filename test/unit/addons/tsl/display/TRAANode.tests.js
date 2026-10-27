import { Matrix4, OrthographicCamera, PerspectiveCamera, Vector2, Vector3 } from 'three/webgpu';
import { velocity } from 'three/tsl';
import TRAANode from '../../../../../examples/jsm/tsl/display/TRAANode.js';
import { getProjectionJitter } from '../../../../../examples/jsm/tsl/utils/TAAUtils.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'TRAANode', () => {

		for ( const Camera of [ PerspectiveCamera, OrthographicCamera ] ) {

			QUnit.test( `${ Camera.name } projection restoration`, assert => {

				const camera = new Camera();
				camera.setViewOffset( 1200, 800, 100, 50, 600, 400 );
				camera.projectionMatrix.elements[ 4 ] = 0.125;
				camera.projectionMatrixInverse.copy( camera.projectionMatrix ).invert();
				const original = camera.projectionMatrix.clone();
				const originalInverse = camera.projectionMatrixInverse.clone();
				const view = { ...camera.view };
				const node = new TRAANode( null, null, null, camera );
				node._velocityNode = velocity;

				node.clearViewOffset();
				assert.ok( camera.projectionMatrix.equals( original ), 'cleanup before applying jitter preserves projection' );
				assert.strictEqual( node._jitterIndex, 0, 'cleanup without jitter does not advance the sequence' );
				node.setViewOffset( 600, 400 );
				assert.deepEqual( camera.view, view, 'jitter preserves the existing view offset' );
				assert.ok( node._velocityNode.projectionMatrix.equals( original ), 'motion vectors use the original projection' );
				const jitter = getProjectionJitter( camera, original, new Vector2() );
				assert.ok( Math.abs( jitter.x ) < 1e-12, 'first Halton x offset is zero' );
				assert.ok( Math.abs( jitter.y - 1 / 2400 ) < 1e-12, 'first Halton y offset matches clip-space translation' );
				assert.ok( new Matrix4().multiplyMatrices( camera.projectionMatrix, camera.projectionMatrixInverse ).elements.every( ( value, index ) => Math.abs( value - ( index % 5 === 0 ? 1 : 0 ) ) < 1e-10 ), 'inverse stays in sync' );
				node.clearViewOffset();
				assert.ok( camera.projectionMatrix.equals( original ), 'restores custom projection exactly' );
				assert.ok( camera.projectionMatrixInverse.equals( originalInverse ), 'restores inverse' );
				assert.deepEqual( camera.view, view, 'preserves view offset after resolve' );
				assert.strictEqual( node._velocityNode.projectionMatrix, null, 'releases velocity override' );
				node.dispose();

			} );

		}

		QUnit.test( 'jitter delta maps static surfaces to previous depth texels', assert => {

			for ( const camera of [ new PerspectiveCamera( 60, 1.5, 0.1, 100 ), new OrthographicCamera( - 2, 2, 2, - 2, 0.1, 100 ) ] ) {

				const node = new TRAANode( null, null, null, camera );
				node._velocityNode = velocity;
				const original = camera.projectionMatrix.clone();
				let previousUV;
				let previousJitter;
				for ( let frame = 0; frame < 8; frame ++ ) {

					node.setViewOffset( 600, 400 );
					const point = new Vector3( 0.2, - 0.3, - 3 ).applyMatrix4( camera.projectionMatrix );
					const currentUV = new Vector2( point.x * 0.5 + 0.5, point.y * - 0.5 + 0.5 );
					const currentJitter = getProjectionJitter( camera, original, new Vector2() );
					if ( previousUV ) {

						const historyUV = currentUV.clone().add( previousJitter ).sub( currentJitter );
						assert.ok( historyUV.distanceTo( previousUV ) < 1e-12, `${ camera.type }: frame ${ frame } uses the previous raster grid` );

					}

					previousUV = currentUV;
					previousJitter = currentJitter;
					node.clearViewOffset();

				}

				node.dispose();

			}

		} );

		QUnit.test( 'zero jitter without a velocity override', assert => {

			assert.deepEqual( getProjectionJitter( new PerspectiveCamera(), null, new Vector2( 1, 2 ) ), new Vector2(), 'depth uses the same projection as velocity' );

		} );

	} );

} );
