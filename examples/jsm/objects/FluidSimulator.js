import { DataTexture, FloatType, Mesh, Object3D, PlaneGeometry, Raycaster, RGBAFormat, ShaderMaterial, Vector2, Vector3, WebGLRenderer, WebGLRenderTarget } from 'three';
import { FullScreenQuad } from "../Addons.js";
import { AdvectVelocityShader, ClearShader, CurlShader, DivergenceShader, GradientSubtractShader, PressureShader, SplatShader, VorticityShader } from '../shaders/FluidSimulationShaders.js';

function mix(...configs) {
  return configs.reduce((acc, curr) => ({
    ...acc,
    ...curr,
    uniforms: { ...acc.uniforms, ...curr.uniforms },
  }), {});
}

export class FluidSimulator extends Mesh {

    get splatForce() {
        return this.splat.uniforms.splatForce.value;
    }
    set splatForce(v) {
        this.splat.uniforms.splatForce.value = v;
    }

    get splatThickness() { return this.splat.uniforms.thickness.value }
    set splatThickness(v) { this.splat.uniforms.thickness.value = v }
    get vorticityInfluence() { return this.curl.uniforms.vorticityInfluence.value }
    set vorticityInfluence(v) { this.curl.uniforms.vorticityInfluence.value = v }

    get swirlIntensity() { return this.vorticity.uniforms.curl.value }
    set swirlIntensity(v) { this.vorticity.uniforms.curl.value = v }

    get pressure() { return this.clearShader.uniforms.value.value }
    set pressure(v) { this.clearShader.uniforms.value.value = v }


    /**
     * The texture representin the liquid. To be used as displacementMap
     */
    get elevationTexture() {
        return this.dyeRT.texture;
    } 

    /**
     * 
     * @param {WebGLRenderer} renderer 
     * @param {Number} width 
     * @param {Number} height 
     * @param {Number} resolution 
     * @param {Number} maxTrackedObjects 
     */
    constructor(renderer, width, height, resolution = 100, maxTrackedObjects = 1) {

        const aspect = height / width;
        const planeGeo = new PlaneGeometry(1, aspect, resolution, Math.round(resolution * aspect));
        planeGeo.rotateX(-Math.PI / 2);

        super(planeGeo);

        this.velocityDissipation = 0.283;
        this.densityDissipation = 0.138;
        this.pressureIterations = 39;
        
        /**
         * @private
         */
        this.t = 0;

        /**
         * @private
         */
        this.tmp = new Vector3();

        /**
         * @private
         */
        this.tmp2 = new Vector3();

        /**
         * @private
         */
        this.currentRT = new WebGLRenderTarget(width, height, { type: FloatType });
        
        /**
         * @private
         */
        this.nextRT = new WebGLRenderTarget(width, height, { type: FloatType });

        /**
         * @private
         */
        this.dyeRT = new WebGLRenderTarget(width, height, { type: FloatType });
        
        /**
         * @private
         */
        this.nextDyeRT = new WebGLRenderTarget(width, height, { type: FloatType });

        // 4 components per object: current.x, current.y, prev.x, prev.y
        /**
         * @private
         */
        this.objectDataArray = new Float32Array(maxTrackedObjects * 4);

        // 3. Create the DataTexture
        /**
         * @private
         */
        this.objectDataTexture = new DataTexture(
            this.objectDataArray,
            maxTrackedObjects,  // width
            1,                  // height
            RGBAFormat,
            FloatType
        );

        /**
         * @type { {target?:Object3D, index:number}[] } 
         * @private
         */
        this.tracking = new Array(maxTrackedObjects).fill(0).map((_, index) => ({ target: undefined, index }));
        
        /**
         * @private
         */
        this.quad = new FullScreenQuad();
        
        /**
         * @private
         */
        this.raycaster = new Raycaster();
        
        /**
         * @private
         */
        this.renderer = renderer;

        const texel = {
            uniforms: {
                texelSize: {
                    value: new Vector2(1 / width, 1 / height)
                }
            }
        };

        const gl = renderer.getContext();

        /**
         * @private
         */
        this.supportLinearFiltering = !!gl.getExtension('OES_texture_half_float_linear');

        // ----- shaders used to simulate the liquid -----

        /**
         * @private
         */
        this.splat = new ShaderMaterial(mix(SplatShader, texel)); //new SplatShader( texel, objectCount, aspect );
 

        /**
         * @private
         */
        this.curl = new ShaderMaterial(mix(CurlShader, texel));

        /**
         * @private
         */
        this.vorticity = new ShaderMaterial(mix(VorticityShader, texel));

        /**
         * @private
         */
        this.divergenceShader = new ShaderMaterial(mix(DivergenceShader, texel));

        /**
         * @private
         */
        this.clearShader = new ShaderMaterial(mix(ClearShader, texel));

        /**
         * @private
         */
        this.pressureShader = new ShaderMaterial(mix(PressureShader, texel));

        /**
         * @private
         */
        this.gradientShader = new ShaderMaterial(mix(GradientSubtractShader, texel ));

        /**
         * @private
         */
        this.advectionShader = new ShaderMaterial(mix(AdvectVelocityShader, texel, { uniforms: { dyeTexelSize: texel.uniforms.texelSize } }, { defines: { MANUAL_FILTERING: this.supportLinearFiltering } } ));
    }

