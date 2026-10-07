import { BufferAttribute, BufferGeometry, Points, PointsMaterial } from 'three';

/** Visualizes the positions sampled by a VirtualPointLightGenerator. */
class VirtualPointLightHelper extends Points {

	/**
	 * @param {VirtualPointLightGenerator} generator - The sample data.
	 * @param {number} [size=0.06] - Point size in world units.
	 */
	constructor( generator, size = 0.06 ) {

		const geometry = new BufferGeometry();
		geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( generator.capacity * 3 ), 3 ) );
		super( geometry, new PointsMaterial( { size, color: 0xffff00, toneMapped: false } ) );
		this.generator = generator;
		this.update();

	}

	/** Updates positions and draw range without reallocating geometry. */
	update() {

		const position = this.geometry.getAttribute( 'position' );
		for ( let i = 0; i < this.generator.count; i ++ ) {

			const point = this.generator.positions[ i ];
			position.setXYZ( i, point.x, point.y, point.z );

		}

		position.needsUpdate = true;
		this.geometry.setDrawRange( 0, this.generator.count );
		this.geometry.computeBoundingSphere();

	}

	/** Releases the helper's GPU resources. */
	dispose() {

		this.geometry.dispose();
		this.material.dispose();

	}

}

export { VirtualPointLightHelper };
