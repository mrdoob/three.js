import * as THREE from 'three';
import * as BufferGeometryUtils from '../../examples/jsm/utils/BufferGeometryUtils.js';
import { threejsLessonUtils } from './threejs-lesson-utils.js';

{

	const darkMatcher = window.matchMedia( '(prefers-color-scheme: dark)' );
	const isDarkMode = darkMatcher.matches;

	const darkColors = {
		wire: '#DDD',
	};
	const lightColors = {
		wire: '#000',
	};
	const colors = isDarkMode ? darkColors : lightColors;


	threejsLessonUtils.addDiagrams( {
		mergedCubes: {
			create() {

				const geometries = [];
				const width = 3;
				const height = 2;
				const depth = 2;
				for ( let y = 0; y < height; ++ y ) {

					for ( let z = 0; z < depth; ++ z ) {

						for ( let x = 0; x < width; ++ x ) {

							const geometry = new THREE.BoxGeometry( 1, 1, 1 );
							geometry.applyMatrix4( ( new THREE.Matrix4() ).makeTranslation( x, y, z ) );
							geometries.push( geometry );

						}

					}

				}

				const mergedGeometry = BufferGeometryUtils.mergeGeometries( geometries, false );
				const material = new THREE.MeshBasicMaterial( {
					color: colors.wire,
					wireframe: true,
				} );
				const mesh = new THREE.Mesh( mergedGeometry, material );
				mesh.position.set(
					0.5 - width / 2,
					0.5 - height / 2,
					0.5 - depth / 2 );
				const base = new THREE.Object3D();
				base.add( mesh );
				base.scale.setScalar( 3.5 );
				return base;

			},
		},
		culledCubes: {
			create() {

				const geometry = new THREE.BoxGeometry( 3, 2, 2, 3, 2, 2 );
				const material = new THREE.MeshBasicMaterial( {
					color: colors.wire,
					wireframe: true,
				} );
				const mesh = new THREE.Mesh( geometry, material );
				mesh.scale.setScalar( 3.5 );
				return mesh;

			},
		},
	} );

}