    /**
     * 
     * @param {Object3D} obj 
     */
    track( object )
    {
        const freeSlot = this.tracking.find( slot=>!slot.target );
        if( !freeSlot )
        {
            throw new Error(`No room for tracking, all slots taken!`);
        }

        // hacer un raycast desde la posision del objeto hacia abajo
        // averiguar el UV donde nos pega
        // setear ese valor como nuestra posision

        freeSlot.target = object; 
    }

    /** 
     * @param {Object3D} object 
     */
    untrack( object )
    {
        this.tracking.forEach( t=> {

            if( t.target==object )
            {
                t.target = undefined;
            }

        });
    }

    /**
     * Update the positions... we use the UVs as the positions. We cast a ray from the objects to the surface simulating the liquid
     * and calculate the UV that is below the object.
     * @private
     * @param {Object3D} mesh 
     */
    updatePositions( mesh ) {
       // update objects positions....
        this.tracking.forEach( obj => {

            const i = obj.index;

            if( !obj.target ) {

                this.objectDataArray[i * 4 + 0] = 0;
                this.objectDataArray[i * 4 + 1] = 0; 
                this.objectDataArray[i * 4 + 2] = 0; 
                this.objectDataArray[i * 4 + 3] = 0; 
                return;
            };

             
            this.tmp.set(0,1,0); //<--- assuming the origin ob the objects is at the bottom of the models.
            const wpos = obj.target.localToWorld( this.tmp );

            this.tmp2.copy( wpos );

            const rpos = mesh.worldToLocal( this.tmp2 );
                rpos.y = 0; // this will put the position at the surface of the mesh

                mesh.localToWorld( rpos ); // this way we point at the surface of the mesh.
 

            this.raycaster.set( wpos, rpos.sub(wpos).normalize() );

            const hit = this.raycaster.intersectObject( mesh, true);

            if( hit.length )
            {
                const uv = hit[0].uv; // <--- UV under the object
                
                if( uv )
                { 
                    // old positions...
                    this.objectDataArray[i * 4 + 2] = this.objectDataArray[i * 4 + 0];
                    this.objectDataArray[i * 4 + 3] = this.objectDataArray[i * 4 + 1]; 

                    // new positions...
                    this.objectDataArray[i * 4 + 0] = uv.x;
                    this.objectDataArray[i * 4 + 1] = uv.y;  
                }
                
            }

        });

        this.objectDataTexture.needsUpdate = true;
    }

    /**
     * Renders the material into the next render texture and then swaps them so the new currentRT is the one that was generated by the material.
     * @private
     * @param {ShaderMaterial} material 
     */
    blit( material )
    {
        this.renderer.setRenderTarget( this.nextRT );
        this.quad.material = material;
        this.quad.render(this.renderer);

        //swap
        [this.currentRT, this.nextRT] = [this.nextRT, this.currentRT];
    }

    /**
     * @private
     * @param {ShaderMaterial} material 
     */
    blitDye( material ) {
        this.renderer.setRenderTarget( this.nextDyeRT );
        this.quad.material = material;
        this.quad.render(this.renderer);

        //swap
        [this.dyeRT, this.nextDyeRT] = [this.nextDyeRT, this.dyeRT];
    }

