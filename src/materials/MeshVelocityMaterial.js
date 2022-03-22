import { Material } from './Material.js';
import { Vector2 } from '../math/Vector2.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Color } from '../math/Color.js';

class MeshVelocityMaterial extends Material {

	constructor( parameters ) {

		Material.call( this );

		this.type = 'MeshVelocityMaterial';

		this.depthPacking = BasicDepthPacking;

		this.currentProjectionViewMatrix = new Matrix4();
		this.previousProjectionViewMatrix = new Matrix4();

		this.color = new Color( 0xffffff ); // diffuse
		this.map = null;

		this.displacementMap = null;

		this.alphaMap = null;

		this.skinning = false;
		this.morphTargets = false;

		this.wireframe = false;
		this.wireframeLinewidth = 1;
		this.wireframeLinecap = 'round';
		this.wireframeLinejoin = 'round';

		this.fog = false;
		this.lights = false;

		// far clipping plane in both RGBA and Basic encoding
		this.clearColor = new Color( 1.0, 1.0, 1.0 );
		this.clearAlpha = 1.0;

		this.blending = NoBlending;
		this.flatShading = false;

		this.setValues( parameters );

	}


	copy( source ) {

		super.copy( source );

		this.currentProjectionViewMatrix.copy( this.currentProjectionViewMatrix );
		this.previousProjectionViewMatrix.copy( this.previousProjectionViewMatrix );

		this.opacity = source.opacity;
		this.mapSlot.copy( source.mapSlot );

		this.displacementMapSlot.copy( source.displacementMapSlot );

		this.alphaMapSlot.copy( source.alphaMapSlot );

		this.depthPacking = source.depthPacking;

		this.skinning = source.skinning;
		this.morphTargets = source.morphTargets;

		this.wireframe = source.wireframe;
		this.wireframeLinewidth = source.wireframeLinewidth;
		this.wireframeLinecap = source.wireframeLinecap;
		this.wireframeLinejoin = source.wireframeLinejoin;

		this.flatShading = source.flatShading;

		this.clearColor = source.clearColor;
		this.clearAlpha = source.clearAlpha;

		return this;

	}

}

MeshVelocityMaterial.prototype.isMeshVelocityMaterial = true;

export { MeshVelocityMaterial };
