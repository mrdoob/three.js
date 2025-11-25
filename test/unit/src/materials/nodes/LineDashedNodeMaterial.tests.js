/* global QUnit */

import LineDashedNodeMaterial from '../../../../../src/materials/nodes/LineDashedNodeMaterial.js';

import NodeMaterial from '../../../../../src/materials/nodes/NodeMaterial.js';

export default QUnit.module( 'Materials', () => {

	QUnit.module( 'Nodes', () => {

		QUnit.module( 'LineDashedNodeMaterial', () => {

			// INHERITANCE
			QUnit.test( 'Extending', ( assert ) => {

				const object = new LineDashedNodeMaterial();
				assert.strictEqual(
					object instanceof NodeMaterial, true,
					'LineDashedNodeMaterial extends from NodeMaterial'
				);

			} );

			// INSTANCING
			QUnit.test( 'Instancing', ( assert ) => {

				const object = new LineDashedNodeMaterial();
				assert.ok( object, 'Can instantiate a LineDashedNodeMaterial.' );

			} );

			// PROPERTIES
			QUnit.test( 'type', ( assert ) => {

				const object = new LineDashedNodeMaterial();
				assert.ok(
					object.type === 'LineDashedNodeMaterial',
					'LineDashedNodeMaterial.type should be LineDashedNodeMaterial'
				);

			} );

			QUnit.test( 'screenSpace', ( assert ) => {

				const material = new LineDashedNodeMaterial();
				assert.strictEqual( material.screenSpace, false, 'screenSpace is false by default' );

				material.screenSpace = true;
				assert.strictEqual( material.screenSpace, true, 'screenSpace can be set to true' );

			} );

			// PUBLIC
			QUnit.test( 'isLineDashedNodeMaterial', ( assert ) => {

				const object = new LineDashedNodeMaterial();
				assert.ok(
					object.isLineDashedNodeMaterial,
					'LineDashedNodeMaterial.isLineDashedNodeMaterial should be true'
				);

			} );

			QUnit.test( 'copy', ( assert ) => {

				const src = new LineDashedNodeMaterial();
				src.screenSpace = true;
				src.dashSize = 5;
				src.gapSize = 2;
				src.scale = 3;
				src.dashOffset = 1;

				const dst = new LineDashedNodeMaterial();
				dst.copy( src );

				assert.strictEqual( dst.screenSpace, true, 'screenSpace copied' );
				assert.strictEqual( dst.dashSize, 5, 'dashSize copied' );
				assert.strictEqual( dst.gapSize, 2, 'gapSize copied' );
				assert.strictEqual( dst.scale, 3, 'scale copied' );
				assert.strictEqual( dst.dashOffset, 1, 'dashOffset copied' );

				// Verify independence
				src.screenSpace = false;
				assert.strictEqual( dst.screenSpace, true, 'copy is independent' );

			} );

		} );

	} );

} );
