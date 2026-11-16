import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshBasicMaterial } from 'three/webgpu';
import { SeamStitchGenerator } from '../../../../examples/jsm/utils/SeamStitchGenerator.js';

function lightMapped( geometry ) {

	geometry.setAttribute( 'uv1', geometry.getAttribute( 'uv' ).clone() );
	return new Mesh( geometry, new MeshBasicMaterial() );

}

// the number of seam edges that a generator found

function seamCount( generator ) {

	return generator._seams.length / 8;

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Utils', () => {

		QUnit.module( 'SeamStitchGenerator', () => {

			QUnit.test( 'Finds the UV seam of a smooth cylinder', assert => {

				const generator = new SeamStitchGenerator( {} );

				generator.setGeometry( lightMapped( new CylinderGeometry( 1, 1, 2, 16, 3, true ) ) );

				// one edge per height segment, where u = 0 meets u = 1

				assert.strictEqual( seamCount( generator ), 3 );

				const seams = generator._seams;

				for ( let i = 0; i < seams.length; i += 8 ) {

					assert.strictEqual( Math.abs( seams[ i ] - seams[ i + 4 ] ), 1, 'the two sides are on opposite borders of the UVs' );

				}

			} );

			QUnit.test( 'Does not stitch hard edges', assert => {

				const generator = new SeamStitchGenerator( {} );

				// the faces of a box meet at 90°, and the caps of a cylinder meet its side at 90°

				generator.setGeometry( lightMapped( new BoxGeometry() ) );
				assert.strictEqual( seamCount( generator ), 0 );

				generator.setGeometry( lightMapped( new CylinderGeometry( 1, 1, 2, 16, 1, false ) ) );
				assert.strictEqual( seamCount( generator ), 1 );

			} );

			QUnit.test( 'Stitches normals computed after splitting at UV seams', assert => {

				const generator = new SeamStitchGenerator( {} );

				// computed normals lean towards the faces on their side of the seam, so the normals of the two sides
				// differ by the angle between the faces: 22.5° with 16 segments, still stitched, but 45° with 8

				const smooth = new CylinderGeometry( 1, 1, 2, 16, 1, true );
				smooth.computeVertexNormals();

				generator.setGeometry( lightMapped( smooth ) );
				assert.strictEqual( seamCount( generator ), 1 );

				const faceted = new CylinderGeometry( 1, 1, 2, 8, 1, true );
				faceted.computeVertexNormals();

				generator.setGeometry( lightMapped( faceted ) );
				assert.strictEqual( seamCount( generator ), 0 );

			} );

			QUnit.test( 'Welds meshes in world space', assert => {

				const generator = new SeamStitchGenerator( {} );

				// two half cylinders, each with UVs of its own, meet along two edges

				const a = lightMapped( new CylinderGeometry( 1, 1, 1, 16, 1, true, 0, Math.PI ) );
				const b = lightMapped( new CylinderGeometry( 1, 1, 1, 16, 1, true, Math.PI, Math.PI ) );

				generator.setGeometry( [ a, b ] );
				assert.strictEqual( seamCount( generator ), 2 );

				// apart in the scene, they do not meet

				const group = new Group();
				group.add( a, b );
				b.position.x = 3;

				generator.setGeometry( group );
				assert.strictEqual( seamCount( generator ), 0 );

			} );

			QUnit.test( 'Uses the UV channel', assert => {

				const generator = new SeamStitchGenerator( {} );
				const mesh = new Mesh( new CylinderGeometry( 1, 1, 2, 16, 1, true ), new MeshBasicMaterial() );

				// without uv1, the mesh has no light map UVs

				generator.setGeometry( mesh );
				assert.strictEqual( seamCount( generator ), 0 );

				generator.channel = 0;
				generator.setGeometry( mesh );
				assert.strictEqual( seamCount( generator ), 1 );

			} );

			QUnit.test( 'Needs geometry before generating', assert => {

				const generator = new SeamStitchGenerator( {} );

				assert.throws( () => generator.generate( { image: { width: 4, height: 4 } } ), /setGeometry/ );

			} );

		} );

	} );

} );
