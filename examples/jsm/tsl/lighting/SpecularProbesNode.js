import { Node, Vector3 } from 'three/webgpu';
import { float, nodeObject, pmremTexture, positionWorld, reflectVector, uniform, vec3 } from 'three/tsl';

/**
 * A debug radiance node for SpecularProbes. Assign to a MeshBasicNodeMaterial's
 * colorNode. This does not replace the standard material lighting system and
 * does not apply a BRDF; roughness controls the PMREM filtering level only.
 */
class SpecularProbesNode extends Node {

	static get type() {

		return 'SpecularProbesNode';

	}

	constructor( probes, roughnessNode = float( 0.15 ) ) {

		super( 'vec3' );
		this.probes = probes;
		this.roughnessNode = roughnessNode;
		this.updateBeforeType = 'render';
		this._fallbackWeight = uniform( 1 );
		this._fallback = pmremTexture( probes.fallbackTexture, reflectVector, roughnessNode );
		// Sources can coincide at compile time and diverge later. Keep each binding
		// independent instead of letting TextureNode merge identical PMREM uniforms.
		this._fallback._texture.mergeable = false;
		this._slots = probes.slots.map( () => ( {
			weight: uniform( 0 ),
			position: uniform( new Vector3() ),
			min: uniform( new Vector3() ),
			max: uniform( new Vector3() ),
			project: uniform( 0 ),
			sample: null
		} ) );

		for ( const slot of this._slots ) {

			// Avoid division by zero for rays parallel to a box face. Projection is
			// only meaningful inside the proxy; outside it use the uncorrected ray.
			const direction = reflectVector;
			const safeDirection = direction.greaterThanEqual( 0 ).select( direction.max( 1e-6 ), direction.min( - 1e-6 ) );
			const distances = direction.greaterThanEqual( 0 ).select( slot.max, slot.min ).sub( positionWorld ).div( safeDirection );
			const distance = distances.x.min( distances.y ).min( distances.z );
			const projected = positionWorld.add( direction.mul( distance ) ).sub( slot.position );
			const inside = positionWorld.greaterThanEqual( slot.min ).all().and( positionWorld.lessThanEqual( slot.max ).all() );
			const corrected = slot.project.greaterThan( 0 ).and( inside ).select( projected, direction );
			slot.sample = pmremTexture( probes.fallbackTexture, corrected, roughnessNode );
			slot.sample._texture.mergeable = false;

		}

	}

	update() {

		const probes = this.probes;
		this._fallbackWeight.value = probes.fallbackWeight;
		if ( this._fallback.value !== probes.fallbackTexture ) this._fallback.value = probes.fallbackTexture;

		for ( let i = 0; i < this._slots.length; i ++ ) {

			const slot = this._slots[ i ];
			const selection = probes.slots[ i ];
			const probe = selection.probe;
			const texture = probe === null ? probes.fallbackTexture : probe.texture;
			if ( slot.sample.value !== texture ) slot.sample.value = texture;
			slot.weight.value = selection.weight;
			slot.project.value = 0;

			if ( probe !== null ) {

				slot.position.value.copy( probe.position );
				if ( probes.boxProjection && probe.projectionBox !== null ) {

					slot.min.value.copy( probe.projectionBox.min );
					slot.max.value.copy( probe.projectionBox.max );
					slot.project.value = 1;

				}

			}

		}

	}

	updateBefore( frame ) {

		this.update();

		// Refresh PMREMs after changing sources, before uniform bindings are uploaded.
		this._fallback.updateBefore( frame );
		for ( const slot of this._slots ) slot.sample.updateBefore( frame );

	}

	setup() {

		this.update();
		let radiance = this._fallback.mul( this._fallbackWeight );
		for ( const slot of this._slots ) radiance = radiance.add( slot.sample.mul( slot.weight ) );
		return vec3( radiance );

	}

	dispose() {

		this._fallback.dispose();
		for ( const slot of this._slots ) slot.sample.dispose();
		super.dispose();

	}

}

/** Returns roughness-filtered, blended linear HDR radiance. */
export const specularProbes = ( probes, roughnessNode = float( 0.15 ) ) => nodeObject( new SpecularProbesNode( probes, roughnessNode ) );

export { SpecularProbesNode };

