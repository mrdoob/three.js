import { Box3, BoxGeometry, Color, DirectionalLight, DoubleSide, Mesh, MeshStandardMaterial, PlaneGeometry, Scene, SphereGeometry, Vector3 } from 'three';
import { createWoodTableMaterial } from './WoodTableMaterial.js';

/** Shared sunlit room for the probe and VPL kitchen comparisons. */
class KitchenScene extends Scene {

	constructor() {

		super();
		this.background = new Color( 0x000000 );

		const plaster = new MeshStandardMaterial( { color: 0xe3d8c4, roughness: 0.9 } );
		const floor = new MeshStandardMaterial( { color: 0x9f805f, roughness: 0.8 } );
		const table = createWoodTableMaterial();
		this.ready = table.ready;
		const wood = table.material;
		const cabinets = new MeshStandardMaterial( { color: 0x547367, roughness: 0.7 } );
		const stone = new MeshStandardMaterial( { color: 0xd9d2c5, roughness: 0.5 } );

		const box = ( size, position, material ) => {

			const mesh = new Mesh( new BoxGeometry( ...size ), material );
			mesh.position.set( ...position );
			mesh.castShadow = true;
			mesh.receiveShadow = true;
			this.add( mesh );
			return mesh;

		};

		const wallOverlap = 0.2;

		const wall = ( width, height, position, rotation, source, bottomOverlap = 0 ) => {

			const material = source.clone();
			material.shadowSide = DoubleSide;
			const mesh = new Mesh( new PlaneGeometry( width + wallOverlap * 2, height + wallOverlap * 2 + bottomOverlap ), material );
			mesh.position.set( ...position );
			mesh.position.y -= bottomOverlap / 2;
			mesh.rotation.set( ...rotation );
			mesh.castShadow = true;
			mesh.receiveShadow = true;
			this.add( mesh );

		};

		// Inward-facing surfaces let an exterior camera see into the room.
		// Both faces still cast shadows; the window wall retains its solid geometry.
		// Extend each plane past neighboring walls, floor and ceiling to seal the seams.
		// The floor overhangs the wall edges, and vertical walls extend below its underside.

		box( [ 9, 0.2, 7 ], [ 0, - 0.1, 0 ], floor );
		wall( 8, 6, [ 0, 4, 0 ], [ Math.PI / 2, 0, 0 ], plaster );
		wall( 6, 4, [ 4, 2, 0 ], [ 0, - Math.PI / 2, 0 ], plaster, wallOverlap );
		wall( 8, 4, [ 0, 2, - 3 ], [ 0, 0, 0 ], plaster, wallOverlap );
		wall( 8, 4, [ 0, 2, 3 ], [ 0, Math.PI, 0 ], plaster, wallOverlap );

		// A real opening in the left wall, with no invisible fill light or window glass.

		box( [ 0.2, 2.2, 6.4 ], [ - 4.1, 0.7, 0 ], plaster );
		box( [ 0.2, 0.4, 6.4 ], [ - 4.1, 3.8, 0 ], plaster );
		box( [ 0.2, 1.8, 2.4 ], [ - 4.1, 2.7, - 2 ], plaster );
		box( [ 0.2, 1.8, 1.6 ], [ - 4.1, 2.7, 2.4 ], plaster );
		box( [ 0.4, 0.08, 2.6 ], [ - 4.0, 1.8, 0.4 ], stone );

		// Same tabletop dimensions and touching sphere as the complex comparison scene.

		box( [ 2.4, 0.12, 1.4 ], [ - 1.25, 1, 0.4 ], wood );
		for ( const x of [ - 2.3, - 0.2 ] ) {

			for ( const z of [ - 0.15, 0.95 ] ) box( [ 0.1, 1, 0.1 ], [ x, 0.5, z ], wood );

		}

		const sphere = new Mesh( new SphereGeometry( 0.35, 32, 32 ), new MeshStandardMaterial( { color: 0x3366ff, metalness: 0.3, roughness: 0.4 } ) );
		sphere.position.set( - 1.25, 1.41, 0.4 );
		sphere.castShadow = true;
		sphere.receiveShadow = true;
		this.add( sphere );

		for ( const x of [ - 0.7, 0.5, 1.7, 2.9 ] ) {

			box( [ 1.16, 1, 0.65 ], [ x, 0.5, - 2.65 ], cabinets );
			box( [ 0.3, 0.025, 0.04 ], [ x, 0.84, - 2.3 ], stone );
			box( [ 1.16, 0.9, 0.4 ], [ x, 2.65, - 2.8 ], cabinets );

		}

		box( [ 4.9, 0.1, 0.8 ], [ 1.1, 1.05, - 2.6 ], stone );

		this.sun = new DirectionalLight( 0xfff2dc, 20 );
		this.sun.position.set( - 6, 6, 0 );
		this.sun.target.position.set( 0, 2.4, 0 );
		this.sun.castShadow = true;
		this.sun.shadow.mapSize.setScalar( 2048 );
		Object.assign( this.sun.shadow.camera, { left: - 7, right: 7, top: 7, bottom: - 7, near: 0.1, far: 30 } );
		this.sun.shadow.camera.updateProjectionMatrix();
		this.sun.shadow.bias = 0;
		this.add( this.sun, this.sun.target );

		// Restrict incoming sunlight sampling to the window's exterior aperture.
		// Misses keep their share of the incident energy, as with point-light sampling.

		this.samplingBounds = new Box3( new Vector3( - 4.21, 1.8, - 0.8 ), new Vector3( - 4.21, 3.6, 1.6 ) );

	}

}

export { KitchenScene };
