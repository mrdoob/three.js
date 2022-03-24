import { Material } from './Material.js';
import { Vector2 } from '../math/Vector2.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Color } from '../math/Color.js';
import { BasicDepthPacking } from '../constants.js';

class MeshVelocityMaterial extends Material {

	constructor( parameters ) {

		super();

		this.type = 'MeshVelocityMaterial';

		this.depthPacking = BasicDepthPacking;

		this.currentProjectionViewMatrix = new Matrix4();
		this.previousProjectionViewMatrix = new Matrix4();

		this.color = new Color( 0xffffff ); // diffuse
		this.map = null;

		this.displacementMap = null;
		this.displacementScale = 1;
		this.displacementBias = 0;

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

		this.flatShading = false;

		this.setValues( parameters );

	}


	copy( source ) {

		super.copy( source );

		this.currentProjectionViewMatrix.copy( source.currentProjectionViewMatrix );
		this.previousProjectionViewMatrix.copy( source.previousProjectionViewMatrix );

		this.opacity = source.opacity;
		this.map.copy( source.map );

		this.displacementMap.copy( source.displacementMap );
		this.displacementScale = source.displacementScale;
		this.displacementBias = source.displacementBias;

		this.alphaMap.copy( source.alphaMap );

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
