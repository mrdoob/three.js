/**
 * DFG LUT Generator (32x32)
 *
 * Generates a precomputed lookup table for the split-sum approximation
 * used in Image-Based Lighting. The 32x32 resolution provides a good balance
 * between quality and size for DataTexture usage.
 *
 * Reference: "Real Shading in Unreal Engine 4" by Brian Karis
 */

import * as fs from 'fs';

const LUT_SIZE = 32;
const SAMPLE_COUNT = 1024;

// Utility functions

// Van der Corput sequence
function radicalInverse_VdC(bits) {
	bits = (bits << 16) | (bits >>> 16);
	bits = ((bits & 0x55555555) << 1) | ((bits & 0xAAAAAAAA) >>> 1);
	bits = ((bits & 0x33333333) << 2) | ((bits & 0xCCCCCCCC) >>> 2);
	bits = ((bits & 0x0F0F0F0F) << 4) | ((bits & 0xF0F0F0F0) >>> 4);
	bits = ((bits & 0x00FF00FF) << 8) | ((bits & 0xFF00FF00) >>> 8);
	return (bits >>> 0) * 2.3283064365386963e-10;
}

function hammersley(i, N) {
	return [i / N, radicalInverse_VdC(i)];
}

function importanceSampleGGX(xi, N, roughness) {
	const a = roughness * roughness;
	const phi = 2.0 * Math.PI * xi[0];
	const cosTheta = Math.sqrt((1.0 - xi[1]) / (1.0 + (a * a - 1.0) * xi[1]));
	const sinTheta = Math.sqrt(1.0 - cosTheta * cosTheta);

	const H = [
		Math.cos(phi) * sinTheta,
		Math.sin(phi) * sinTheta,
		cosTheta
	];

	const up = Math.abs(N[2]) < 0.999 ? [0, 0, 1] : [1, 0, 0];
	const tangent = normalize(cross(up, N));
	const bitangent = cross(N, tangent);

	const sampleVec = [
		tangent[0] * H[0] + bitangent[0] * H[1] + N[0] * H[2],
		tangent[1] * H[0] + bitangent[1] * H[1] + N[1] * H[2],
		tangent[2] * H[0] + bitangent[2] * H[1] + N[2] * H[2]
	];

	return normalize(sampleVec);
}

function geometrySchlickGGX(NdotV, roughness) {
	const a = roughness;
	const k = (a * a) / 2.0;
	return NdotV / (NdotV * (1.0 - k) + k);
}

function geometrySmith(N, V, L, roughness) {
	const NdotV = Math.max(dot(N, V), 0.0);
	const NdotL = Math.max(dot(N, L), 0.0);
	return geometrySchlickGGX(NdotV, roughness) * geometrySchlickGGX(NdotL, roughness);
}

