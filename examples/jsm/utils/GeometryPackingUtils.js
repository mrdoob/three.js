/**
 * @author YY
 */

import * as THREE from "../../../build/three.module.js";

var GeometryPackingUtils = {

    packNormals: function (mesh, encodeMethod) {

        if (!mesh.geometry) {
            console.error("Mesh must contain geometry property. ");
        }

        let normal = mesh.geometry.attributes.normal;

        if (!normal) {
            console.error("Geometry must contain normal attribute. ");
        }

        if (normal.isPacked) return;

        if (normal.itemSize != 3) {
            console.error("normal.itemSize is not 3, which cannot be packed. ");
        }

        let array = normal.array;
        let count = normal.count;

        let result;
        if (encodeMethod == "BASIC") {

            result = new Uint16Array(count * 2);

            for (let idx = 0; idx < array.length; idx += 3) {

                let encoded;

                encoded = uInt16Encode(array[idx], array[idx + 1], array[idx + 2]);

                result[idx / 3 * 2 + 0] = encoded[0];
                result[idx / 3 * 2 + 1] = encoded[1];

            }

        } else if (encodeMethod == "OCT") {

            result = new Int8Array(count * 2);

            var oct, dec, best, currentCos, bestCos;

            for (let idx = 0; idx < array.length; idx += 3) {

                let encoded;

                encoded = octEncodeBest(array[idx], array[idx + 1], array[idx + 2]);

                result[idx / 3 * 2 + 0] = encoded[0];
                result[idx / 3 * 2 + 1] = encoded[1];

            }

        } else {

            console.error("Unrecognized encoding method, should be `BASIC` or `OCT`. ");

        }


        mesh.geometry.setAttribute('normal', new THREE.BufferAttribute(result, 2, true));

        mesh.geometry.attributes.normal.needsUpdate = true;
        mesh.geometry.attributes.normal.isPacked = true;
        mesh.geometry.attributes.normal.packingMethod = encodeMethod;

        // modify material
        if (!(mesh.material instanceof PackedPhongMaterial)) {
            mesh.material = new PackedPhongMaterial().copy(mesh.material);
        }

        if (encodeMethod == "BASIC") {
            mesh.material.defines.USE_PACKED_NORMAL = 0;
        }
        if (encodeMethod == "OCT") {
            mesh.material.defines.USE_PACKED_NORMAL = 1;
        }


        /**
         * 
         * Encoding functions: Basic, OCT
         * 
         */

        // for `Basic` encoding
        function uInt16Encode(x, y, z) {
            let normal0 = parseInt(0.5 * (1.0 + Math.atan2(y, x) / Math.PI) * 65535);
            let normal1 = parseInt(0.5 * (1.0 + z) * 65535);
            return new Uint16Array([normal0, normal1]);
        }

        // for `OCT` encoding
        function octEncodeBest(x, y, z) {
            // Test various combinations of ceil and floor
            // to minimize rounding errors
            best = oct = octEncodeVec3(x, y, z, "floor", "floor");
            dec = octDecodeVec2(oct);
            currentCos = bestCos = dot(x, y, z, dec);

            oct = octEncodeVec3(x, y, z, "ceil", "floor");
            dec = octDecodeVec2(oct);
            currentCos = dot(x, y, z, dec);

            if (currentCos > bestCos) {
                best = oct;
                bestCos = currentCos;
            }

            oct = octEncodeVec3(x, y, z, "floor", "ceil");
            dec = octDecodeVec2(oct);
            currentCos = dot(x, y, z, dec);

            if (currentCos > bestCos) {
                best = oct;
                bestCos = currentCos;
            }

            oct = octEncodeVec3(x, y, z, "ceil", "ceil");
            dec = octDecodeVec2(oct);
            currentCos = dot(x, y, z, dec);

            if (currentCos > bestCos) {
                best = oct;
                bestCos = currentCos;
            }

            var angle = Math.acos(bestCos) * 180 / Math.PI;

            if (angle > 10){
                console.log(angle)
                oct = octEncodeVec3(x, y, z, "floor", "floor"); dec = octDecodeVec2(oct);
                console.log([x, y, z], octDecodeVec2(octEncodeVec3(x, y, z, "floor", "floor")))
                console.log([x, y, z], octDecodeVec2(octEncodeVec3(x, y, z, "ceil", "floor")))
                console.log([x, y, z], octDecodeVec2(octEncodeVec3(x, y, z, "floor", "ceil")))
                console.log([x, y, z], octDecodeVec2(octEncodeVec3(x, y, z, "ceil", "ceil")))

            }

            return best;
        }

        function octEncodeVec3(x, y, z, xfunc, yfunc) {
            var x = x / (Math.abs(x) + Math.abs(y) + Math.abs(z));
            var y = y / (Math.abs(x) + Math.abs(y) + Math.abs(z));

            if (z < 0) {
                var tempx = x;
                var tempy = y;
                tempx = (1 - Math.abs(y)) * (x >= 0 ? 1 : -1);
                tempy = (1 - Math.abs(x)) * (y >= 0 ? 1 : -1);
                x = tempx;
                y = tempy;
            }

            return new Int8Array([
                Math[xfunc](x * 127.5 + (x < 0 ? 1 : 0)),
                Math[yfunc](y * 127.5 + (y < 0 ? 1 : 0))
            ]);
        }

        function octDecodeVec2(oct) {
            var x = oct[0];
            var y = oct[1];
            x /= x < 0 ? 127 : 128;
            y /= y < 0 ? 127 : 128;

            var z = 1 - Math.abs(x) - Math.abs(y);

            if (z < 0) {
                var tmpx = x;
                x = (1 - Math.abs(y)) * (x >= 0 ? 1 : -1);
                y = (1 - Math.abs(tmpx)) * (y >= 0 ? 1 : -1);
            }

            var length = Math.sqrt(x * x + y * y + z * z);

            return [
                x / length,
                y / length,
                z / length
            ];
        }

        function dot(x, y, z, vec3) {
            return x * vec3[0] + y * vec3[1] + z * vec3[2];
        }
    },


    packPositions: function (mesh) {

        if (!mesh.geometry) {
            console.error("Mesh must contain geometry property. ");
        }

        let position = mesh.geometry.attributes.position;

        if (!position) {
            console.error("Geometry must contain position attribute. ");
        }

        if (position.isPacked) return;

        if (position.itemSize != 3) {
            console.error("position.itemSize is not 3, which cannot be packed. ");
        }

        let array = position.array;
        let count = position.count;

        let quantized = new Uint16Array(array.length);

        let decodeMat4 = new THREE.Matrix4();
        let min = new Float32Array(3);
        let max = new Float32Array(3);

        min[0] = min[1] = min[2] = Number.MAX_VALUE;
        max[0] = max[1] = max[2] = -Number.MAX_VALUE;

        for (let i = 0; i < array.length; i += 3) {
            min[0] = Math.min(min[0], array[i + 0]);
            min[1] = Math.min(min[1], array[i + 1]);
            min[2] = Math.min(min[2], array[i + 2]);
            max[0] = Math.max(max[0], array[i + 0]);
            max[1] = Math.max(max[1], array[i + 1]);
            max[2] = Math.max(max[2], array[i + 2]);
        }

        decodeMat4.scale(new THREE.Vector3(
            (max[0] - min[0]) / 65535,
            (max[1] - min[1]) / 65535,
            (max[2] - min[2]) / 65535
        ));

        decodeMat4.elements[12] = min[0];
        decodeMat4.elements[13] = min[1];
        decodeMat4.elements[14] = min[2];

        decodeMat4.transpose();


        let multiplier = new Float32Array([
            max[0] !== min[0] ? 65535 / (max[0] - min[0]) : 0,
            max[1] !== min[1] ? 65535 / (max[1] - min[1]) : 0,
            max[2] !== min[2] ? 65535 / (max[2] - min[2]) : 0
        ]);

        for (let i = 0; i < array.length; i += 3) {
            quantized[i + 0] = Math.floor((array[i + 0] - min[0]) * multiplier[0]);
            quantized[i + 1] = Math.floor((array[i + 1] - min[1]) * multiplier[1]);
            quantized[i + 2] = Math.floor((array[i + 2] - min[2]) * multiplier[2]);
        }

        // IMPORTANT: calculate original geometry bounding info first, before updating packed positions
        if (mesh.geometry.boundingBox == null) mesh.geometry.computeBoundingBox();
        if (mesh.geometry.boundingSphere == null) mesh.geometry.computeBoundingSphere();

        mesh.geometry.setAttribute('position', new THREE.BufferAttribute(quantized, 3));
        mesh.geometry.attributes.position.isPacked = true;
        mesh.geometry.attributes.position.needsUpdate = true;

        // modify material
        if (!(mesh.material instanceof PackedPhongMaterial)) {
            mesh.material = new PackedPhongMaterial().copy(mesh.material);
        }

        mesh.material.defines.USE_PACKED_POSITION = 0;

        mesh.material.uniforms.quantizeMat.value = decodeMat4;
        mesh.material.uniforms.quantizeMat.needsUpdate = true;

    },


    changeShaderChunk: function () {

        THREE.ShaderChunk.beginnormal_vertex = `

        vec3 objectNormal = vec3( normal );
        #ifdef USE_TANGENT
            vec3 objectTangent = vec3( tangent.xyz );
        #endif

        #ifdef USE_PACKED_NORMAL
            #ifdef USE_PACKED_NORMAL == 0  // basicEncode
                float x = objectNormal.x * 2.0 - 1.0;
                float y = objectNormal.y * 2.0 - 1.0;
                vec2 scth = vec2(sin(x * PI), cos(x * PI));
                vec2 scphi = vec2(sqrt(1.0 - y * y), y); 
                objectNormal = normalize( vec3(scth.y * scphi.x, scth.x * scphi.x, scphi.y) );
            #endif

            #ifdef USE_PACKED_NORMAL == 1  // octEncode
                vec3 v = vec3(objectNormal.xy, 1.0 - abs(objectNormal.x) - abs(objectNormal.y));
                if (v.z < 0.0) 
                {
                    v.xy = (1.0 - abs(v.yx)) * vec2((v.x >= 0.0) ? +1.0 : -1.0, (v.y >= 0.0) ? +1.0 : -1.0);
                }
                objectNormal = normalize(v);
            #endif
        #endif
        
        `;
    }

};

