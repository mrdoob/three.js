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
	LinearFilter
} from 'three';

import { modelWorldMatrix, normalLocal, vec2, vec3, vec4, mat3, varyingProperty, texture, reference, Fn, select, positionLocal } from 'three/tsl';

/**
 * Make a new DataTexture to store the descriptions of the curves.
 *
 * @param { number } numberOfCurves the number of curves needed to be described by this texture.
 */
export function initSplineTexture( numberOfCurves = 1 ) {

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
 * Write the curve description to the data texture
 *
 * @param { DataTexture } texture The DataTexture to write to
 * @param { Curve } splineCurve The curve to describe
 * @param { number } offset Which curve slot to write to
 */
export function updateSplineTexture( texture, splineCurve, offset = 0 ) {

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
 * Create a new set of uniforms for describing the curve modifier
 *
 * @param { DataTexture } Texture which holds the curve description
 */
export function getUniforms( splineTexture ) {

	return {
		spineTexture: splineTexture,
		pathOffset: 0, // time of path curve
		pathSegment: 1, // fractional length of path
		spineOffset: 161,
		spineLength: 400,
		flow: 1, // int
	};

}

export function modifyShader( material, uniforms, numberOfCurves ) {

	const spineTexture = uniforms.spineTexture;

	const pathOffset = reference( 'pathOffset', 'float', uniforms );
	const pathSegment = reference( 'pathSegment', 'float', uniforms );
	const spineOffset = reference( 'spineOffset', 'float', uniforms );
	const spineLength = reference( 'spineLength', 'float', uniforms );
	const flow = reference( 'flow', 'float', uniforms );

	material.positionNode = Fn( () => {

		const textureStacks = TEXTURE_HEIGHT / 4;
		const textureScale = TEXTURE_HEIGHT * numberOfCurves;

		const worldPos = modelWorldMatrix.mul( vec4( positionLocal, 1 ) ).toVar();

		const bend = flow.greaterThan( 0 ).toVar();
		const xWeight = select( bend, 0, 1 ).toVar();

		const spinePortion = select( bend, worldPos.x.add( spineOffset ).div( spineLength ), 0 );
		const mt = spinePortion.mul( pathSegment ).add( pathOffset ).mul( textureStacks ).toVar();

		mt.assign( mt.mod( textureStacks ) );

		const rowOffset = mt.floor().toVar();

		const spinePos = texture( spineTexture, vec2( mt, rowOffset.add( 0.5 ).div( textureScale ) ) ).xyz;

		const a = texture( spineTexture, vec2( mt, rowOffset.add( 1.5 ).div( textureScale ) ) ).xyz;
		const b = texture( spineTexture, vec2( mt, rowOffset.add( 2.5 ).div( textureScale ) ) ).xyz;
		const c = texture( spineTexture, vec2( mt, rowOffset.add( 3.5 ).div( textureScale ) ) ).xyz;

		const basis = mat3( a, b, c ).toVar();

		varyingProperty( 'vec3', 'curveNormal' ).assign( basis.mul( normalLocal ) );

		return basis.mul( vec3( worldPos.x.mul( xWeight ), worldPos.y, worldPos.z ) ).add( spinePos );

	} )();

	material.normalNode = varyingProperty( 'vec3', 'curveNormal' );

}

/**
 * A helper class for making meshes bend aroudn curves
 */
export class Flow {

	/**
	 * @param {Mesh} mesh The mesh to clone and modify to bend around the curve
	 * @param {number} numberOfCurves The amount of space that should preallocated for additional curves
	 */
	constructor( mesh, numberOfCurves = 1 ) {

		const obj3D = mesh.clone();
		const splineTexure = initSplineTexture( numberOfCurves );
		const uniforms = getUniforms( splineTexure );

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
		this.splineTexure = splineTexure;
		this.uniforms = uniforms;

	}

	updateCurve( index, curve ) {

		if ( index >= this.curveArray.length ) throw Error( 'Index out of range for Flow' );

		const curveLength = curve.getLength();

		this.uniforms.spineLength = curveLength;
		this.curveLengthArray[ index ] = curveLength;
		this.curveArray[ index ] = curve;

		updateSplineTexture( this.splineTexure, curve, index );

	}

	moveAlongCurve( amount ) {

		this.uniforms.pathOffset += amount;

	}

}
