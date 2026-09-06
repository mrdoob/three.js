import { Matrix4 } from 'three';
import { CityGenerator } from '../../../../../examples/jsm/generators/CityGenerator.js';
import { BenchGenerator } from '../../../../../examples/jsm/generators/city/BenchGenerator.js';
import { CarGenerator } from '../../../../../examples/jsm/generators/city/CarGenerator.js';
import { HydrantGenerator } from '../../../../../examples/jsm/generators/city/HydrantGenerator.js';
import { PersonGenerator } from '../../../../../examples/jsm/generators/city/PersonGenerator.js';
import { SidewalkGenerator } from '../../../../../examples/jsm/generators/city/SidewalkGenerator.js';
import { StreetTreeGenerator } from '../../../../../examples/jsm/generators/city/StreetTreeGenerator.js';
import { StreetlightGenerator } from '../../../../../examples/jsm/generators/city/StreetlightGenerator.js';
import { TrafficlightGenerator } from '../../../../../examples/jsm/generators/city/TrafficlightGenerator.js';
import { TrashcanGenerator } from '../../../../../examples/jsm/generators/city/TrashcanGenerator.js';

function getMeshes( object ) {

	const meshes = [];
	object.traverse( ( child ) => {

		if ( child.isMesh ) meshes.push( child );

	} );
	return meshes;

}

QUnit.module( 'Addons', () => {

	QUnit.module( 'CityGenerator', () => {

		for ( const Generator of [ BenchGenerator, CarGenerator, HydrantGenerator, PersonGenerator, SidewalkGenerator, StreetTreeGenerator, StreetlightGenerator, TrafficlightGenerator, TrashcanGenerator ] ) {

			QUnit.test( Generator.name + ': reuse, grow and dispose', ( assert ) => {

				const generator = new Generator();
				const placements = Array.from( { length: 9 }, ( _, i ) => {

					const matrix = new Matrix4().makeTranslation( i * 10, 0, 0 );
					return Generator === CarGenerator ? { matrix, color: 0x112233 } : matrix;

				} );
				const first = generator.build( placements.slice( 0, 2 ) );
				const meshes = getMeshes( first );
				const geometries = meshes.map( ( mesh ) => mesh.geometry );
				let disposed = 0;

				for ( const mesh of meshes ) mesh.addEventListener( 'dispose', () => disposed ++ );

				assert.strictEqual( generator.build( placements.slice( 0, 1 ) ), first, 'Reuses the generated object when capacity is sufficient.' );

				for ( let i = 0; i < meshes.length; i ++ ) {

					assert.strictEqual( meshes[ i ].geometry, geometries[ i ], 'Reuses canonical geometry.' );

				}

				const grown = generator.build( placements );
				assert.notStrictEqual( grown, first, 'Grows instance capacity.' );
				assert.strictEqual( disposed, meshes.length, 'Releases the replaced instances.' );

				generator.build( [] );

				for ( const mesh of getMeshes( grown ) ) {

					assert.strictEqual( mesh.count, 0, 'Removes previous placements.' );
					assert.false( mesh.visible, 'Empty batches are hidden.' );

				}

				const materials = new Set( getMeshes( grown ).map( ( mesh ) => mesh.material ) );
				let disposedMaterials = 0;

				for ( const material of materials ) material.addEventListener( 'dispose', () => disposedMaterials ++ );

				generator.dispose();
				generator.dispose();
				assert.strictEqual( disposedMaterials, materials.size, 'Disposes owned materials once.' );

			} );

		}

		QUnit.test( 'Updates bounds and invalidates changed geometry parameters', ( assert ) => {

			const generator = new BenchGenerator();
			const mesh = generator.build( [ new Matrix4() ] );
			const geometry = mesh.geometry;

			generator.build( [ new Matrix4().makeTranslation( 100, 0, 0 ) ] );
			assert.ok( Math.abs( mesh.boundingSphere.center.x - 100 ) < 1e-6, 'Updates bounds after moving instances.' );

			generator.parameters.length = 3;
			const replacement = generator.build( [ new Matrix4() ] );
			assert.notStrictEqual( replacement.geometry, geometry, 'Rebuilds geometry after its parameters change.' );

			generator.dispose();

		} );

		QUnit.test( 'City rebuilds reuse the sidewalk and furniture', ( assert ) => {

			const city = new CityGenerator( { blocksX: 1, blocksZ: 1, lotsX: 1, lotsZ: 1 } );
			city.build();
			const sidewalk = city.sidewalk.mesh;
			const streetlight = city.furniture.streetlight.mesh;

			city.build();
			assert.strictEqual( city.sidewalk.mesh, sidewalk, 'Reuses the sidewalk.' );
			assert.strictEqual( city.furniture.streetlight.mesh, streetlight, 'Reuses street furniture.' );

			city.dispose();

		} );

	} );

} );
