import { Node, Vector3 } from 'three/webgpu';
import { cubeTexture, float, Fn, If, int, nodeObject, positionWorld, reflectVector, uniform, vec3 } from 'three/tsl';

/**
 * Debug reflected radiance, with per-pixel volume weights and independent box
 * projection. One cube-array binding stores all local environments plus sky.
 * Assign to MeshBasicNodeMaterial.colorNode for a white mirror, or multiply by
 * a tint for probe markers. Roughness controls filtering, without a full BRDF.
 */
class SpecularProbesNode extends Node {

	static get type() {

		return 'SpecularProbesNode';

	}

	constructor( probes, roughnessNode = float( 0.15 ) ) {

		super( 'vec3' );
		if ( probes.atlas.texture === null ) throw new Error( 'SpecularProbesNode: Capture and filter probes before creating the node.' );
		this.probes = probes;
		this.roughnessNode = float( roughnessNode );
		this.updateBeforeType = 'render';
		this._array = cubeTexture( probes.atlas.texture );
		this._array.mergeable = false;
		this._maxLod = uniform( probes.atlas.maxLod );
		this._resolution = uniform( probes.atlas.resolution );
		this._pmrem = uniform( 1 );
		this._slots = probes.sortedProbes.map( () => ( {
			position: uniform( new Vector3() ),
			min: uniform( new Vector3() ),
			max: uniform( new Vector3() ),
			fade: uniform( 0.5 ),
			projectionMin: uniform( new Vector3() ),
			projectionMax: uniform( new Vector3() ),
			project: uniform( 0 )
		} ) );

	}

	updateBefore() {

		const probes = this.probes;
		if ( probes.sortedProbes.length !== this._slots.length ) throw new Error( 'SpecularProbesNode: Recreate the node after changing the probe count.' );
		this._array.value = probes.atlas.texture;
		this._maxLod.value = probes.atlas.maxLod;
		this._resolution.value = probes.atlas.resolution;
		this._pmrem.value = probes.atlas.filter === 'PMREM' ? 1 : 0;

		for ( let i = 0; i < this._slots.length; i ++ ) {

			const slot = this._slots[ i ];
			const probe = probes.sortedProbes[ i ];
			slot.position.value.copy( probe.position );
			slot.min.value.copy( probe.influenceBox.min );
			slot.max.value.copy( probe.influenceBox.max );
			slot.fade.value = probe.blendDistance;
			slot.project.value = probes.boxProjection && probe.projectionBox !== null ? 1 : 0;
			if ( probe.projectionBox !== null ) {

				slot.projectionMin.value.copy( probe.projectionBox.min );
				slot.projectionMax.value.copy( probe.projectionBox.max );

			}

		}

	}

	setup() {

		this.updateBefore();
		return Fn( () => {

			const roughness = this.roughnessNode.clamp();
			// PMREM's inverse convolution curve differs from a regular image pyramid.
			const pmremLod = this._maxLod.mul( roughness ).mul( float( 2 ).sub( roughness ) );
			// Ordinary box-filtered mip levels: approximate GGX alpha's angular
			// footprint in texels. This is a diagnostic approximation, not GGX IBL.
			const imageLod = this._resolution.mul( roughness.pow( 2 ) ).max( 1e-6 ).log2().clamp( 0, this._maxLod );
			const lod = this._pmrem.greaterThan( 0 ).select( pmremLod, imageLod );
			const radiance = vec3( 0 ).toVar();
			const remaining = float( 1 ).toVar();

			for ( let i = 0; i < this._slots.length; i ++ ) {

				const slot = this._slots[ i ];
				const d = positionWorld.sub( slot.min ).min( slot.max.sub( positionWorld ) );
				const distance = d.x.min( d.y ).min( d.z );
				const inside = positionWorld.greaterThanEqual( slot.min ).all().and( positionWorld.lessThanEqual( slot.max ).all() );
				const fade = slot.fade.greaterThan( 0 ).select( distance.div( slot.fade.max( 1e-6 ) ).clamp(), float( 1 ) );
				const weight = inside.select( fade, float( 0 ) ).mul( remaining ).toVar();

				If( weight.greaterThan( 0 ), () => {

					const direction = reflectVector;
					const safeDirection = direction.greaterThanEqual( 0 ).select( direction.max( 1e-6 ), direction.min( - 1e-6 ) );
					const distances = direction.greaterThanEqual( 0 ).select( slot.projectionMax, slot.projectionMin ).sub( positionWorld ).div( safeDirection );
					const distance = distances.x.min( distances.y ).min( distances.z );
					const projected = positionWorld.add( direction.mul( distance ) ).sub( slot.position );
					const insideProxy = positionWorld.greaterThanEqual( slot.projectionMin ).all().and( positionWorld.lessThanEqual( slot.projectionMax ).all() );
					const corrected = slot.project.greaterThan( 0 ).and( insideProxy ).select( projected, direction );
					radiance.addAssign( this._array.sample( corrected ).depth( int( i ) ).level( lod ).rgb.mul( weight ) );

				} );
				remaining.subAssign( weight );

			}

			radiance.addAssign( this._array.sample( reflectVector ).depth( int( this._slots.length ) ).level( lod ).rgb.mul( remaining ) );
			return radiance;

		} )();

	}

}

/** Per-pixel, priority-filled cube-array reflections. Capture the system first. */
export const specularProbes = ( probes, roughnessNode = float( 0.15 ) ) => nodeObject( new SpecularProbesNode( probes, roughnessNode ) );

export { SpecularProbesNode };
