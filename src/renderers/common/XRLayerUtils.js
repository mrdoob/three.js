
import { SphereGeometry } from '../../geometries/SphereGeometry.js';

import { PlaneGeometry } from '../../geometries/PlaneGeometry.js';
import { MeshBasicMaterial } from '../../materials/MeshBasicMaterial.js';
import { Mesh } from '../../objects/Mesh.js';

import { AddEquation, CustomBlending, FrontSide, ZeroFactor } from '../../constants.js';

/**
 * Utility methods for native layer creation.
 * Common methods for creating sphere and planes for stereo abd mono video textures.
 */

//The UV mapping geometry transforms for stereo layouts.
const UVMapFactors = {
	'stereo-top-bottom': [
		{ yMult: 0.5, yPhase: 0, xMult: 1.0, xPhase: 0 },
		{ yMult: 0.5, yPhase: 0.5, xMult: 1.0, xPhase: 0 }
	],
	'stereo-left-right': [
		{ yMult: 1.0, yPhase: 0, xMult: 0.5, xPhase: 0 },
		{ yMult: 1.0, yPhase: 0, xMult: 0.5, xPhase: 0.5 }
	]
};

/**
 * set the uv mapping for each eye in a stereo video.
 * uv factors for stereo-left-right and stereo-top-bottom layouts is applied.
 * @param {number} [eyeIndex = 1] The mesh layer eye index for stereo rendering.
 * @param {Object} [uvFactors] The uv factories for a set stereo layout.
 * @param {Geometry} geometry The geometry to transform.
 */
const setUVMapping = ( eyeIndex, uvFactors, geometry ) => {

	const eyeUvfactor = uvFactors[ eyeIndex - 1 ],
		uvs = geometry.attributes.uv.array;

	for ( let i = 0; i < uvs.length; i += 2 ) {

		//x
		uvs[ i ] *= eyeUvfactor.xMult;
		uvs[ i ] += eyeUvfactor.xPhase;
		//y
		uvs[ i + 1 ] *= eyeUvfactor.yMult;
		uvs[ i + 1 ] += eyeUvfactor.yPhase;

	}

};

/**
 * Positions the plane to the set translation and quaternion.
 * @param {Planegoemetry} [plane] The plane to position.
 * @param {Vector3} [translation] The position vector.
 * @param {Quaternion} quaternion The quaternion to set.
 */
const positionQuad = ( plane, translation, quaternion ) => {

	plane.position.copy( translation );
	plane.quaternion.copy( quaternion );

};

/**
 * Create a common material for mesh creation.
 * @param {number} [side = Frontside] The side to set for the material.
 * @return {MeshBasicMaterial} Return the mesh material.
 */
const createMaterial = ( side = FrontSide ) => new MeshBasicMaterial( { color: 0xffffff, side: side } );

/**
 * Creates a mesh material providing a texture.
 * @param {VideoTexture} texture The video texture
 * @return {MeshBasicMaterial} The mesh material.
 */
const createMeshMaterial = ( texture ) => {

	const material = createMaterial();
	material.map = texture;
	return material;

};

/**
 * Creates a full and half sphere geometry.
 * @param {number} [radius = 500] The SphereGeometry radius.
 * @param {number} [widthSegments = 60] The SphereGeometry width segments.
 * @param {number} [heightSegments = 40] The SphereGeometry height segments.
 * @param {boolean} [is180 = false] If it's a 180 video.
 * @return {SphereGeometry} The full or half sphere geometry.
 */
const createSphereGeometry = ( radius, widthSegments, heightSegments, is180 = false ) => {

	let phiStart = 0, phiLength = Math.PI * 2;

	if ( is180 ) {

		phiStart = Math.PI / 2, phiLength = Math.PI;

	}

	const geometry = new SphereGeometry( radius, widthSegments, heightSegments, phiStart, phiLength );

	geometry.scale( - 1, 1, 1 );
	return geometry;

};

/**
 * Creates a mesh.
 * If uvFactors is given it will create stereo transformed meshes.
 * @param {VideoTexture} texture The video texture
 * @param {number} [eyeIndex = 0] The mesh layer eye index for stereo rendering.
 * @param {Geometry} [geometry] Tje geometry.
 * @param {MeshBasicMaterial} [material] The material. If not set creates a material with texture.
 * @param {Object} [uvFactors] The uv factors for a set stereo layout.
 * @return {Mesh} The created mono/stereo transformed mesh.
 */
