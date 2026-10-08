import { BackSide, Color, DoubleSide, Vector2, Vector3 } from 'three';

const luminance = color => 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;

// Group emissive triangles by mesh/material. Area sampling includes world transforms,
// indexed/non-indexed geometry, material groups, UVs, maps and alpha cutouts.
function emissiveSources( surfaces ) {

	const sources = [];
	const a = new Vector3(), b = new Vector3(), c = new Vector3();
	for ( const mesh of surfaces ) {

		const geometry = mesh.geometry;
		const position = geometry.attributes.position;
		if ( ! position ) continue;
		const index = geometry.index;
		const materials = Array.isArray( mesh.material ) ? mesh.material : [ mesh.material ];
		const groups = Array.isArray( mesh.material ) ? geometry.groups : [ { start: 0, count: index ? index.count : position.count, materialIndex: 0 } ];
		const grouped = new Map();
		for ( const group of groups ) {

			const material = materials[ group.materialIndex ];
			if ( ! material || ! material.emissive || material.emissiveIntensity === 0 || luminance( material.emissive ) <= 0 ) continue;
			let source = grouped.get( material );
			if ( ! source ) {

				const emission = new Color().copy( material.emissive ).multiplyScalar( material.emissiveIntensity ?? 1 );
				source = { mesh, material, emission, triangles: [], area: 0 };
				grouped.set( material, source );

			}

			const end = Math.min( group.start + group.count, index ? index.count : position.count, geometry.drawRange.start + geometry.drawRange.count );
			for ( let i = Math.max( group.start, geometry.drawRange.start ); i + 2 < end; i += 3 ) {

				const vertices = [ 0, 1, 2 ].map( offset => index ? index.getX( i + offset ) : i + offset );
				a.fromBufferAttribute( position, vertices[ 0 ] ).applyMatrix4( mesh.matrixWorld );
				b.fromBufferAttribute( position, vertices[ 1 ] ).applyMatrix4( mesh.matrixWorld );
				c.fromBufferAttribute( position, vertices[ 2 ] ).applyMatrix4( mesh.matrixWorld );
				const normal = b.clone().sub( a ).cross( c.clone().sub( a ) );
				const area = normal.length() / 2;
				if ( area === 0 ) continue;
				normal.normalize();
				if ( material.side === BackSide ) normal.negate();
				source.area += area;
				source.triangles.push( { vertices, a: a.clone(), b: b.clone(), c: c.clone(), normal, cumulativeArea: source.area } );

			}

		}

		for ( const source of grouped.values() ) {

			if ( source.area === 0 ) continue;
			source.power = Math.PI * source.area * ( source.material.side === DoubleSide ? 2 : 1 );
			source.weight = source.power * luminance( source.emission );
			sources.push( source );

		}

	}

	return sources;

}

function sampleEmission( source, select, random, sampler ) {

	let low = 0, high = source.triangles.length - 1;
	const area = select * source.area;
	while ( low < high ) {

		const mid = low + high >> 1;
		if ( source.triangles[ mid ].cumulativeArea < area ) low = mid + 1;
		else high = mid;

	}

	const triangle = source.triangles[ low ];
	const r = Math.sqrt( random() ), v = random();
	const weights = [ 1 - r, r * ( 1 - v ), r * v ];
	const position = triangle.a.clone().multiplyScalar( weights[ 0 ] ).addScaledVector( triangle.b, weights[ 1 ] ).addScaledVector( triangle.c, weights[ 2 ] );
	const normal = triangle.normal.clone();
	if ( source.material.side === DoubleSide && random() < 0.5 ) normal.negate();
	const hit = {};
	for ( const name of [ 'uv', 'uv1' ] ) {

		const attribute = source.mesh.geometry.attributes[ name ];
		if ( ! attribute ) continue;
		hit[ name ] = new Vector2();
		for ( let i = 0; i < 3; i ++ ) hit[ name ].addScaledVector( new Vector2().fromBufferAttribute( attribute, triangle.vertices[ i ] ), weights[ i ] );

	}

	const emission = source.emission.clone();
	if ( source.material.emissiveMap ) {

		const texel = sampler.sample( source.material.emissiveMap, hit );
		emission.r *= texel.x; emission.g *= texel.y; emission.b *= texel.z;

	}

	if ( source.material.alphaTest > 0 ) {

		let alpha = source.material.opacity;
		if ( source.material.map ) alpha *= sampler.sample( source.material.map, hit ).w;
		if ( source.material.alphaMap ) alpha *= sampler.sample( source.material.alphaMap, hit ).y;
		if ( alpha <= source.material.alphaTest ) emission.setRGB( 0, 0, 0 );

	}

	return { position, normal, emission };

}

export { emissiveSources, sampleEmission, luminance };
