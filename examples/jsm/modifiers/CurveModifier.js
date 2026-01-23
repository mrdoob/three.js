// Original src: https://github.com/zz85/threejs-path-flow
const CHANNELS = 4;
const TEXTURE_WIDTH = 1024;
const TEXTURE_HEIGHT = 4;

import {
	DataTexture,
	DataUtils,
	RGBAFormat,
	HalfFloatType,
	RepeatWrapping,
	Mesh,
	InstancedMesh,
	LinearFilter,
	DynamicDrawUsage,
	Matrix4
} from 'three';

/**
 * Make a new DataTexture to store the descriptions of the curves.
 *
 * @private
 * @param {number} numberOfCurves - The number of curves needed to be described by this texture.
 * @returns {DataTexture}
 */
function initSplineTexture( numberOfCurves = 1 ) {

	const dataArray = new Uint16Array( TEXTURE_WIDTH * TEXTURE_HEIGHT * numberOfCurves * CHANNELS );
	const dataTexture = new DataTexture(
		dataArray,
		TEXTURE_WIDTH,
		TEXTURE_HEIGHT * numberOfCurves,
		RGBAFormat,
		HalfFloatType
	);

	dataTexture.wrapS = RepeatWrapping;
	dataTexture.wrapY = RepeatWrapping;
	dataTexture.magFilter = LinearFilter;
	dataTexture.minFilter = LinearFilter;
	dataTexture.needsUpdate = true;

	return dataTexture;

}

/**
 * Write the curve description to the data texture.
 *
 * @private
 * @param {DataTexture} texture - The data texture to write to.
 * @param {Curve} splineCurve - The curve to describe.
 * @param {number} offset - Which curve slot to write to.
 */
function updateSplineTexture( texture, splineCurve, offset = 0 ) {

	const numberOfPoints = Math.floor( TEXTURE_WIDTH * ( TEXTURE_HEIGHT / 4 ) );
	splineCurve.arcLengthDivisions = numberOfPoints / 2;
	splineCurve.updateArcLengths();
	const points = splineCurve.getSpacedPoints( numberOfPoints );
	const frenetFrames = splineCurve.computeFrenetFrames( numberOfPoints, true );

	for ( let i = 0; i < numberOfPoints; i ++ ) {

		const rowOffset = Math.floor( i / TEXTURE_WIDTH );
		const rowIndex = i % TEXTURE_WIDTH;

		let pt = points[ i ];
		setTextureValue( texture, rowIndex, pt.x, pt.y, pt.z, 0 + rowOffset + ( TEXTURE_HEIGHT * offset ) );
		pt = frenetFrames.tangents[ i ];
		setTextureValue( texture, rowIndex, pt.x, pt.y, pt.z, 1 + rowOffset + ( TEXTURE_HEIGHT * offset ) );
		pt = frenetFrames.normals[ i ];
		setTextureValue( texture, rowIndex, pt.x, pt.y, pt.z, 2 + rowOffset + ( TEXTURE_HEIGHT * offset ) );
		pt = frenetFrames.binormals[ i ];
		setTextureValue( texture, rowIndex, pt.x, pt.y, pt.z, 3 + rowOffset + ( TEXTURE_HEIGHT * offset ) );

	}

	texture.needsUpdate = true;

}

function setTextureValue( texture, index, x, y, z, o ) {

	const image = texture.image;
	const { data } = image;
	const i = CHANNELS * TEXTURE_WIDTH * o; // Row Offset
	data[ index * CHANNELS + i + 0 ] = DataUtils.toHalfFloat( x );
	data[ index * CHANNELS + i + 1 ] = DataUtils.toHalfFloat( y );
	data[ index * CHANNELS + i + 2 ] = DataUtils.toHalfFloat( z );
	data[ index * CHANNELS + i + 3 ] = DataUtils.toHalfFloat( 1 );

}

/**
 * Create a new set of uniforms for describing the curve modifier.
 *
 * @param {DataTexture} splineTexture - Which holds the curve description.
 * @returns {Object} The uniforms object to be used in the shader.
 */
