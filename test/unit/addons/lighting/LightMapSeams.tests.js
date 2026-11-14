import { BufferGeometry, Float32BufferAttribute, Mesh, MeshBasicMaterial } from 'three/webgpu';
import { vec3 } from 'three/tsl';
import { LightMapper } from '../../../../examples/jsm/lighting/LightMapper.js';
import { LightMapSeams } from '../../../../examples/jsm/lighting/LightMapSeams.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Lighting', () => {

		QUnit.module( 'LightMapSeams', () => {

			QUnit.test( 'Seams are found once and can be reused by another stitcher', assert => {

				// a flat quad whose two triangles meet at its diagonal, but lie in different charts

				const geometry = new BufferGeometry();
				geometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0 ], 3 ) );
				geometry.setAttribute( 'normal', new Float32BufferAttribute( [ 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1 ], 3 ) );
				geometry.setAttribute( 'uv1', new Float32BufferAttribute( [ 0.1, 0.1, 0.4, 0.1, 0.4, 0.4, 0.6, 0.1, 0.9, 0.4, 0.6, 0.4 ], 2 ) );

				const renderer = { hasFeature: () => false };
				const material = new MeshBasicMaterial();
				const mapper = new LightMapper( renderer, 32, () => vec3( 1 ) );
				mapper.addObjects( [ new Mesh( geometry, material ) ] );

				const stitcher = new LightMapSeams( renderer, mapper );
				assert.ok( stitcher.seams.unknowns > 0, 'the texels around the diagonal are stitched' );

				const reused = new LightMapSeams( renderer, mapper, { seams: stitcher.seams } );
				assert.strictEqual( reused.seams, stitcher.seams, 'the seams are not searched again' );

				reused.dispose();
				stitcher.dispose();
				mapper.dispose();
				material.dispose();
				geometry.dispose();

			} );

		} );

	} );

} );
