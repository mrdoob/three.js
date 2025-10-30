/**
 * Sheen LUT Generator for Three.js
 * Generates precomputed lookup table for Charlie Sheen BRDF
 * 
 * Usage: node generateSheenLUT.js [resolution] [samples]
 * Example: node generateSheenLUT.js 32 4096
 */

import * as fs from 'fs';

// Configuration
const RESOLUTION = parseInt(process.argv[2]) || 32;
const SAMPLES_PER_TEXEL = parseInt(process.argv[3]) || 4096;

console.log(`Generating Sheen LUT: ${RESOLUTION}x${RESOLUTION}, ${SAMPLES_PER_TEXEL} samples per texel`);

// ============================================================================
// Math utilities
// ============================================================================

function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function normalize(v) {
    const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    return [v[0] / len, v[1] / len, v[2] / len];
}

function add(a, b) {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function scale(v, s) {
    return [v[0] * s, v[1] * s, v[2] * s];
}

function clamp(x, min, max) {
    return Math.max(min, Math.min(max, x));
}

// ============================================================================
// Random number generation
// ============================================================================

function radicalInverse_VdC(bits) {
    bits = (bits << 16) | (bits >>> 16);
    bits = ((bits & 0x55555555) << 1) | ((bits & 0xAAAAAAAA) >>> 1);
    bits = ((bits & 0x33333333) << 2) | ((bits & 0xCCCCCCCC) >>> 2);
    bits = ((bits & 0x0F0F0F0F) << 4) | ((bits & 0xF0F0F0F0) >>> 4);
    bits = ((bits & 0x00FF00FF) << 8) | ((bits & 0xFF00FF00) >>> 8);
    return (bits >>> 0) * 2.3283064365386963e-10; // / 0x100000000
}

function hammersley(i, N) {
    return [i / N, radicalInverse_VdC(i)];
}

// ============================================================================
// Sampling functions
// ============================================================================

// Cosine-weighted hemisphere sampling
function importanceSampleCosine(u, v) {
    const phi = 2.0 * Math.PI * u;
    const cosTheta = Math.sqrt(1.0 - v);
    const sinTheta = Math.sqrt(v);
    
    return [
        Math.cos(phi) * sinTheta,
        Math.sin(phi) * sinTheta,
        cosTheta
    ];
}

// Transform sample from tangent space to world space
function tangentToWorld(sample, N) {
    const up = Math.abs(N[2]) < 0.999 ? [0, 0, 1] : [1, 0, 0];
    const tangent = normalize([
        up[1] * N[2] - up[2] * N[1],
        up[2] * N[0] - up[0] * N[2],
        up[0] * N[1] - up[1] * N[0]
    ]);
    const bitangent = [
        N[1] * tangent[2] - N[2] * tangent[1],
        N[2] * tangent[0] - N[0] * tangent[2],
        N[0] * tangent[1] - N[1] * tangent[0]
    ];
    
    return normalize([
        tangent[0] * sample[0] + bitangent[0] * sample[1] + N[0] * sample[2],
        tangent[1] * sample[0] + bitangent[1] * sample[1] + N[1] * sample[2],
        tangent[2] * sample[0] + bitangent[2] * sample[1] + N[2] * sample[2]
    ]);
}

// ============================================================================
// Charlie Sheen BRDF
// ============================================================================

function D_Charlie(roughness, NoH) {
    // Charlie sheen distribution
    const invAlpha = 1.0 / roughness;
    const cos2h = NoH * NoH;
    const sin2h = Math.max(1.0 - cos2h, 0.0078125); // Avoid division by zero
    return (2.0 + invAlpha) * Math.pow(sin2h, invAlpha * 0.5) / (2.0 * Math.PI);
}

function V_Ashikhmin(NoL, NoV) {
    // Ashikhmin visibility term for sheen
    return 1.0 / (4.0 * (NoL + NoV - NoL * NoV));
}

function charlieSheen(roughness, NoH, NoL, NoV) {
    const D = D_Charlie(roughness, NoH);
    const V = V_Ashikhmin(NoL, NoV);
    return D * V;
}

// ============================================================================
// LUT Generation
// ============================================================================

function integrateBRDF(roughness, NoV, samples) {
    const V = [Math.sqrt(1.0 - NoV * NoV), 0.0, NoV];
    const N = [0.0, 0.0, 1.0];
    
    let directionalAlbedo = 0.0;
    
    for (let i = 0; i < samples; i++) {
        const [u, v] = hammersley(i, samples);
        const L = importanceSampleCosine(u, v);
        const H = normalize(add(V, L));
        
        const NoL = Math.max(L[2], 0.0);
        const NoH = Math.max(H[2], 0.0);
        const VoH = Math.max(dot(V, H), 0.0);
        
        if (NoL > 0.0) {
            const brdf = charlieSheen(roughness, NoH, NoL, NoV);
            
            // Integrate directional albedo: E(μ) = ∫ f(μ, μ_o) μ_o dω_o
            // This gives us the total energy reflected, used for energy conservation
            const pdf = NoL / Math.PI; // Cosine-weighted hemisphere PDF
            directionalAlbedo += (brdf * NoL) / pdf;
        }
    }
    
    directionalAlbedo /= samples;
    
    return directionalAlbedo;
}

function generateLUT() {
    const data = new Float32Array(RESOLUTION * RESOLUTION);
    
    for (let y = 0; y < RESOLUTION; y++) {
        const roughness = (y + 0.5) / RESOLUTION;
        
        for (let x = 0; x < RESOLUTION; x++) {
            const NoV = (x + 0.5) / RESOLUTION;
            
            const directionalAlbedo = integrateBRDF(roughness, NoV, SAMPLES_PER_TEXEL);
            
            const idx = y * RESOLUTION + x;
            data[idx] = directionalAlbedo;
        }
        
        // Progress indicator
        if ((y + 1) % 4 === 0 || y === RESOLUTION - 1) {
            const progress = ((y + 1) / RESOLUTION * 100).toFixed(1);
            process.stdout.write(`\rProgress: ${progress}%`);
        }
    }
    
    console.log('\nLUT generation complete!');
    return data;
}

// ============================================================================
// Half-float conversion (IEEE 754 16-bit)
// ============================================================================

function floatToHalf(float) {
    const floatView = new Float32Array(1);
    const int32View = new Int32Array(floatView.buffer);
    
    floatView[0] = float;
    const x = int32View[0];
    
    let bits = (x >> 16) & 0x8000; // Sign bit
    let m = (x >> 12) & 0x07ff; // Mantissa
    const e = (x >> 23) & 0xff; // Exponent
    
    // Handle special cases
    if (e < 103) {
        return bits;
    }
    
    if (e > 142) {
        bits |= 0x7c00;
        bits |= ((e == 255) ? 0 : 1) && (x & 0x007fffff);
        return bits;
    }
    
    if (e < 113) {
        m |= 0x0800;
        bits |= (m >> (114 - e)) + ((m >> (113 - e)) & 1);
        return bits;
    }
    
    bits |= ((e - 112) << 10) | (m >> 1);
    bits += m & 1;
    return bits;
}

function convertToHalfFloat(data) {
    const halfData = new Uint16Array(data.length);
    for (let i = 0; i < data.length; i++) {
        halfData[i] = floatToHalf(data[i]);
    }
    return halfData;
}

// ============================================================================
// Output generation
// ============================================================================

function formatHexArray(data, itemsPerLine = 32) {
    const lines = [];
    for (let i = 0; i < data.length; i += itemsPerLine) {
        const chunk = Array.from(data.slice(i, i + itemsPerLine))
            .map(x => '0x' + x.toString(16).padStart(4, '0'))
            .join(', ');
        lines.push('\t' + chunk + (i + itemsPerLine < data.length ? ',' : ''));
    }
    return lines.join('\n');
}

function generateJavaScriptFile(halfData) {
    const header = `/**
 * Precomputed Sheen LUT for Charlie Sheen BRDF
 * Resolution: ${RESOLUTION}x${RESOLUTION}
 * Samples: ${SAMPLES_PER_TEXEL} per texel
 * Format: R16F (directional albedo for energy conservation)
 * Based on Charlie sheen BRDF model for cloth-like materials
 */

import { DataTexture } from '../../textures/DataTexture.js';
import { RedFormat, HalfFloatType, LinearFilter, ClampToEdgeWrapping } from '../../constants.js';

const DATA = new Uint16Array( [
`;

    const footer = `
] );

let lut = null;

export function getSheenLUT() {

\tif ( lut === null ) {

\t\tlut = new DataTexture( DATA, ${RESOLUTION}, ${RESOLUTION}, RedFormat, HalfFloatType );
\t\tlut.minFilter = LinearFilter;
\t\tlut.magFilter = LinearFilter;
\t\tlut.wrapS = ClampToEdgeWrapping;
\t\tlut.wrapT = ClampToEdgeWrapping;
\t\tlut.generateMipmaps = false;
\t\tlut.needsUpdate = true;

\t}

\treturn lut;

}
`;

    const dataStr = formatHexArray(halfData);
    return header + dataStr + footer;
}

// ============================================================================
// Main
// ============================================================================

console.log('Starting LUT generation...\n');
const startTime = Date.now();

const floatData = generateLUT();
const halfData = convertToHalfFloat(floatData);

const jsContent = generateJavaScriptFile(halfData);
const outputPath = './SheenLUTData.js';

fs.writeFileSync(outputPath, jsContent);

const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
console.log(`\nFile written to: ${outputPath}`);
console.log(`Total time: ${elapsed}s`);
console.log(`\nStats:`);
console.log(`  Resolution: ${RESOLUTION}x${RESOLUTION}`);
console.log(`  Samples per texel: ${SAMPLES_PER_TEXEL}`);
console.log(`  Total samples: ${RESOLUTION * RESOLUTION * SAMPLES_PER_TEXEL}`);
console.log(`  Data size: ${halfData.length * 2} bytes`);