function getUniforms( splineTexture ) {

	const uniforms = {
		spineTexture: { value: splineTexture },
		pathOffset: { type: 'f', value: 0 }, // time of path curve
		pathSegment: { type: 'f', value: 1 }, // fractional length of path
		spineOffset: { type: 'f', value: 161 },
		spineLength: { type: 'f', value: 400 },
		flow: { type: 'i', value: 1 },
	};
	return uniforms;

}

function modifyShader( material, uniforms, numberOfCurves = 1 ) {

	if ( material.__ok ) return;
	material.__ok = true;

	material.onBeforeCompile = ( shader ) => {

		if ( shader.__modified ) return;
		shader.__modified = true;

		Object.assign( shader.uniforms, uniforms );

		const vertexShader = `
		uniform sampler2D spineTexture;
		uniform float pathOffset;
		uniform float pathSegment;
		uniform float spineOffset;
		uniform float spineLength;
		uniform int flow;

		float textureLayers = ${TEXTURE_HEIGHT * numberOfCurves}.;
		float textureStacks = ${TEXTURE_HEIGHT / 4}.;

		${shader.vertexShader}
		`
		// chunk import moved in front of modified shader below
			.replace( '#include <beginnormal_vertex>', '' )

			// vec3 transformedNormal declaration overridden below
			.replace( '#include <defaultnormal_vertex>', '' )

			// vec3 transformed declaration overridden below
			.replace( '#include <begin_vertex>', '' )

			// shader override
			.replace(
				/void\s*main\s*\(\)\s*\{/,
				`
void main() {
#include <beginnormal_vertex>

vec4 worldPos = modelMatrix * vec4(position, 1.);

bool bend = flow > 0;
float xWeight = bend ? 0. : 1.;

#ifdef USE_INSTANCING
float pathOffsetFromInstanceMatrix = instanceMatrix[3][2];
float spineLengthFromInstanceMatrix = instanceMatrix[3][0];
float spinePortion = bend ? (worldPos.x + spineOffset) / spineLengthFromInstanceMatrix : 0.;
float mt = (spinePortion * pathSegment + pathOffset + pathOffsetFromInstanceMatrix)*textureStacks;
#else
float spinePortion = bend ? (worldPos.x + spineOffset) / spineLength : 0.;
float mt = (spinePortion * pathSegment + pathOffset)*textureStacks;
#endif

mt = mod(mt, textureStacks);
float rowOffset = floor(mt);

#ifdef USE_INSTANCING
rowOffset += instanceMatrix[3][1] * ${TEXTURE_HEIGHT}.;
#endif

vec3 spinePos = texture2D(spineTexture, vec2(mt, (0. + rowOffset + 0.5) / textureLayers)).xyz;
vec3 a =        texture2D(spineTexture, vec2(mt, (1. + rowOffset + 0.5) / textureLayers)).xyz;
vec3 b =        texture2D(spineTexture, vec2(mt, (2. + rowOffset + 0.5) / textureLayers)).xyz;
vec3 c =        texture2D(spineTexture, vec2(mt, (3. + rowOffset + 0.5) / textureLayers)).xyz;
mat3 basis = mat3(a, b, c);

vec3 transformed = basis
	* vec3(worldPos.x * xWeight, worldPos.y * 1., worldPos.z * 1.)
	+ spinePos;

vec3 transformedNormal = normalMatrix * (basis * objectNormal);
			` ).replace(
				'#include <project_vertex>',
				`vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );
				gl_Position = projectionMatrix * mvPosition;`
			);

		shader.vertexShader = vertexShader;

	};

}

/**
 * A modifier for making meshes bend around curves.
 *
 * This module can only be used with {@link WebGLRenderer}. When using {@link WebGPURenderer},
 * import the class from `CurveModifierGPU.js`.
 *
 * @three_import import { Flow } from 'three/addons/modifiers/CurveModifier.js';
 */
export class Flow {

	/**
	 * Constructs a new Flow instance.
	 *
	 * @param {Mesh} mesh - The mesh to clone and modify to bend around the curve.
	 * @param {number} numberOfCurves - The amount of space that should preallocated for additional curves.
	 */
	constructor( mesh, numberOfCurves = 1 ) {

		const obj3D = mesh.clone();
		const splineTexture = initSplineTexture( numberOfCurves );
		const uniforms = getUniforms( splineTexture );
		obj3D.traverse( function ( child ) {

			if (
				child instanceof Mesh ||
				child instanceof InstancedMesh
			) {

				if ( Array.isArray( child.material ) ) {

					const materials = [];

					for ( const material of child.material ) {

						const newMaterial = material.clone();
						modifyShader( newMaterial, uniforms, numberOfCurves );
						materials.push( newMaterial );

					}

					child.material = materials;

				} else {

					child.material = child.material.clone();
					modifyShader( child.material, uniforms, numberOfCurves );

				}

			}

		} );

		this.curveArray = new Array( numberOfCurves );
		this.curveLengthArray = new Array( numberOfCurves );

		this.object3D = obj3D;
		this.splineTexture = splineTexture;
		this.uniforms = uniforms;

	}

	/**
	 * Updates the curve for the given curve index.
	 *
	 * @param {number} index - The curve index.
	 * @param {Curve} curve - The curve that should be used to bend the mesh.
	 */
	updateCurve( index, curve ) {

		if ( index >= this.curveArray.length ) throw Error( 'Flow: Index out of range.' );
		const curveLength = curve.getLength();
		this.uniforms.spineLength.value = curveLength;
		this.curveLengthArray[ index ] = curveLength;
		this.curveArray[ index ] = curve;
		updateSplineTexture( this.splineTexture, curve, index );

	}

	/**
	 * Moves the mesh along the curve.
	 *
	 * @param {number} amount - The offset.
	 */
	moveAlongCurve( amount ) {

		this.uniforms.pathOffset.value += amount;

	}

}

const _matrix = new Matrix4();

/**
 * An instanced version of {@link Flow} for making meshes bend around curves, where the instances are placed on the curve.
 *
 * This module can only be used with {@link WebGLRenderer}.
 *
 * @augments Flow
 * @three_import import { InstancedFlow } from 'three/addons/modifiers/CurveModifier.js';
 */
export class InstancedFlow extends Flow {

	/**
	 * Constructs a new InstancedFlow instance.
	 *
	 * @param {number} count - The number of instanced elements.
	 * @param {number} curveCount - The number of curves to preallocate for.
	 * @param {Geometry} geometry - The geometry to use for the instanced mesh.
	 * @param {Material} material - The material to use for the instanced mesh.
	 */
	constructor( count, curveCount, geometry, material ) {

		const mesh = new InstancedMesh(
			geometry,
			material,
			count
		);
		mesh.instanceMatrix.setUsage( DynamicDrawUsage );
		mesh.frustumCulled = false;
		super( mesh, curveCount );

		this.offsets = new Array( count ).fill( 0 );
		this.whichCurve = new Array( count ).fill( 0 );

	}

	/**
	 * The extra information about which curve and curve position is stored in the translation components of the matrix for the instanced objects
	 * This writes that information to the matrix and marks it as needing update.
	 *
	 * @param {number} index - The index of tge instanced element to update.
	 */
	writeChanges( index ) {

		_matrix.makeTranslation(
			this.curveLengthArray[ this.whichCurve[ index ] ],
			this.whichCurve[ index ],
			this.offsets[ index ]
		);
		this.object3D.setMatrixAt( index, _matrix );
		this.object3D.instanceMatrix.needsUpdate = true;

	}

	/**
	 * Move an individual element along the curve by a specific amount.
	 *
	 * @param {number} index - Which element to update.
	 * @param {number} offset - The offset.
	 */
	moveIndividualAlongCurve( index, offset ) {

		this.offsets[ index ] += offset;
		this.writeChanges( index );

	}

	/**
	 * Select which curve to use for an element.
	 *
	 * @param {number} index - The index of the instanced element to update.
	 * @param {number} curveNo - The index of the curve it should use.
	 */
	setCurve( index, curveNo ) {

		if ( isNaN( curveNo ) ) throw Error( 'InstancedFlow: Curve index being set is Not a Number (NaN).' );
		this.whichCurve[ index ] = curveNo;
		this.writeChanges( index );

	}

}
