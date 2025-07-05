import { Color } from 'three';

// Based on (c) 2017 Pavel Dobryakov : WebGL shader code (https://github.com/PavelDoGreat/WebGL-Fluid-Simulation/tree/master)

/**
 * R - Pressure
 * G - X dir
 * B - Y dir
 * A - wildcard, used to pass values from shader to shader. Not persisted.
 */

const vertexShader = `
                varying vec2 vUv;
                varying vec2 vL;
                varying vec2 vR;
                varying vec2 vT;
                varying vec2 vB;
                uniform vec2 texelSize;

                void main() {
                    vUv = uv;
                    
                    vL = uv - vec2(texelSize.x, 0.0);
                    vR = uv + vec2(texelSize.x, 0.0);
                    vT = uv + vec2(0.0, texelSize.y);
                    vB = uv - vec2(0.0, texelSize.y);

                    gl_Position = vec4(position, 1.0);
                }
            `;

/**
 * Introduces either velocity or color into target. Depending on `splatVelocity` flag.
 */
export const SplatShader = {
	uniforms: {
		uTarget: { value: null },
		splatVelocity: { value: false },
		color: { value: new Color( 0xffffff ) },
		texelSize: { value: null },
		objectData: { value: null }, // Contains current and previous object positions
		count: { value: 1 },
		thickness: { value: 0.035223 }, // in UV units
		aspectRatio: { value: 1 }, // in UV units
		splatForce: { value: - 196 }
	},

	vertexShader,
	fragmentShader: `
                precision mediump float;
                precision mediump sampler2D;

                varying highp vec2 vUv; 
                uniform sampler2D uTarget;
                uniform sampler2D objectData; 
                uniform int count; 
                uniform float thickness; //TODO: this shold be individual per object to allow diferent types of bodies affecting the liquid
                uniform float aspectRatio;
                uniform highp vec2 texelSize;
                uniform bool splatVelocity;
                uniform vec3 color;
                uniform float splatForce;

                void main () { 

                    vec4 pixel = texture2D(uTarget, vUv);  

                    // Add External Forces (from objects)
                    // IMPROVEMENT: This loop is much more efficient as it reads from a texture.
                    for (int i = 0; i < count; i++) {
                        // Read object data from the texture.
                        // texelFetch is used for direct, un-interpolated pixel reads.
                        vec4 data = texelFetch(objectData, ivec2(i, 0), 0);
                        vec2 curr = data.xy; // Current position in .xy
                        vec2 prev = data.zw; // Previous position in .zw

                        vec2 diff = curr - prev;
                        if (length(diff) == 0.0) continue; // Skip if the object hasn't moved 

                        vec2 toFrag = vUv - prev;
                        float t = clamp(dot(toFrag, diff) / dot(diff, diff), 0.0, 1.0);
                        vec2 proj = prev + t * diff;

                        vec2 aspect = vec2(aspectRatio, 1.0);

                        // Calculate distance in a way that respects the screen's aspect ratio
                        float d = distance(vUv * aspect, proj * aspect);

                        if (d < thickness) {
                            // IMPROVEMENT: Correct influence logic.
                            // Influence is strongest when distance 'd' is 0.
                            float influence = smoothstep(thickness, 0.0, d);

                            if( splatVelocity )
                            {

                                vec2 vel = normalize( ( diff )/texelSize ) * -splatForce;
                                

                                //vel = mix( pixel.gb, vel, influence );

                                pixel.g = vel.x;
                                pixel.b = vel.y;
                            }
                            else 
                            {
                                pixel = mix( pixel, vec4( color, 1.0 ), influence );
                            }
 
                        }
                    } 

                    gl_FragColor = pixel;
                }
            `
};

/**
 * sets vorticity inthe alpha channel of uVelocity image
 */
