import { Color, Vector2, Vector3 } from 'three';

/**
 * ShaderTemplateLibrary - Collection of pre-built shader templates
 * 
 * Provides ready-to-use shader templates for common effects:
 * - Basic: Simple color shader
 * - Phong: Basic lighting
 * - Animated Pattern: Moving patterns
 * - Noise: Procedural noise
 * - Water: Water effect
 * - Toon: Cel shading
 */
class ShaderTemplateLibrary {

	constructor() {

		this.templates = new Map();
		this._initializeTemplates();

	}

	/**
	 * Initializes built-in templates.
	 * @private
	 */
	_initializeTemplates() {

		// Basic template
		this.templates.set( 'basic', {
			name: 'Basic',
			category: 'Basic',
			description: 'Simple colored material',
			vertexShader: `
				varying vec2 vUv;
				varying vec3 vNormal;
				
				void main() {
					vUv = uv;
					vNormal = normalize(normalMatrix * normal);
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				}
			`,
			fragmentShader: `
				uniform vec3 color;
				varying vec2 vUv;
				varying vec3 vNormal;
				
				void main() {
					gl_FragColor = vec4(color, 1.0);
				}
			`,
			uniforms: {
				color: { value: new Color( 0x4488ff ) }
			}
		} );

		// Phong template
		this.templates.set( 'phong', {
			name: 'Phong',
			category: 'Lighting',
			description: 'Basic Phong lighting',
			vertexShader: `
				varying vec2 vUv;
				varying vec3 vNormal;
				varying vec3 vViewPosition;
				
				void main() {
					vUv = uv;
					vNormal = normalize(normalMatrix * normal);
					vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
					vViewPosition = -mvPosition.xyz;
					gl_Position = projectionMatrix * mvPosition;
				}
			`,
			fragmentShader: `
				uniform vec3 diffuseColor;
				uniform vec3 specularColor;
				uniform float shininess;
				uniform vec3 lightDirection;
				
				varying vec2 vUv;
				varying vec3 vNormal;
				varying vec3 vViewPosition;
				
				void main() {
					vec3 normal = normalize(vNormal);
					vec3 lightDir = normalize(lightDirection);
					vec3 viewDir = normalize(vViewPosition);
					
					// Diffuse
					float diff = max(dot(normal, lightDir), 0.0);
					
					// Specular
					vec3 reflectDir = reflect(-lightDir, normal);
					float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
					
					vec3 ambient = diffuseColor * 0.1;
					vec3 diffuse = diffuseColor * diff;
					vec3 specular = specularColor * spec;
					
					gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
				}
			`,
			uniforms: {
				diffuseColor: { value: new Color( 0x4488ff ) },
				specularColor: { value: new Color( 0xffffff ) },
				shininess: { value: 30.0 },
				lightDirection: { value: new Vector3( 1, 1, 1 ).normalize() }
			}
		} );

		// Animated Pattern template
		this.templates.set( 'animated-pattern', {
			name: 'Animated Pattern',
			category: 'Effects',
			description: 'Animated UV-based pattern',
			vertexShader: `
				varying vec2 vUv;
				
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				}
			`,
			fragmentShader: `
				uniform float time;
				uniform vec3 color1;
				uniform vec3 color2;
				uniform float scale;
				
				varying vec2 vUv;
				
				void main() {
					vec2 uv = vUv * scale;
					float pattern = sin(uv.x * 10.0 + time) * sin(uv.y * 10.0 + time);
					pattern = pattern * 0.5 + 0.5;
					vec3 color = mix(color1, color2, pattern);
					gl_FragColor = vec4(color, 1.0);
				}
			`,
			uniforms: {
				time: { value: 0.0 },
				color1: { value: new Color( 0x0000ff ) },
				color2: { value: new Color( 0xff0000 ) },
				scale: { value: 1.0 }
			}
		} );

		// Noise template
		this.templates.set( 'noise', {
			name: 'Noise',
			category: 'Procedural',
			description: 'Procedural noise pattern',
			vertexShader: `
				varying vec2 vUv;
				varying vec3 vPosition;
				
				void main() {
					vUv = uv;
					vPosition = position;
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				}
			`,
			fragmentShader: `
				uniform float time;
				uniform float scale;
				uniform vec3 color1;
				uniform vec3 color2;
				
				varying vec2 vUv;
				varying vec3 vPosition;
				
				// Simple hash function
				float hash(vec2 p) {
					p = fract(p * vec2(123.34, 456.21));
					p += dot(p, p + 45.32);
					return fract(p.x * p.y);
				}
				
				// Value noise
				float noise(vec2 p) {
					vec2 i = floor(p);
					vec2 f = fract(p);
					f = f * f * (3.0 - 2.0 * f);
					
					float a = hash(i);
					float b = hash(i + vec2(1.0, 0.0));
					float c = hash(i + vec2(0.0, 1.0));
					float d = hash(i + vec2(1.0, 1.0));
					
					return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
				}
				
				void main() {
					vec2 uv = vUv * scale + time * 0.1;
					float n = noise(uv * 5.0);
					n += noise(uv * 10.0) * 0.5;
					n += noise(uv * 20.0) * 0.25;
					n = n / 1.75;
					
					vec3 color = mix(color1, color2, n);
					gl_FragColor = vec4(color, 1.0);
				}
			`,
			uniforms: {
				time: { value: 0.0 },
				scale: { value: 1.0 },
				color1: { value: new Color( 0x000033 ) },
				color2: { value: new Color( 0x3366ff ) }
			}
		} );

		// Water template
		this.templates.set( 'water', {
			name: 'Water',
			category: 'Effects',
			description: 'Animated water effect',
			vertexShader: `
				uniform float time;
				uniform float waveHeight;
				
				varying vec2 vUv;
				varying vec3 vNormal;
				varying vec3 vViewPosition;
				
				void main() {
					vUv = uv;
					
					// Wave displacement
					vec3 pos = position;
					float wave1 = sin(pos.x * 2.0 + time) * waveHeight;
					float wave2 = sin(pos.z * 3.0 + time * 1.3) * waveHeight * 0.5;
					pos.y += wave1 + wave2;
					
					// Calculate normal (approximate)
					vec3 normal = normalize(normal + vec3(
						cos(pos.x * 2.0 + time) * waveHeight * 0.5,
						1.0,
						cos(pos.z * 3.0 + time * 1.3) * waveHeight * 0.3
					));
					
					vNormal = normalize(normalMatrix * normal);
					vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
					vViewPosition = -mvPosition.xyz;
					gl_Position = projectionMatrix * mvPosition;
				}
			`,
			fragmentShader: `
				uniform float time;
				uniform vec3 waterColor;
				uniform vec3 foamColor;
				
				varying vec2 vUv;
				varying vec3 vNormal;
				varying vec3 vViewPosition;
				
				void main() {
					vec3 normal = normalize(vNormal);
					vec3 viewDir = normalize(vViewPosition);
					
					// Fresnel
					float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0);
					
					// Foam based on wave peaks
					float foam = smoothstep(0.5, 0.8, sin(vUv.x * 20.0 + time * 2.0) * 0.5 + 0.5);
					
					vec3 color = mix(waterColor, foamColor, foam * 0.3);
					color += fresnel * 0.3;
					
					gl_FragColor = vec4(color, 0.9);
				}
			`,
			uniforms: {
				time: { value: 0.0 },
				waveHeight: { value: 0.1 },
				waterColor: { value: new Color( 0x0066aa ) },
				foamColor: { value: new Color( 0xffffff ) }
			}
		} );

		// Toon template
		this.templates.set( 'toon', {
			name: 'Toon',
			category: 'Stylized',
			description: 'Cel-shaded toon effect',
			vertexShader: `
				varying vec2 vUv;
				varying vec3 vNormal;
				varying vec3 vViewPosition;
				
				void main() {
					vUv = uv;
					vNormal = normalize(normalMatrix * normal);
					vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
					vViewPosition = -mvPosition.xyz;
					gl_Position = projectionMatrix * mvPosition;
				}
			`,
			fragmentShader: `
				uniform vec3 baseColor;
				uniform vec3 shadowColor;
				uniform vec3 highlightColor;
				uniform vec3 lightDirection;
				uniform float levels;
				
				varying vec2 vUv;
				varying vec3 vNormal;
				varying vec3 vViewPosition;
				
				void main() {
					vec3 normal = normalize(vNormal);
					vec3 lightDir = normalize(lightDirection);
					
					// Calculate light intensity
					float intensity = dot(normal, lightDir);
					
					// Quantize to discrete levels
					intensity = floor(intensity * levels) / levels;
					intensity = max(intensity, 0.0);
					
					// Apply colors based on intensity
					vec3 color;
					if (intensity > 0.66) {
						color = highlightColor;
					} else if (intensity > 0.33) {
						color = baseColor;
					} else {
						color = shadowColor;
					}
					
					// Rim light
					vec3 viewDir = normalize(vViewPosition);
					float rim = 1.0 - max(dot(viewDir, normal), 0.0);
					rim = smoothstep(0.6, 1.0, rim);
					color += rim * 0.3;
					
					gl_FragColor = vec4(color, 1.0);
				}
			`,
			uniforms: {
				baseColor: { value: new Color( 0xff6600 ) },
				shadowColor: { value: new Color( 0x662200 ) },
				highlightColor: { value: new Color( 0xffaa44 ) },
				lightDirection: { value: new Vector3( 1, 1, 1 ).normalize() },
				levels: { value: 3.0 }
			}
		} );

	}

	/**
	 * Gets a template by name.
	 * @param {string} name - Template name
	 * @returns {Object|undefined} Template object or undefined
	 */
	getTemplate( name ) {

		return this.templates.get( name );

	}

	/**
	 * Gets all template names.
	 * @returns {Array<string>} Array of template names
	 */
	getAllTemplateNames() {

		return Array.from( this.templates.keys() );

	}

	/**
	 * Gets all templates.
	 * @returns {Array<Object>} Array of template objects
	 */
	getAllTemplates() {

		return Array.from( this.templates.values() );

	}

	/**
	 * Adds a custom template.
	 * @param {string} name - Template name
	 * @param {Object} template - Template definition
	 */
	addTemplate( name, template ) {

		this.templates.set( name, template );

	}

	/**
	 * Removes a template.
	 * @param {string} name - Template name
	 */
	removeTemplate( name ) {

		this.templates.delete( name );

	}

}

export { ShaderTemplateLibrary };