function dot(a, b) {
	return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cross(a, b) {
	return [
		a[1] * b[2] - a[2] * b[1],
		a[2] * b[0] - a[0] * b[2],
		a[0] * b[1] - a[1] * b[0]
	];
}

function length(v) {
	return Math.sqrt(dot(v, v));
}

function normalize(v) {
	const len = length(v);
	return len > 0 ? [v[0] / len, v[1] / len, v[2] / len] : [0, 0, 0];
}

function add(a, b) {
	return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function scale(v, s) {
	return [v[0] * s, v[1] * s, v[2] * s];
}

function integrateBRDF(NdotV, roughness) {
	const V = [
		Math.sqrt(1.0 - NdotV * NdotV),
		0.0,
		NdotV
	];

	let A = 0.0;
	let B = 0.0;
	const N = [0.0, 0.0, 1.0];

	for (let i = 0; i < SAMPLE_COUNT; i++) {
		const xi = hammersley(i, SAMPLE_COUNT);
		const H = importanceSampleGGX(xi, N, roughness);
		const L = normalize(add(scale(H, 2.0 * dot(V, H)), scale(V, -1.0)));

		const NdotL = Math.max(L[2], 0.0);
		const NdotH = Math.max(H[2], 0.0);
		const VdotH = Math.max(dot(V, H), 0.0);

		if (NdotL > 0.0) {
			const G = geometrySmith(N, V, L, roughness);
			const G_Vis = (G * VdotH) / (NdotH * NdotV);
			const Fc = Math.pow(1.0 - VdotH, 5.0);

			A += (1.0 - Fc) * G_Vis;
			B += Fc * G_Vis;
		}
	}

	return [A / SAMPLE_COUNT, B / SAMPLE_COUNT];
}

function generateDFGLUT() {
	console.log(`Generating ${LUT_SIZE}x${LUT_SIZE} DFG LUT with ${SAMPLE_COUNT} samples...`);

	const data = [];

	for (let y = 0; y < LUT_SIZE; y++) {
		const NdotV = (y + 0.5) / LUT_SIZE;

		for (let x = 0; x < LUT_SIZE; x++) {
			const roughness = (x + 0.5) / LUT_SIZE;
			const result = integrateBRDF(NdotV, roughness);

			data.push(result[0], result[1]);
		}

		if ((y + 1) % 8 === 0) {
			console.log(`Progress: ${((y + 1) / LUT_SIZE * 100).toFixed(1)}%`);
		}
	}

	console.log('Generation complete!');
	return data;
}

// Save as JavaScript module
function saveAsJavaScript(data) {
	const rows = [];

	for (let y = 0; y < LUT_SIZE; y++) {
		const rowData = [];
		for (let x = 0; x < LUT_SIZE; x++) {
			const idx = (y * LUT_SIZE + x) * 2;
			rowData.push(data[idx].toFixed(4), data[idx + 1].toFixed(4));
		}
		rows.push(`\t${rowData.join(', ')}`);
	}

	const jsContent = `/**
 * Precomputed DFG LUT for Image-Based Lighting
 * Resolution: ${LUT_SIZE}x${LUT_SIZE}
 * Samples: ${SAMPLE_COUNT} per texel
 * Format: RG (2 floats per texel: scale, bias)
 */

import { DataTexture } from '../../textures/DataTexture.js';
import { RGFormat, FloatType, LinearFilter, ClampToEdgeWrapping } from '../../constants.js';

export const DFG_LUT_SIZE = ${LUT_SIZE};

const DFG_LUT_DATA = new Float32Array([
${rows.join(',\n')}
]);

let dfgLUTTexture = null;

export function getDFGLUT() {
	if ( dfgLUTTexture === null ) {
		dfgLUTTexture = new DataTexture( DFG_LUT_DATA, DFG_LUT_SIZE, DFG_LUT_SIZE, RGFormat, FloatType );
		dfgLUTTexture.minFilter = LinearFilter;
		dfgLUTTexture.magFilter = LinearFilter;
		dfgLUTTexture.wrapS = ClampToEdgeWrapping;
		dfgLUTTexture.wrapT = ClampToEdgeWrapping;
		dfgLUTTexture.generateMipmaps = false;
		dfgLUTTexture.needsUpdate = true;
	}
	return dfgLUTTexture;
}
`;

	fs.writeFileSync('./src/renderers/shaders/DFGLUTData.js', jsContent);
	console.log('Saved JavaScript version to ./src/renderers/shaders/DFGLUTData.js');
}

// Generate and save
const lutData = generateDFGLUT();
saveAsJavaScript(lutData);

console.log(`\nDFG LUT generation complete!`);
console.log(`Size: ${LUT_SIZE}x${LUT_SIZE} = ${LUT_SIZE * LUT_SIZE} texels`);
console.log(`Data size: ${(lutData.length * 4 / 1024).toFixed(2)} KB (Float32)`);
console.log(`\nThe LUT is used as a DataTexture in the renderer.`);