export const CurlShader = {
	uniforms: {
		uVelocity: { value: null },
		texelSize: { value: null },
		vorticityInfluence: { value: 1 }
	},
	vertexShader,
	fragmentShader: `
                precision mediump float;
                precision mediump sampler2D;

                varying highp vec2 vUv;
                varying highp vec2 vL;
                varying highp vec2 vR;
                varying highp vec2 vT;
                varying highp vec2 vB;
                uniform sampler2D uVelocity;
                uniform float vorticityInfluence;

                void main () {
                    float L = texture2D(uVelocity, vL).b;
                    float R = texture2D(uVelocity, vR).b;
                    float T = texture2D(uVelocity, vT).g;
                    float B = texture2D(uVelocity, vB).g;
                    float vorticity = R - L - T + B;

                    vec4 pixel = texture2D(uVelocity, vUv);

                    pixel.a = vorticityInfluence * vorticity; // set in the 4th component...

                    gl_FragColor = pixel;
                }
            `
};

/**
 * updates the velocity image
 */
export const VorticityShader = {
	uniforms: {
		uVelocityAndCurl: { value: null },
		texelSize: { value: null },
		curl: { value: 1 },
		dt: { value: 0 },
	},
	vertexShader,
	fragmentShader: `
                precision highp float;
                precision highp sampler2D;

                varying vec2 vUv;
                varying vec2 vL;
                varying vec2 vR;
                varying vec2 vT;
                varying vec2 vB;
                uniform sampler2D uVelocityAndCurl; 
                uniform float curl;
                uniform float dt;

                void main () {
                    float L = texture2D(uVelocityAndCurl, vL).a;
                    float R = texture2D(uVelocityAndCurl, vR).a;
                    float T = texture2D(uVelocityAndCurl, vT).a;
                    float B = texture2D(uVelocityAndCurl, vB).a;
                    float C = texture2D(uVelocityAndCurl, vUv).a;

                    vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
                    force /= length(force) + 0.0001;
                    force *= curl * C;
                    force.y *= -1.0;

                    vec4 pixel = texture2D(uVelocityAndCurl, vUv);

                    vec2 velocity = pixel.gb;
                    velocity += force * dt;
                    velocity = min(max(velocity, -1000.0), 1000.0);  

                    gl_FragColor = vec4( pixel.r, velocity, 0.0 ); 
                }
            `
};

/**
 * Adds divergence in the alpha channel of the velocity image
 */
export const DivergenceShader = {
	uniforms: {
		uVelocity: { value: null },
		texelSize: { value: null },
	},
	vertexShader,
	fragmentShader: `
                precision mediump float;
                precision mediump sampler2D;

                varying highp vec2 vUv;
                varying highp vec2 vL;
                varying highp vec2 vR;
                varying highp vec2 vT;
                varying highp vec2 vB;
                uniform sampler2D uVelocity;

                void main () {
                    float L = texture2D(uVelocity, vL).g;
                    float R = texture2D(uVelocity, vR).g;
                    float T = texture2D(uVelocity, vT).b;
                    float B = texture2D(uVelocity, vB).b;

                    vec4 pixel = texture2D(uVelocity, vUv);

                    vec2 C = pixel.gb;
                    if (vL.x < 0.0) { L = -C.x; }
                    if (vR.x > 1.0) { R = -C.x; }
                    if (vT.y > 1.0) { T = -C.y; }
                    if (vB.y < 0.0) { B = -C.y; }

                    float div = 0.5 * (R - L + T - B);

                    gl_FragColor = vec4( pixel.r, C, div );
                }
            `
};

/**
 *  Multiplies the pressure by `value` uniform
 */
export const ClearShader = {
	uniforms: {
		uTexture: { value: null },
		value: { value: 0.317 }, //PRESSURE
		texelSize: { value: null },
	},
	vertexShader,
	fragmentShader: `
                precision mediump float;
                precision mediump sampler2D;

                varying highp vec2 vUv;
                uniform sampler2D uTexture;
                uniform float value;

                void main () {
                    vec4 pixel = texture2D(uTexture, vUv);

                    pixel.r *= value;

                    gl_FragColor = pixel ;
                }
            `
};