/**
 * PackedPhongMaterial inherited from THREE.MeshPhongMaterial
 * 
 * @param {*} parameters 
 */
function PackedPhongMaterial(parameters) {
    THREE.MeshPhongMaterial.call(this);
    this.defines = {};
    this.type = 'PackedPhongMaterial';
    this.uniforms = PackedPhongShader.uniforms;
    this.vertexShader = PackedPhongShader.vertexShader;
    this.fragmentShader = PackedPhongShader.fragmentShader;
    this.setValues(parameters);
}

var PackedPhongShader = {

    uniforms: THREE.UniformsUtils.merge([

        THREE.ShaderLib.phong.uniforms,

        {
            quantizeMat: { value: null }
        }

    ]),

    vertexShader: [
        "#define PHONG",

        "varying vec3 vViewPosition;",

        "#ifndef FLAT_SHADED",
        "varying vec3 vNormal;",
        "#endif",

        THREE.ShaderChunk.common,
        THREE.ShaderChunk.uv_pars_vertex,
        THREE.ShaderChunk.uv2_pars_vertex,
        THREE.ShaderChunk.displacementmap_pars_vertex,
        THREE.ShaderChunk.envmap_pars_vertex,
        THREE.ShaderChunk.color_pars_vertex,
        THREE.ShaderChunk.fog_pars_vertex,
        THREE.ShaderChunk.morphtarget_pars_vertex,
        THREE.ShaderChunk.skinning_pars_vertex,
        THREE.ShaderChunk.shadowmap_pars_vertex,
        THREE.ShaderChunk.logdepthbuf_pars_vertex,
        THREE.ShaderChunk.clipping_planes_pars_vertex,

        `#ifdef USE_PACKED_NORMAL
            vec3 basicDecode(vec3 packedNormal)
            { 
                float x = packedNormal.x * 2.0 - 1.0;
                float y = packedNormal.y * 2.0 - 1.0;
                vec2 scth = vec2(sin(x * PI), cos(x * PI));
                vec2 scphi = vec2(sqrt(1.0 - y * y), y); 
                return normalize( vec3(scth.y * scphi.x, scth.x * scphi.x, scphi.y) );
            } 

            vec3 octDecode(vec3 packedNormal)
            { 
                vec3 v = vec3(packedNormal.xy, 1.0 - abs(packedNormal.x) - abs(packedNormal.y));
                if (v.z < 0.0) 
                {
                    v.xy = (1.0 - abs(v.yx)) * vec2((v.x >= 0.0) ? +1.0 : -1.0, (v.y >= 0.0) ? +1.0 : -1.0);
                }
                return normalize(v);
            } 
        #endif`,

        `#ifdef USE_PACKED_POSITION
            #if USE_PACKED_POSITION == 0
                uniform mat4 quantizeMat;
            #endif
        #endif`,

        "void main() {",

        THREE.ShaderChunk.uv_vertex,
        THREE.ShaderChunk.uv2_vertex,
        THREE.ShaderChunk.color_vertex,
        THREE.ShaderChunk.beginnormal_vertex,

        `#ifdef USE_PACKED_NORMAL
            #if USE_PACKED_NORMAL == 0
                objectNormal = basicDecode(objectNormal);
            #endif

            #if USE_PACKED_NORMAL == 1
                objectNormal = octDecode(objectNormal);
            #endif
        #endif

        #ifdef USE_TANGENT
            vec3 objectTangent = vec3( tangent.xyz );
        #endif
        `,

        THREE.ShaderChunk.morphnormal_vertex,
        THREE.ShaderChunk.skinbase_vertex,
        THREE.ShaderChunk.skinnormal_vertex,
        THREE.ShaderChunk.defaultnormal_vertex,

        "#ifndef FLAT_SHADED",
        "vNormal = normalize( transformedNormal );",
        "#endif",

        THREE.ShaderChunk.begin_vertex,

        `#ifdef USE_PACKED_POSITION
            #if USE_PACKED_POSITION == 0
                transformed = ( vec4(transformed, 1.0) * quantizeMat ).xyz;
            #endif
        #endif`,

        THREE.ShaderChunk.morphtarget_vertex,
        THREE.ShaderChunk.skinning_vertex,
        THREE.ShaderChunk.displacementmap_vertex,
        THREE.ShaderChunk.project_vertex,
        THREE.ShaderChunk.logdepthbuf_vertex,
        THREE.ShaderChunk.clipping_planes_vertex,

        "vViewPosition = - mvPosition.xyz;",

        THREE.ShaderChunk.worldpos_vertex,
        THREE.ShaderChunk.envmap_vertex,
        THREE.ShaderChunk.shadowmap_vertex,
        THREE.ShaderChunk.fog_vertex,

        "}",
    ].join("\n"),

    fragmentShader: [
        "#define PHONG",

        "uniform vec3 diffuse;",
        "uniform vec3 emissive;",
        "uniform vec3 specular;",
        "uniform float shininess;",
        "uniform float opacity;",

        THREE.ShaderChunk.common,
        THREE.ShaderChunk.packing,
        THREE.ShaderChunk.dithering_pars_fragment,
        THREE.ShaderChunk.color_pars_fragment,
        THREE.ShaderChunk.uv_pars_fragment,
        THREE.ShaderChunk.uv2_pars_fragment,
        THREE.ShaderChunk.map_pars_fragment,
        THREE.ShaderChunk.alphamap_pars_fragment,
        THREE.ShaderChunk.aomap_pars_fragment,
        THREE.ShaderChunk.lightmap_pars_fragment,
        THREE.ShaderChunk.emissivemap_pars_fragment,
        THREE.ShaderChunk.envmap_common_pars_fragment,
        THREE.ShaderChunk.envmap_pars_fragment,
        THREE.ShaderChunk.cube_uv_reflection_fragment,
        THREE.ShaderChunk.fog_pars_fragment,
        THREE.ShaderChunk.bsdfs,
        THREE.ShaderChunk.lights_pars_begin,
        THREE.ShaderChunk.lights_phong_pars_fragment,
        THREE.ShaderChunk.shadowmap_pars_fragment,
        THREE.ShaderChunk.bumpmap_pars_fragment,
        THREE.ShaderChunk.normalmap_pars_fragment,
        THREE.ShaderChunk.specularmap_pars_fragment,
        THREE.ShaderChunk.logdepthbuf_pars_fragment,
        THREE.ShaderChunk.clipping_planes_pars_fragment,

        "void main() {",

        THREE.ShaderChunk.clipping_planes_fragment,

        "vec4 diffuseColor = vec4( diffuse, opacity );",
        "ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );",
        "vec3 totalEmissiveRadiance = emissive;",

        THREE.ShaderChunk.logdepthbuf_fragment,
        THREE.ShaderChunk.map_fragment,
        THREE.ShaderChunk.color_fragment,
        THREE.ShaderChunk.alphamap_fragment,
        THREE.ShaderChunk.alphatest_fragment,
        THREE.ShaderChunk.specularmap_fragment,
        THREE.ShaderChunk.normal_fragment_begin,
        THREE.ShaderChunk.normal_fragment_maps,
        THREE.ShaderChunk.emissivemap_fragment,

        // accumulation
        THREE.ShaderChunk.lights_phong_fragment,
        THREE.ShaderChunk.lights_fragment_begin,
        THREE.ShaderChunk.lights_fragment_maps,
        THREE.ShaderChunk.lights_fragment_end,

        // modulation
        THREE.ShaderChunk.aomap_fragment,

        "vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;",

        THREE.ShaderChunk.envmap_fragment,

        "gl_FragColor = vec4( outgoingLight, diffuseColor.a );",

        THREE.ShaderChunk.tonemapping_fragment,
        THREE.ShaderChunk.encodings_fragment,
        THREE.ShaderChunk.fog_fragment,
        THREE.ShaderChunk.premultiplied_alpha_fragment,
        THREE.ShaderChunk.dithering_fragment,
        "}",
    ].join("\n")
};

PackedPhongMaterial.prototype = Object.create(THREE.MeshPhongMaterial.prototype);

export { GeometryPackingUtils, PackedPhongMaterial };