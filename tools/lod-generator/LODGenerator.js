/**
 * LOD Generator - Creates THREE.LOD objects from meshes
 * 
 * Standalone module for generating Level of Detail meshes
 * using the QEM simplification algorithm.
 */

import * as THREE from 'three';
import { QEMSimplifier } from './QEMSimplifier.js';

const DEFAULT_LEVELS = [
	{ ratio: 1.0, distance: 0 },
	{ ratio: 0.5, distance: 50 },
	{ ratio: 0.25, distance: 100 },
	{ ratio: 0.1, distance: 200 }
];

class LODGenerator {

	constructor( options = {} ) {
		this.simplifier = new QEMSimplifier();
		this.workerEnabled = options.useWorker ?? false;
	}

	generate( mesh, config = {} ) {
		this._validateInput( mesh, config );

		const levels = config.levels ?? DEFAULT_LEVELS;
		const hysteresis = config.hysteresis ?? 0.05;
		const geometry = mesh.geometry;
		const material = mesh.material;

		const lod = new THREE.LOD();
		lod.name = mesh.name ? `${mesh.name}_LOD` : 'LOD';

		lod.position.copy( mesh.position );
		lod.rotation.copy( mesh.rotation );
		lod.scale.copy( mesh.scale );
		lod.quaternion.copy( mesh.quaternion );

		for ( let i = 0; i < levels.length; i++ ) {
			const level = levels[ i ];
			let levelGeometry;

			if ( level.ratio >= 1.0 ) {
				levelGeometry = geometry.clone();
			} else {
				levelGeometry = this.simplifier.simplify( geometry, {
					ratio: level.ratio,
					preserveBoundary: config.preserveBoundary ?? true,
					preserveUVSeams: config.preserveUVSeams ?? true
				} );
			}

			const levelMesh = new THREE.Mesh( levelGeometry, material );
			levelMesh.name = `LOD${i}`;
			levelMesh.castShadow = mesh.castShadow;
			levelMesh.receiveShadow = mesh.receiveShadow;

			lod.addLevel( levelMesh, level.distance, hysteresis );

			if ( config.onProgress ) config.onProgress( i, 1.0 );
		}

		return lod;
	}

	async generateAsync( mesh, config = {} ) {
		return new Promise( ( resolve ) => {
			setTimeout( () => resolve( this.generate( mesh, config ) ), 0 );
		} );
	}

	_validateInput( mesh, config ) {
		if ( !mesh || !mesh.isMesh ) throw new Error( 'LODGenerator: Input must be a THREE.Mesh' );
		if ( !mesh.geometry ) throw new Error( 'LODGenerator: Mesh must have geometry' );

		if ( config.levels ) {
			for ( const level of config.levels ) {
				if ( typeof level.ratio !== 'number' || level.ratio < 0 || level.ratio > 1 ) {
					throw new Error( 'LODGenerator: Level ratio must be between 0 and 1' );
				}
				if ( typeof level.distance !== 'number' || level.distance < 0 ) {
					throw new Error( 'LODGenerator: Level distance must be non-negative' );
				}
			}
		}
	}

	getStats() {
		return this.simplifier.stats;
	}

	static disposeLOD( lod ) {
		if ( !lod ) return;
		lod.levels.forEach( level => {
			if ( level.object && level.object.geometry ) level.object.geometry.dispose();
		} );
	}

}

class LODDistanceCalculator {

	constructor( camera ) {
		this.camera = camera;
		this.screenHeight = window.innerHeight;
	}

	calculateDistance( boundingRadius, targetScreenCoverage = 0.5 ) {
		if ( this.camera.isPerspectiveCamera ) {
			const fovRad = THREE.MathUtils.degToRad( this.camera.fov );
			const screenSize = 2 * Math.tan( fovRad / 2 );
			const objectScreenSize = targetScreenCoverage * screenSize;
			return boundingRadius / objectScreenSize;
		}
		return boundingRadius / ( targetScreenCoverage * this.camera.top * 2 );
	}

	autoAssign( lod, options = {} ) {
		const preset = options.preset ?? 'balanced';
		const boundingRadius = options.boundingRadius ?? this._calculateBoundingRadius( lod );

		const presets = {
			performance: [ 0.3, 0.15, 0.05, 0.02 ],
			balanced: [ 0.5, 0.25, 0.1, 0.03 ],
			quality: [ 0.7, 0.4, 0.2, 0.05 ]
		};

		const coverages = presets[ preset ] || presets.balanced;

		lod.levels.forEach( ( level, index ) => {
			if ( index === 0 ) {
				level.distance = 0;
			} else {
				const coverage = coverages[ Math.min( index - 1, coverages.length - 1 ) ];
				level.distance = this.calculateDistance( boundingRadius, coverage );
			}
		} );

		return lod;
	}

	_calculateBoundingRadius( lod ) {
		const box = new THREE.Box3();
		lod.levels.forEach( level => {
			if ( level.object && level.object.geometry ) {
				level.object.geometry.computeBoundingBox();
				box.union( level.object.geometry.boundingBox );
			}
		} );
		const sphere = new THREE.Sphere();
		box.getBoundingSphere( sphere );
		return sphere.radius;
	}

}

export { LODGenerator, LODDistanceCalculator, DEFAULT_LEVELS };

