import { GCodeLoader } from '../../../../examples/jsm/loaders/GCodeLoader.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'GCodeLoader', () => {

			function countVertices( object ) {

				const count = { extruded: 0, path: 0 };

				for ( const child of object.children ) {

					count[ child.material.name ] += child.geometry.attributes.position.count;

				}

				return count;

			}

			QUnit.test( 'Instancing', ( assert ) => {

				const loader = new GCodeLoader();

				assert.ok( loader instanceof GCodeLoader, 'Can instantiate a GCodeLoader.' );

			} );

			QUnit.test( 'absolute moves without E are travel', ( assert ) => {

				const object = new GCodeLoader().parse( 'G1 X1 E1\nG1 X2' );

				assert.deepEqual( countVertices( object ), { extruded: 2, path: 2 } );

			} );

			QUnit.test( 'relative moves without E are travel', ( assert ) => {

				// https://github.com/mrdoob/three.js/issues/34876
				const object = new GCodeLoader().parse( 'G91\nG1 X1 E1\nG1 X1' );

				assert.deepEqual( countVertices( object ), { extruded: 2, path: 2 } );

			} );

			QUnit.test( 'retract with G91 and M82 is not extrusion', ( assert ) => {

				const object = new GCodeLoader().parse( 'G91\nM82\nG1 X1 E5\nG1 X1 E4' );

				assert.deepEqual( countVertices( object ), { extruded: 2, path: 2 } );

			} );

		} );

	} );

} );
