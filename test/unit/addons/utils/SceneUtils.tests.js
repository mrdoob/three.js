import {
	BoxGeometry,
	BufferAttribute,
	Mesh,
	MeshBasicMaterial
} from 'three';
import { createMeshesFromMultiMaterialMesh } from '../../../../examples/jsm/utils/SceneUtils.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Utils', () => {

		QUnit.module( 'SceneUtils', () => {

			QUnit.test( 'createMeshesFromMultiMaterialMesh - normalized attributes', ( assert ) => {

				const geometry = new BoxGeometry();
				const count = geometry.attributes.position.count;
				geometry.setAttribute( 'color', new BufferAttribute( new Uint8Array( count * 3 ).fill( 128 ), 3, true ) );

				const materials = [];
				for ( let i = 0; i < 6; i ++ ) materials.push( new MeshBasicMaterial() );

				const group = createMeshesFromMultiMaterialMesh( new Mesh( geometry, materials ) );
				const color = group.children[ 0 ].geometry.getAttribute( 'color' );

				assert.strictEqual( color.normalized, true, 'normalized flag is kept' );
				assert.strictEqual( color.array[ 0 ], 128, 'raw values are kept' );

			} );

		} );

	} );

} );