    /** 
     * @private
     * @param {number} delta  
     */
    update( delta )
    {
        this.t += delta;

        this.updatePositions( this );

        // 1. add new velocities based on objects movement
        this.splat.uniforms.objectData.value = this.objectDataTexture;
        this.splat.uniforms.uTarget.value = this.currentRT.texture; 
        this.splat.uniforms.splatVelocity.value = true; 

        this.blit( this.splat );  

        // add colors
        this.splat.uniforms.objectData.value = this.objectDataTexture;
        this.splat.uniforms.uTarget.value = this.dyeRT.texture; 
        this.splat.uniforms.splatVelocity.value = false; 

        this.blitDye( this.splat );   

        // 2. vorticity : will be put into the alpha channel...
        this.curl.uniforms.uVelocity.value = this.currentRT.texture;
        this.blit( this.curl );  

        // 3. apply vorticity forces
        this.vorticity.uniforms.uVelocityAndCurl.value = this.currentRT.texture;
        this.vorticity.uniforms.dt.value = delta;
        this.blit( this.vorticity );  

        // 4. divergence
        this.divergenceShader.uniforms.uVelocity.value = this.currentRT.texture;
        this.blit( this.divergenceShader );

        // 5. clear pressure
        this.clearShader.uniforms.uTexture.value = this.currentRT.texture;
        this.blit( this.clearShader );

        // 6. calculates and updates pressure  

        for (let i = 0; i < this.pressureIterations; i++) {
            this.pressureShader.uniforms.uPressureWithDivergence.value = this.currentRT.texture;
            this.blit( this.pressureShader );
        } 

        // 7. Gradient
        this.gradientShader.uniforms.uPressureWithVelocity.value = this.currentRT.texture;
        this.blit( this.gradientShader );

        // 8. Advect velocity
        this.advectionShader.uniforms.dt.value = delta;

        this.advectionShader.uniforms.uVelocity.value = this.currentRT.texture; 
        this.advectionShader.uniforms.uSource.value = this.currentRT.texture; 
        this.advectionShader.uniforms.sourceIsVelocity.value = true; 
        this.advectionShader.uniforms.dissipation.value = this.velocityDissipation; //VELOCITY_DISSIPATION
        this.blit( this.advectionShader );
 
        // 8. Advect dye / color
        this.advectionShader.uniforms.uVelocity.value = this.currentRT.texture; 
        this.advectionShader.uniforms.uSource.value = this.dyeRT.texture; 
        this.advectionShader.uniforms.sourceIsVelocity.value = false; 
        this.advectionShader.uniforms.dissipation.value = this.densityDissipation; //DENSITY_DISSIPATION 
        this.blitDye( this.advectionShader );

        

        this.renderer.setRenderTarget(null);
        //this.map = this.dyeRT.texture; 
        //this.displacementMap = this.dyeRT.texture; 
    }

    fixMaterial( material )
    {
        material.onBeforeCompile = shader => {
            // Pass UV and world position to fragment shader
            shader.vertexShader = shader.vertexShader
                .replace(
                '#include <common>',
                `#include <common>
                varying vec2 vUv;
                varying vec3 vWorldPos;`
                )
                .replace(
                '#include <uv_vertex>',
                `#include <uv_vertex>
                vUv = uv;`
                )
                .replace(
                '#include <project_vertex>',
                `#include <project_vertex>
                vWorldPos = position; // (modelMatrix * vec4(position, 1.0)).xyz;`
                );

            // Displace in fragment and recompute normals from that
            shader.fragmentShader = shader.fragmentShader
                .replace(
                '#include <common>',
                `#include <common>
                uniform sampler2D displacementMap;
                uniform float displacementScale;
                uniform mat3 normalMatrix;
                varying vec2 vUv;
                varying vec3 vWorldPos;`
                )
                .replace(
                '#include <normal_fragment_begin>',
                `
                    float d = texture2D(displacementMap, vUv).r- 0.5;
                    vec3 displacedWorld = vWorldPos + vec3(0.0, d * displacementScale, 0.0);

                    vec3 dx = dFdx(displacedWorld);
                    vec3 dy = dFdy(displacedWorld);
                    vec3 displacedNormal = normalize(cross(dx, dy));

                    vec3 normalView = normalize(normalMatrix * displacedNormal);
                    vec3 normal = normalView;
                    vec3 nonPerturbedNormal = normalView;
                `
                ); 
        }
    }
}

 