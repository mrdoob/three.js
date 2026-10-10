import { BufferAttribute, Color, InstancedMesh, Matrix4, MeshBasicMaterial, SphereGeometry } from 'three';

/** Visualizes the positions and reflected light colors sampled by a VirtualPointLightGenerator. */
class VirtualPointLightHelper extends InstancedMesh {

	/**
	 * @param {VirtualPointLightGenerator} generator - The sample data.
	 * @param {number} [size=0.12] - Sphere radius in world units.
	 */
	constructor( generator, size = 0.12 ) {

		const geometry = new SphereGeometry( size, 16, 16 );
		const normals = geometry.getAttribute( 'normal' );
		const colors = new Float32Array( normals.count * 3 );

		// A fixed soft gradient makes the spheres readable independently of scene lighting.

		for ( let i = 0; i < normals.count; i ++ ) {

			const shade = 0.35 + 0.65 * Math.max( 0, normals.getX( i ) * 0.4 + normals.getY( i ) * 0.8 + normals.getZ( i ) * 0.44 );
			colors.fill( shade, i * 3, i * 3 + 3 );

		}

		geometry.setAttribute( 'color', new BufferAttribute( colors, 3 ) );
		super( geometry, new MeshBasicMaterial( { vertexColors: true } ), generator.capacity );
		this.generator = generator;
		this.update();

	}

	/** Updates sphere positions and colors without reallocating geometry. */
	update() {

		const matrix = new Matrix4();
		const color = new Color();
		this.count = this.generator.count;

		for ( let i = 0; i < this.count; i ++ ) {

			matrix.makeTranslation( this.generator.positions[ i ] );
			this.setMatrixAt( i, matrix );

			const flux = this.generator.flux[ i ];
			const peak = Math.max( flux.x, flux.y, flux.z );

			// Preserve reflected light hue while keeping markers below white.

			color.setRGB( flux.x, flux.y, flux.z ).multiplyScalar( peak > 0 ? 0.5 / peak : 0 );
			this.setColorAt( i, color );

		}

		this.instanceMatrix.needsUpdate = true;
		if ( this.instanceColor !== null ) this.instanceColor.needsUpdate = true;
		this.computeBoundingSphere();

	}

	/** Releases the helper's GPU resources. */
	dispose() {

		super.dispose();
		this.geometry.dispose();
		this.material.dispose();

	}

}

export { VirtualPointLightHelper };