/**
 * updates the pressure of the image
 */
export const PressureShader = {
	uniforms: {
		uPressureWithDivergence: { value: null },
		texelSize: { value: null },
	},
	vertexShader,
	fragmentShader: `
                precision mediump float;
                precision mediump sampler2D;

                varying highp vec2 vUv;
                varying highp vec2 vL;
                varying highp vec2 vR;
                varying highp vec2 vT;
                varying highp vec2 vB;
                uniform sampler2D uPressureWithDivergence; 

                void main () {
                    float L = texture2D(uPressureWithDivergence, vL).x;
                    float R = texture2D(uPressureWithDivergence, vR).x;
                    float T = texture2D(uPressureWithDivergence, vT).x;
                    float B = texture2D(uPressureWithDivergence, vB).x;
                    float C = texture2D(uPressureWithDivergence, vUv).x;

                    vec4 pixel = texture2D(uPressureWithDivergence, vUv);
                    float divergence = pixel.a;
                    float pressure = (L + R + B + T - divergence) * 0.25;

                    pixel.x = pressure;

                    gl_FragColor = pixel;  
                }
            `
};


export const GradientSubtractShader = {
	uniforms: {
		uPressureWithVelocity: { value: null },
		texelSize: { value: null },
	},
	vertexShader,
	fragmentShader: `
                precision mediump float;
                precision mediump sampler2D;

                varying highp vec2 vUv;
                varying highp vec2 vL;
                varying highp vec2 vR;
                varying highp vec2 vT;
                varying highp vec2 vB;
                uniform sampler2D uPressureWithVelocity; 

                void main () {
                    float L = texture2D(uPressureWithVelocity, vL).x;
                    float R = texture2D(uPressureWithVelocity, vR).x;
                    float T = texture2D(uPressureWithVelocity, vT).x;
                    float B = texture2D(uPressureWithVelocity, vB).x;

                    vec4 pixel = texture2D(uPressureWithVelocity, vUv);

                    vec2 velocity = pixel.gb;
                    velocity.xy -= vec2(R - L, T - B);

                    gl_FragColor = vec4( pixel.r, velocity, 0.0 );
                }
            `
};


export const AdvectVelocityShader = {
	uniforms: {
		uVelocity: { value: null },
		uSource: { value: null },
		sourceIsVelocity: { value: null },
		texelSize: { value: null },
		dt: { value: 0 },
		dyeTexelSize: { value: null },
		dissipation: { value: 0.2 },
	},
	defines: {
		MANUAL_FILTERING: false
	},
	vertexShader,
	fragmentShader: `
                precision highp float;
                precision highp sampler2D;

                varying vec2 vUv;
                uniform sampler2D uVelocity; 
                uniform sampler2D uSource; 
                uniform vec2 texelSize;
                uniform vec2 dyeTexelSize;
                uniform float dt;
                uniform float dissipation;
                uniform bool sourceIsVelocity;

                vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
                    vec2 st = uv / tsize - 0.5;

                    vec2 iuv = floor(st);
                    vec2 fuv = fract(st);

                    vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
                    vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
                    vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
                    vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);

                    return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
                }

                void main () {

                    #ifdef MANUAL_FILTERING
                        vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).gb * texelSize;
                        vec4 result = bilerp(uSource, coord, dyeTexelSize);
                    #else
                        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).gb * texelSize;
                        vec4 result = texture2D(uSource, coord);
                    #endif
                        float decay = 1.0 + dissipation * dt;
                        result /= decay;

                        if( sourceIsVelocity )
                        {
                            vec4 data = texture2D(uVelocity, vUv);
                            gl_FragColor = vec4( data.r, result.g, result.b, data.a);
                        }
                        else 
                        {
                            gl_FragColor = result;
                        }
                }
            `
};
