/* global QUnit */

import { WebGLRenderLists, WebGLRenderList } from '../../../../../src/renderers/webgl/WebGLRenderLists.js';
import { Scene } from '../../../../../src/scenes/Scene.js';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL', () => {

		QUnit.module( 'WebGLRenderLists', () => {

			// PUBLIC
			QUnit.test( 'get', ( assert ) => {

				const renderLists = new WebGLRenderLists();
				const sceneA = new Scene();
				const sceneB = new Scene();

				const listA = renderLists.get( sceneA );
				const listB = renderLists.get( sceneB );

				assert.propEqual( listA, new WebGLRenderList(), 'listA is type of WebGLRenderList.' );
				assert.propEqual( listB, new WebGLRenderList(), 'listB is type of WebGLRenderList.' );
				assert.ok( listA !== listB, 'Render lists are different.' );

			} );

		} );

		QUnit.module( 'WebGLRenderList', () => {

			QUnit.test( 'init', ( assert ) => {

				const list = new WebGLRenderList();

				assert.ok( list.transparent.length === 0, 'Transparent list defaults to length 0.' );
				assert.ok( list.opaque.length === 0, 'Opaque list defaults to length 0.' );

				list.push( {}, {}, { transparent: true }, 0, 0, {} );
				list.push( {}, {}, { transparent: false }, 0, 0, {} );

				assert.ok( list.transparent.length === 1, 'Transparent list is length 1 after adding transparent item.' );
				assert.ok( list.opaque.length === 1, 'Opaque list list is length 1 after adding opaque item.' );

				list.init();

				assert.ok( list.transparent.length === 0, 'Transparent list is length 0 after calling init.' );
				assert.ok( list.opaque.length === 0, 'Opaque list list is length 0 after calling init.' );

			} );

			QUnit.test( 'push', ( assert ) => {

				const list = new WebGLRenderList();
				const objA = { id: 'A', renderOrder: 0 };
				const matA = { transparent: true };
				const geoA = {};

				const objB = { id: 'B', renderOrder: 0 };
				const matB = { transparent: true };
				const geoB = {};

				const objC = { id: 'C', renderOrder: 0 };
				const matC = { transparent: false };
				const geoC = {};

				const objD = { id: 'D', renderOrder: 0 };
				const matD = { transparent: false };
				const geoD = {};

				list.push( objA, geoA, matA, 0, 0.5, {} );
				assert.ok( list.transparent.length === 1, 'Transparent list is length 1 after adding transparent item.' );
				assert.ok( list.opaque.length === 0, 'Opaque list list is length 0 after adding transparent item.' );
				assert.deepEqual(
					list.transparent[ 0 ],
					{
						id: 'A',
						object: objA,
						geometry: geoA,
						material: matA,
						groupOrder: 0,
						renderOrder: 0,
						z: 0.5,
						group: {}
					},
					'The first transparent render list item is structured correctly.'
				);

				list.push( objB, geoB, matB, 1, 1.5, {} );
				assert.ok( list.transparent.length === 2, 'Transparent list is length 2 after adding second transparent item.' );
				assert.ok( list.opaque.length === 0, 'Opaque list list is length 0 after adding second transparent item.' );
				assert.deepEqual(
					list.transparent[ 1 ],
					{
						id: 'B',
						object: objB,
						geometry: geoB,
						material: matB,
						groupOrder: 1,
						renderOrder: 0,
						z: 1.5,
						group: {}
					},
					'The second transparent render list item is structured correctly.'
				);

				list.push( objC, geoC, matC, 2, 2.5, {} );
				assert.ok( list.transparent.length === 2, 'Transparent list is length 2 after adding first opaque item.' );
				assert.ok( list.opaque.length === 1, 'Opaque list list is length 1 after adding first opaque item.' );
				assert.deepEqual(
					list.opaque[ 0 ],
					{
						id: 'C',
						object: objC,
						geometry: geoC,
						material: matC,
						groupOrder: 2,
						renderOrder: 0,
						z: 2.5,
						group: {}
					},
					'The first opaque render list item is structured correctly.'
				);

				list.push( objD, geoD, matD, 3, 3.5, {} );
				assert.ok( list.transparent.length === 2, 'Transparent list is length 2 after adding second opaque item.' );
				assert.ok( list.opaque.length === 2, 'Opaque list list is length 2 after adding second opaque item.' );
				assert.deepEqual(
					list.opaque[ 1 ],
					{
						id: 'D',
						object: objD,
						geometry: geoD,
						material: matD,
						groupOrder: 3,
						renderOrder: 0,
						z: 3.5,
						group: {}
					},
					'The second opaque render list item is structured correctly.'
				);

			} );

			QUnit.test( 'unshift', ( assert ) => {

				const list = new WebGLRenderList();
				const objA = { id: 'A', renderOrder: 0 };
				const matA = { transparent: true };
				const geoA = {};

				const objB = { id: 'B', renderOrder: 0 };
				const matB = { transparent: true };
				const geoB = {};

				const objC = { id: 'C', renderOrder: 0 };
				const matC = { transparent: false };
				const geoC = {};

				const objD = { id: 'D', renderOrder: 0 };
				const matD = { transparent: false };
				const geoD = {};


				list.unshift( objA, geoA, matA, 0, 0.5, {} );
				assert.ok( list.transparent.length === 1, 'Transparent list is length 1 after adding transparent item.' );
				assert.ok( list.opaque.length === 0, 'Opaque list list is length 0 after adding transparent item.' );
				assert.deepEqual(
					list.transparent[ 0 ],
					{
						id: 'A',
						object: objA,
						geometry: geoA,
						material: matA,
						groupOrder: 0,
						renderOrder: 0,
						z: 0.5,
						group: {}
					},
					'The first transparent render list item is structured correctly.'
				);

				list.unshift( objB, geoB, matB, 1, 1.5, {} );
				assert.ok( list.transparent.length === 2, 'Transparent list is length 2 after adding second transparent item.' );
				assert.ok( list.opaque.length === 0, 'Opaque list list is length 0 after adding second transparent item.' );
				assert.deepEqual(
					list.transparent[ 0 ],
					{
						id: 'B',
						object: objB,
						geometry: geoB,
						material: matB,
						groupOrder: 1,
						renderOrder: 0,
						z: 1.5,
						group: {}
					},
					'The second transparent render list item is structured correctly.'
				);

				list.unshift( objC, geoC, matC, 2, 2.5, {} );
				assert.ok( list.transparent.length === 2, 'Transparent list is length 2 after adding first opaque item.' );
				assert.ok( list.opaque.length === 1, 'Opaque list list is length 1 after adding first opaque item.' );
				assert.deepEqual(
					list.opaque[ 0 ],
					{
						id: 'C',
						object: objC,
						geometry: geoC,
						material: matC,
						groupOrder: 2,
						renderOrder: 0,
						z: 2.5,
						group: {}
					},
					'The first opaque render list item is structured correctly.'
				);

				list.unshift( objD, geoD, matD, 3, 3.5, {} );
				assert.ok( list.transparent.length === 2, 'Transparent list is length 2 after adding second opaque item.' );
				assert.ok( list.opaque.length === 2, 'Opaque list list is length 2 after adding second opaque item.' );
				assert.deepEqual(
					list.opaque[ 0 ],
					{
						id: 'D',
						object: objD,
						geometry: geoD,
						material: matD,
						groupOrder: 3,
						renderOrder: 0,
						z: 3.5,
						group: {}
					},
					'The second opaque render list item is structured correctly.'
				);

			} );

			QUnit.test( 'sort', ( assert ) => {

				const list = new WebGLRenderList();
				const items = [ { id: 4 }, { id: 5 }, { id: 2 }, { id: 3 } ];

				items.forEach( item => {

					list.push( item, {}, { transparent: true }, 0, 0, {} );
					list.push( item, {}, { transparent: false }, 0, 0, {} );

				} );

				list.sort( ( a, b ) => a.id - b.id, ( a, b ) => b.id - a.id );

				assert.deepEqual(
					list.opaque.map( item => item.id ),
					[ 2, 3, 4, 5 ],
					'The opaque sort is applied to the opaque items list.'
				);

				assert.deepEqual(
					list.transparent.map( item => item.id ),
					[ 5, 4, 3, 2 ],
					'The transparent sort is applied to the transparent items list.'
				);

			} );

		} );

	} );

} );