const createMesh = ( texture, eyeIndex = 0, geometry, material, uvFactors = null ) => {

	//if has stereo layout set the uv mapping.
	if ( uvFactors ) {

		setUVMapping( eyeIndex, uvFactors, geometry );

	}

	const mesh = new Mesh( geometry, material || createMeshMaterial( texture ) );
	mesh.layers.set( eyeIndex );

	return mesh;

};

/**
 * Creates a sphere mesh for mono/stereo 360/180 textures.
 * @param {VideoTexture} texture The video texture
 * @param {number} [eyeIndex = 0] The mesh layer eye index for stereo rendering.
 * @param {number} [radius = 500] The SphereGeometry radius.
 * @param {number} [widthSegments = 60] The SphereGeometry width segments.
 * @param {number} [heightSegments = 40] The SphereGeometry height segments.
 * @param {Object} [uvFactors] The uv factors for a set stereo layout.
 * @param {boolean} [is180 = false] If it's a 180 video.
 * @return {Mesh} The sphere mesh.
 */
const createSphereMesh = ( texture, eyeIndex = 0, radius, widthSegments, heightSegments, uvFactors = null, is180 = false, material = null ) => {

	const geometry = createSphereGeometry( radius, widthSegments, heightSegments, is180 ),
		mesh = createMesh( texture, eyeIndex, geometry, material, uvFactors );

	//only rotate for stereo layouts.
	mesh.rotation.y = uvFactors ? - Math.PI / 2 : 0;

	return mesh;

};

/**
 * Creates a plane mesh for mono/stereo textures.
 * @param {VideoTexture} texture The video texture
 * @param {number} [eyeIndex = 0] The mesh layer eye index for stereo rendering.
 * @param {number} [quadWidth = 0] The quad layer width in meter units.
 * @param {number} [quadHeight = 0] The quad layer height in meter units.
 * @param {Vector3} translation - The position/translation of the layer plane in world units. Native layer Z is 2 units more required than non layer planes.
 * @param {Object} [quaternion={}] A transform quaternion param for the layer.
 * @param {Object} [uvFactors] The uv factors for a set stereo layout.
 * @return {Mesh} The plane mesh.
 */
const createPlaneMesh = ( texture, eyeIndex = 0, quadWidth = 1, quadHeight = 1, translation = {}, quaternion = {}, uvFactors = null, material = null ) => {

	const geometry = new PlaneGeometry( quadWidth, quadHeight ),
		mesh = createMesh( texture, eyeIndex, geometry, material, uvFactors );

	positionQuad( mesh, translation, quaternion );

	return mesh;

};


/**
 * Creates a blend layer material required for native layer rendering.
 * @param {number} [side = Frontside] The side to set for the material.
 * @return {MeshBasicMaterial} The blend layer material.
 */
const createBlendLayerMaterial = ( side = FrontSide ) => {

	const material = createMaterial( side );
	material.blending = CustomBlending;
	material.blendEquation = AddEquation;
	material.blendSrc = ZeroFactor;
	material.blendDst = ZeroFactor;
	return material;

};

/**
 * Toggle between the 2D non layer meshes and the blend layer meshes for native layer rendering.
 * This is needed to disable video texture rendering from the 2D meshes.
 * @param {Object} [layer] The layer data object.
 * @param {boolean} [toggle] Toggle on/off.
 */
const toggleBlendLayerRender = ( layer, toggle ) => {

	layer.group.children.forEach( mesh => {

		if ( ! mesh.textureMaterial && toggle ) {

			//store the original material with the texture map
			mesh.textureMaterial = mesh.material;
			//swap the material with a cmmmon blend layer material
			mesh.material = layer.blendMaterial;

		} else {

			//disable the blend layer material.
			mesh.material = mesh.textureMaterial;
			mesh.textureMaterial = null;

		}

	} );

};

//
/**
 * update and replace the layer item at the specified index or prepend
 * @param {number} [index] The layer index to insert or update.
 * @param {Array} [layers] The medialayers.
 * @param {Object} [layer] The  layer object to insert or update.
 */
const updateOrPrepend = ( index, layers, layer ) => {

	if ( index > - 1 ) {

		layers.splice( index, 1, layer );

	} else {

		layers.unshift( layer );

	}

};

export {

	UVMapFactors,
	createMesh,
	createMaterial,
	createMeshMaterial,
	createSphereGeometry,
	createSphereMesh,
	createPlaneMesh,
	createBlendLayerMaterial,
	toggleBlendLayerRender,
	updateOrPrepend,
	positionQuad

};
