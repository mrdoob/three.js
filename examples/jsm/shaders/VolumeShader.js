import {
	Vector2,
	Vector3
} from "../../../build/three.module.js";

/**
 * Shaders to render 3D volumes using raycasting.
 * The applied techniques are based on similar implementations in the Visvis and Vispy projects.
 * This is not the only approach, therefore it's marked 1.
 */

var VolumeRenderShader1 = {
	uniforms: {
		"u_size": { value: new Vector3( 1, 1, 1 ) },
		"u_renderstyle": { value: 0 },
		"u_renderthreshold": { value: 0.5 },
		"u_clim": { value: new Vector2( 1, 1 ) },
		"u_data": { value: null },
		"u_cmdata": { value: null }
	},
	vertexShader: [
		"		varying vec4 v_nearpos;",
		"		varying vec4 v_farpos;",
		"		varying vec3 v_position;",

		"		void main() {",
		// Prepare transforms to map to "camera view". See also:
		// https://threejs.org/docs/#api/renderers/webgl/WebGLProgram
		"				mat4 viewtransformf = modelViewMatrix;",
		"				mat4 viewtransformi = inverse(modelViewMatrix);",

		// Project local vertex coordinate to camera position. Then do a step
		// backward (in cam coords) to the near clipping plane, and project back. Do
		// the same for the far clipping plane. This gives us all the information we
		// need to calculate the ray and truncate it to the viewing cone.
		"				vec4 position4 = vec4(position, 1.0);",
		"				vec4 pos_in_cam = viewtransformf * position4;",

		// Intersection of ray and near clipping plane (z = -1 in clip coords)
		"				pos_in_cam.z = -pos_in_cam.w;",
		"				v_nearpos = viewtransformi * pos_in_cam;",

		// Intersection of ray and far clipping plane (z = +1 in clip coords)
		"				pos_in_cam.z = pos_in_cam.w;",
		"				v_farpos = viewtransformi * pos_in_cam;",

		// Set varyings and output pos
		"				v_position = position;",
		"				gl_Position = projectionMatrix * viewMatrix * modelMatrix * position4;",
		"		}",
	].join( "\n" ),
	fragmentShader: [
		"		precision highp float;",
		"		precision mediump sampler3D;",

		"		uniform vec3 u_size;",
		"		uniform int u_renderstyle;",
		"		uniform float u_renderthreshold;",
		"		uniform vec2 u_clim;",

		"		uniform sampler3D u_data;",
		"		uniform sampler2D u_cmdata;",

		"		varying vec3 v_position;",
		"		varying vec4 v_nearpos;",
		"		varying vec4 v_farpos;",

		// The maximum distance through our rendering volume is sqrt(3).
		"		const int MAX_STEPS = 887;	// 887 for 512^3, 1774 for 1024^3",
		"		const int REFINEMENT_STEPS = 4;",
		"		const float relative_step_size = 1.0;",
		"		const vec4 ambient_color = vec4(0.2, 0.4, 0.2, 1.0);",
		"		const vec4 diffuse_color = vec4(0.8, 0.2, 0.2, 1.0);",
		"		const vec4 specular_color = vec4(1.0, 1.0, 1.0, 1.0);",
		"		const float shininess = 40.0;",

		"		void cast_mip(vec3 start_loc, vec3 step, int nsteps, vec3 view_ray);",
		"		void cast_iso(vec3 start_loc, vec3 step, int nsteps, vec3 view_ray);",

		"		float sample1(vec3 texcoords);",
		"		vec4 apply_colormap(float val);",
		"		vec4 add_lighting(float val, vec3 loc, vec3 step, vec3 view_ray);",


		"		void main() {",
		// Normalize clipping plane info
		"				vec3 farpos = v_farpos.xyz / v_farpos.w;",
		"				vec3 nearpos = v_nearpos.xyz / v_nearpos.w;",

		// Calculate unit vector pointing in the view direction through this fragment.
		"				vec3 view_ray = normalize(nearpos.xyz - farpos.xyz);",

		// Compute the (negative) distance to the front surface or near clipping plane.
		// v_position is the back face of the cuboid, so the initial distance calculated in the dot
		// product below is the distance from near clip plane to the back of the cuboid
		"				float distance = dot(nearpos - v_position, view_ray);",
		"				distance = max(distance, min((-0.5 - v_position.x) / view_ray.x,",
		"																		(u_size.x - 0.5 - v_position.x) / view_ray.x));",
		"				distance = max(distance, min((-0.5 - v_position.y) / view_ray.y,",
		"																		(u_size.y - 0.5 - v_position.y) / view_ray.y));",
		"				distance = max(distance, min((-0.5 - v_position.z) / view_ray.z,",
		"																		(u_size.z - 0.5 - v_position.z) / view_ray.z));",

		// Now we have the starting position on the front surface
		"				vec3 front = v_position + view_ray * distance;",

		// Decide how many steps to take
		"				int nsteps = int(-distance / relative_step_size + 0.5);",
		"				if ( nsteps < 1 )",
		"						discard;",

		// Get starting location and step vector in texture coordinates
		"				vec3 step = ((v_position - front) / u_size) / float(nsteps);",
		"				vec3 start_loc = front / u_size;",

		// For testing: show the number of steps. This helps to establish
		// whether the rays are correctly oriented
		//'gl_FragColor = vec4(0.0, float(nsteps) / 1.0 / u_size.x, 1.0, 1.0);',
		//'return;',

		"				if (u_renderstyle == 0)",
		"						cast_mip(start_loc, step, nsteps, view_ray);",
		"				else if (u_renderstyle == 1)",
		"						cast_iso(start_loc, step, nsteps, view_ray);",

		"				if (gl_FragColor.a < 0.05)",
		"						discard;",
		"		}",


		"		float sample1(vec3 texcoords) {",
		"				/* Sample float value from a 3D texture. Assumes intensity data. */",
		"				return texture(u_data, texcoords.xyz).r;",
		"		}",


		"		vec4 apply_colormap(float val) {",
		"				val = (val - u_clim[0]) / (u_clim[1] - u_clim[0]);",
		"				return texture2D(u_cmdata, vec2(val, 0.5));",
		"		}",


		"		void cast_mip(vec3 start_loc, vec3 step, int nsteps, vec3 view_ray) {",

		"				float max_val = -1e6;",
		"				int max_i = 100;",
		"				vec3 loc = start_loc;",

		// Enter the raycasting loop. In WebGL 1 the loop index cannot be compared with
		// non-constant expression. So we use a hard-coded max, and an additional condition
		// inside the loop.
		"				for (int iter=0; iter<MAX_STEPS; iter++) {",
		"						if (iter >= nsteps)",
		"								break;",
		// Sample from the 3D texture
		"						float val = sample1(loc);",
		// Apply MIP operation
		"						if (val > max_val) {",
		"								max_val = val;",
		"								max_i = iter;",
		"						}",
		// Advance location deeper into the volume
		"						loc += step;",
		"				}",

		// Refine location, gives crispier images
		"				vec3 iloc = start_loc + step * (float(max_i) - 0.5);",
		"				vec3 istep = step / float(REFINEMENT_STEPS);",
		"				for (int i=0; i<REFINEMENT_STEPS; i++) {",
		"						max_val = max(max_val, sample1(iloc));",
		"						iloc += istep;",
		"				}",

		// Resolve final color
		"				gl_FragColor = apply_colormap(max_val);",
		"		}",


		"		void cast_iso(vec3 start_loc, vec3 step, int nsteps, vec3 view_ray) {",

		"				gl_FragColor = vec4(0.0);	// init transparent",
		"				vec4 color3 = vec4(0.0);	// final color",
		"				vec3 dstep = 1.5 / u_size;	// step to sample derivative",
		"				vec3 loc = start_loc;",

		"				float low_threshold = u_renderthreshold - 0.02 * (u_clim[1] - u_clim[0]);",

		// Enter the raycasting loop. In WebGL 1 the loop index cannot be compared with
		// non-constant expression. So we use a hard-coded max, and an additional condition
		// inside the loop.
		"				for (int iter=0; iter<MAX_STEPS; iter++) {",
		"						if (iter >= nsteps)",
		"								break;",

		// Sample from the 3D texture
		"						float val = sample1(loc);",

		"						if (val > low_threshold) {",
		// Take the last interval in smaller steps
		"								vec3 iloc = loc - 0.5 * step;",
		"								vec3 istep = step / float(REFINEMENT_STEPS);",
		"								for (int i=0; i<REFINEMENT_STEPS; i++) {",
		"										val = sample1(iloc);",
		"										if (val > u_renderthreshold) {",
		"												gl_FragColor = add_lighting(val, iloc, dstep, view_ray);",
		"												return;",
		"										}",
		"										iloc += istep;",
		"								}",
		"						}",

		// Advance location deeper into the volume
		"						loc += step;",
		"				}",
		"		}",


		"		vec4 add_lighting(float val, vec3 loc, vec3 step, vec3 view_ray)",
		"		{",
		// Calculate color by incorporating lighting

		// View direction
		"				vec3 V = normalize(view_ray);",

		// calculate normal vector from gradient
		"				vec3 N;",
		"				float val1, val2;",
		"				val1 = sample1(loc + vec3(-step[0], 0.0, 0.0));",
		"				val2 = sample1(loc + vec3(+step[0], 0.0, 0.0));",
		"				N[0] = val1 - val2;",
		"				val = max(max(val1, val2), val);",
		"				val1 = sample1(loc + vec3(0.0, -step[1], 0.0));",
		"				val2 = sample1(loc + vec3(0.0, +step[1], 0.0));",
		"				N[1] = val1 - val2;",
		"				val = max(max(val1, val2), val);",
		"				val1 = sample1(loc + vec3(0.0, 0.0, -step[2]));",
		"				val2 = sample1(loc + vec3(0.0, 0.0, +step[2]));",
		"				N[2] = val1 - val2;",
		"				val = max(max(val1, val2), val);",

		"				float gm = length(N); // gradient magnitude",
		"				N = normalize(N);",

		// Flip normal so it points towards viewer
		"				float Nselect = float(dot(N, V) > 0.0);",
		"				N = (2.0 * Nselect - 1.0) * N;	// ==	Nselect * N - (1.0-Nselect)*N;",

		// Init colors
		"				vec4 ambient_color = vec4(0.0, 0.0, 0.0, 0.0);",
		"				vec4 diffuse_color = vec4(0.0, 0.0, 0.0, 0.0);",
		"				vec4 specular_color = vec4(0.0, 0.0, 0.0, 0.0);",

		// note: could allow multiple lights
		"				for (int i=0; i<1; i++)",
		"				{",
								 // Get light direction (make sure to prevent zero devision)
		"						vec3 L = normalize(view_ray);	//lightDirs[i];",
		"						float lightEnabled = float( length(L) > 0.0 );",
		"						L = normalize(L + (1.0 - lightEnabled));",

		// Calculate lighting properties
		"						float lambertTerm = clamp(dot(N, L), 0.0, 1.0);",
		"						vec3 H = normalize(L+V); // Halfway vector",
		"						float specularTerm = pow(max(dot(H, N), 0.0), shininess);",

		// Calculate mask
		"						float mask1 = lightEnabled;",

		// Calculate colors
		"						ambient_color +=	mask1 * ambient_color;	// * gl_LightSource[i].ambient;",
		"						diffuse_color +=	mask1 * lambertTerm;",
		"						specular_color += mask1 * specularTerm * specular_color;",
		"				}",

		// Calculate final color by componing different components
		"				vec4 final_color;",
		"				vec4 color = apply_colormap(val);",
		"				final_color = color * (ambient_color + diffuse_color) + specular_color;",
		"				final_color.a = color.a;",
		"				return final_color;",
		"		}",
	].join( "\n" )
};

export { VolumeRenderShader1 };
