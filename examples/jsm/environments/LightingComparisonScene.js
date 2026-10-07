import * as THREE from 'three';
import { createWoodTableMaterial } from './WoodTableMaterial.js';

/**
 * Shared geometry, materials and source lights for the VPL / light probe examples.
 *
 * @augments Scene
 */
class LightingComparisonScene extends THREE.Scene {

	/** @param {boolean} [complex=false] - Use the two-room scene. */
	constructor( complex = false ) {

		super();
		this.background = new THREE.Color( 0x111111 );

		if ( complex ) {

			const wallMaterial = new THREE.MeshStandardMaterial( { color: 0xcccccc, side: THREE.BackSide } );
			const whiteMat = new THREE.MeshStandardMaterial( { color: 0xeeeeee } );

			// Room shell: x=-8 to 8, z=-4 to 4, y=0 to 5

			const room = new THREE.Mesh( new THREE.BoxGeometry( 16, 5, 8 ), wallMaterial );
			room.position.set( 0, 2.5, 0 );
			room.receiveShadow = true;
			this.add( room );

			const redWall = new THREE.Mesh(
				new THREE.PlaneGeometry( 8, 5 ),
				new THREE.MeshStandardMaterial( { color: 0xdd2200 } )
			);
			redWall.rotation.y = Math.PI / 2;
			redWall.position.set( - 7.99, 2.5, 0 );
			this.add( redWall );

			const blueWall = new THREE.Mesh(
				new THREE.PlaneGeometry( 8, 5 ),
				new THREE.MeshStandardMaterial( { color: 0x0044ff } )
			);
			blueWall.rotation.y = - Math.PI / 2;
			blueWall.position.set( 7.99, 2.5, 0 );
			this.add( blueWall );

			// Dividing wall at x=0 with doorway

			const dividerMat = new THREE.MeshStandardMaterial( { color: 0xcccccc } );
			const doorwayHalfGap = 1.25;

			// Left section of divider (z = -4 to -1.25)
			const dividerLeft = new THREE.Mesh(
				new THREE.BoxGeometry( 0.3, 5, 4 - doorwayHalfGap ),
				dividerMat
			);
			dividerLeft.position.set( 0, 2.5, - ( doorwayHalfGap + ( 4 - doorwayHalfGap ) / 2 ) );
			dividerLeft.castShadow = true;
			dividerLeft.receiveShadow = true;
			this.add( dividerLeft );

			// Right section of divider (z = 1.25 to 4)
			const dividerRight = new THREE.Mesh(
				new THREE.BoxGeometry( 0.3, 5, 4 - doorwayHalfGap ),
				dividerMat
			);
			dividerRight.position.set( 0, 2.5, doorwayHalfGap + ( 4 - doorwayHalfGap ) / 2 );
			dividerRight.castShadow = true;
			dividerRight.receiveShadow = true;
			this.add( dividerRight );

			// Lintel above doorway
			const lintel = new THREE.Mesh(
				new THREE.BoxGeometry( 0.3, 1.2, doorwayHalfGap * 2 ),
				dividerMat
			);
			lintel.position.set( 0, 4.4, 0 );
			lintel.castShadow = true;
			lintel.receiveShadow = true;
			this.add( lintel );

			// Left room objects

			// Columns
			const columnGeom = new THREE.CylinderGeometry( 0.3, 0.3, 4, 16 );

			for ( const x of [ - 6, - 2 ] ) {

				for ( const z of [ - 2.5, 2.5 ] ) {

					const col = new THREE.Mesh( columnGeom, whiteMat );
					col.position.set( x, 2, z );
					col.castShadow = true;
					col.receiveShadow = true;
					this.add( col );

				}

			}

			// Table with golden sphere
			const wood = createWoodTableMaterial();
			this.ready = wood.ready;
			const tableTop = new THREE.Mesh(
				new THREE.BoxGeometry( 2.4, 0.12, 1.4 ),
				wood.material
			);
			tableTop.position.set( - 4, 1.0, 0 );
			tableTop.castShadow = true;
			tableTop.receiveShadow = true;
			this.add( tableTop );

			const legGeom = new THREE.BoxGeometry( 0.1, 1, 0.1 );

			for ( const x of [ - 5.05, - 2.95 ] ) {

				for ( const z of [ - 0.55, 0.55 ] ) {

					const leg = new THREE.Mesh( legGeom, tableTop.material );
					leg.position.set( x, 0.5, z );
					leg.castShadow = true;
					this.add( leg );

				}

			}

			const sphere = new THREE.Mesh(
				new THREE.SphereGeometry( 0.35, 32, 32 ),
				new THREE.MeshStandardMaterial( { color: 0xffd700, metalness: 0.3, roughness: 0.4 } )
			);
			sphere.position.set( - 4, 1.41, 0 );
			sphere.castShadow = true;
			sphere.receiveShadow = true;
			this.add( sphere );

			// Stepped blocks near red wall
			const step1 = new THREE.Mesh( new THREE.BoxGeometry( 1.5, 0.5, 1 ), whiteMat );
			step1.position.set( - 7, 0.25, 0 );
			step1.castShadow = true;
			step1.receiveShadow = true;
			this.add( step1 );

			const step2 = new THREE.Mesh( new THREE.BoxGeometry( 1.0, 1.0, 1 ), whiteMat );
			step2.position.set( - 7, 0.5, 0 );
			step2.castShadow = true;
			step2.receiveShadow = true;
			this.add( step2 );

			const step3 = new THREE.Mesh( new THREE.BoxGeometry( 0.5, 1.5, 1 ), whiteMat );
			step3.position.set( - 7, 0.75, 0 );
			step3.castShadow = true;
			step3.receiveShadow = true;
			this.add( step3 );

			// Right room objects

			// Columns
			for ( const x of [ 2, 6 ] ) {

				for ( const z of [ - 2.5, 2.5 ] ) {

					const col = new THREE.Mesh( columnGeom, whiteMat );
					col.position.set( x, 2, z );
					col.castShadow = true;
					col.receiveShadow = true;
					this.add( col );

				}

			}

			// Pedestal with torus knot
			const pedestal = new THREE.Mesh(
				new THREE.BoxGeometry( 0.8, 1.2, 0.8 ),
				whiteMat
			);
			pedestal.position.set( 4, 0.6, 0 );
			pedestal.castShadow = true;
			pedestal.receiveShadow = true;
			this.add( pedestal );

			const torusKnot = new THREE.Mesh(
				new THREE.TorusKnotGeometry( 0.3, 0.1, 64, 16 ),
				new THREE.MeshStandardMaterial( { color: 0xff44aa, metalness: 0.2, roughness: 0.5 } )
			);
			torusKnot.position.set( 4, 1.65, 0 );
			torusKnot.castShadow = true;
			torusKnot.receiveShadow = true;
			this.add( torusKnot );

			// Tall cone sculpture
			const sculpture = new THREE.Mesh(
				new THREE.ConeGeometry( 0.4, 2.5, 5 ),
				whiteMat
			);
			sculpture.position.set( 6.5, 1.25, - 1.5 );
			sculpture.castShadow = true;
			sculpture.receiveShadow = true;
			this.add( sculpture );

			// Lights

			// Warm point light in left room
			const warmLight = new THREE.PointLight( 0xffaa44, 30 );
			warmLight.position.set( - 4, 4.5, 0 );
			warmLight.castShadow = true;
			warmLight.shadow.mapSize.setScalar( 256 );
			warmLight.shadow.radius = 12;
			warmLight.shadow.bias = 0;
			this.add( warmLight );

			// Cool point light in right room
			const coolLight = new THREE.PointLight( 0x88bbff, 30 );
			coolLight.position.set( 4, 4.5, 0 );
			coolLight.castShadow = true;
			coolLight.shadow.mapSize.setScalar( 256 );
			coolLight.shadow.radius = 12;
			coolLight.shadow.bias = 0;
			this.add( coolLight );

		} else {

			const wallMaterial = new THREE.MeshStandardMaterial( { color: 0xcccccc } );
			const redMaterial = new THREE.MeshStandardMaterial( { color: 0xff0000 } );
			const greenMaterial = new THREE.MeshStandardMaterial( { color: 0x00ff00 } );

			// Floor
			const floor = new THREE.Mesh( new THREE.PlaneGeometry( 6, 6 ), wallMaterial );
			floor.rotation.x = - Math.PI / 2;
			floor.receiveShadow = true;
			this.add( floor );

			// Ceiling
			const ceiling = new THREE.Mesh( new THREE.PlaneGeometry( 6, 6 ), wallMaterial );
			ceiling.rotation.x = Math.PI / 2;
			ceiling.position.y = 5;
			ceiling.receiveShadow = true;
			this.add( ceiling );

			// Back wall
			const backWall = new THREE.Mesh( new THREE.PlaneGeometry( 6, 5 ), wallMaterial );
			backWall.position.set( 0, 2.5, - 3 );
			backWall.receiveShadow = true;
			this.add( backWall );

			// Front wall
			const frontWall = new THREE.Mesh( new THREE.PlaneGeometry( 6, 5 ), wallMaterial );
			frontWall.rotation.y = Math.PI;
			frontWall.position.set( 0, 2.5, 3 );
			frontWall.receiveShadow = true;
			this.add( frontWall );

			// Left wall (red)
			const leftWall = new THREE.Mesh( new THREE.PlaneGeometry( 6, 5 ), redMaterial );
			leftWall.rotation.y = Math.PI / 2;
			leftWall.position.set( - 3, 2.5, 0 );
			leftWall.receiveShadow = true;
			this.add( leftWall );

			// Right wall (green)
			const rightWall = new THREE.Mesh( new THREE.PlaneGeometry( 6, 5 ), greenMaterial );
			rightWall.rotation.y = - Math.PI / 2;
			rightWall.position.set( 3, 2.5, 0 );
			rightWall.receiveShadow = true;
			this.add( rightWall );

			// Objects inside the box

			const objectMaterial = new THREE.MeshStandardMaterial( { color: 0xeeeeee } );

			// Tall box
			const tallBox = new THREE.Mesh( new THREE.BoxGeometry( 1.2, 2.5, 1.2 ), objectMaterial );
			tallBox.position.set( - 0.8, 1.25, - 0.8 );
			tallBox.rotation.y = Math.PI / 8;
			tallBox.castShadow = true;
			tallBox.receiveShadow = true;
			this.add( tallBox );

			// Short box
			const shortBox = new THREE.Mesh( new THREE.BoxGeometry( 1.2, 1.2, 1.2 ), objectMaterial );
			shortBox.position.set( 1, 0.6, 0.5 );
			shortBox.rotation.y = - Math.PI / 6;
			shortBox.castShadow = true;
			shortBox.receiveShadow = true;
			this.add( shortBox );

			// Sphere (to show smooth GI variation)
			const sphere = new THREE.Mesh( new THREE.SphereGeometry( 0.5, 32, 32 ), objectMaterial.clone() );
			sphere.position.set( 1, 1.9, 0.5 );
			sphere.castShadow = true;
			sphere.receiveShadow = true;
			this.add( sphere );

			// Light
			const light = new THREE.PointLight( 0xffffff, 40 );
			light.position.set( 0, 4.5, 0 );
			light.castShadow = true;
			light.shadow.mapSize.setScalar( 256 );
			light.shadow.radius = 10;
			light.shadow.normalBias = - 0.02;
			this.add( light );

		}

	}

}

export { LightingComparisonScene };
