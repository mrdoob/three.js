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

        } else if (encodeMethod == "OCT") {

            result = new Int8Array(count * 2);

        } else {

            console.error("Unrecognized encoding method, should be `BASIC` or `OCT`. ");

        }


        for (let idx = 0; idx < array.length; idx += 3) {

            let encoded;
            if (encodeMethod == "BASIC") {

                encoded = uInt16Encode(array[idx], array[idx + 1], array[idx + 2]);

                result[idx / 3 * 2 + 0] = encoded[0];
                result[idx / 3 * 2 + 1] = encoded[1];

            } else if (encodeMethod == "OCT") {

                var oct, dec, best, currentCos, bestCos;

                encoded = octEncodeBest(array[idx], array[idx + 1], array[idx + 2]);

                result[idx / 3 * 2 + 0] = encoded[0];
                result[idx / 3 * 2 + 1] = encoded[1];

            }
        }

        mesh.geometry.setAttribute('normal', new THREE.BufferAttribute(result, 2, true));

        mesh.geometry.attributes.normal.isPacked = true;
        mesh.geometry.attributes.normal.packingMethod = encodeMethod;

        // modify material
        mesh.material = new PackedPhongMaterial().copy(mesh.material);
        Object.defineProperty(mesh.material.defines, 'USE_PACKED_NORMAL', { value: "" });
        if (encodeMethod == "BASIC"){
            mesh.material.defines.USE_PACKED_NORMAL = 0;
        }
        if (encodeMethod == "OCT"){
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
                Math[xfunc](x * 127.5 + (x < 0 ? -1 : 0)),
                Math[yfunc](y * 127.5 + (y < 0 ? -1 : 0))
            ]);
        }

        function octDecodeVec2(oct) {
            var x = oct[0];
            var y = oct[1];
            x /= x < 0 ? 127 : 128;
            y /= y < 0 ? 127 : 128;

            var z = 1 - Math.abs(x) - Math.abs(y);

            if (z < 0) {
                x = (1 - Math.abs(y)) * (x >= 0 ? 1 : -1);
                y = (1 - Math.abs(x)) * (y >= 0 ? 1 : -1);
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


    changeShaderChunk: function () {

        THREE.ShaderChunk.beginnormal_vertex = `

        vec3 objectNormal = vec3( normal );
        #ifdef USE_TANGENT
            vec3 objectTangent = vec3( tangent.xyz );
        #endif

        #ifdef USE_PACKED_NORMAL
            #ifdef USE_PACKED_NORMAL == 0
                float x = objectNormal.x * 2.0 - 1.0;
                float y = objectNormal.y * 2.0 - 1.0;
                vec2 scth = vec2(sin(x * PI), cos(x * PI));
                vec2 scphi = vec2(sqrt(1.0 - y * y), y); 
                objectNormal = normalize( vec3(scth.y * scphi.x, scth.x * scphi.x, scphi.y) );
                objectNormal = vec3(0.0, 0.0, 1.0);
            #endif

            #ifdef USE_PACKED_NORMAL == 1
                float x = objectNormal.x;
                float y = objectNormal.y;
                float z = 1.0 - abs(x) - abs(y);
                if (z < 0.0) { 
                    x = (1.0 - abs(y)) * (x >= 0.0 ? 1.0 : -1.0);
                    y = (1.0 - abs(x)) * (y >= 0.0 ? 1.0 : -1.0);
                }
                float length = sqrt(x * x + y * y + z * z);
                objectNormal = normalize( vec3(x / length, y / length, z / length) );
            #endif
        #endif
        
        `;
    }

};


function PackedPhongMaterial(parameters) {
    THREE.MeshPhongMaterial.call(this);
    this.defines = { 'USE_PACKED_NORMAL': '' };
    this.type = 'PackedPhongMaterial'; // IMPORTANT: DO NOT CHANGE THIS TYPE
    this.uniforms = PackedPhongShader.uniforms;
    this.vertexShader = PackedPhongShader.vertexShader;
    this.fragmentShader = PackedPhongShader.fragmentShader;
    this.setValues(parameters);
}

var PackedPhongShader = {

    uniforms: THREE.UniformsUtils.merge([

        THREE.ShaderLib.phong.uniforms,

        // {
        //     packedNormal: { value: null }
        // }

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
                // float x = packedNormal.x / packedNormal.x < 0.0 ? 127.0 : 128.0;
                // float y = packedNormal.y / packedNormal.y < 0.0 ? 127.0 : 128.0;
                float x = packedNormal.x;
                float y = packedNormal.y;
                float z = 1.0 - abs(x) - abs(y);
                if (z < 0.0) { 
                    x = (1.0 - abs(y)) * (x >= 0.0 ? 1.0 : -1.0);
                    y = (1.0 - abs(x)) * (y >= 0.0 ? 1.0 : -1.0);
                }
                float length = sqrt(x * x + y * y + z * z);
                return normalize( vec3(x / length, y / length, z / length) );
            } 

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