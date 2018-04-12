/**
 * @author meatbags / xavierburrow.com, github/meatbags
 *
 * Colour halftone shader
 * Shape uniform (1 = circle, 2 = euclidean dot, 3 = ellipse, 4 = line, 5 = square)
 * Blending mode (1 = linear, 2 = add, 3 = multiply, 4 = lighter colour, 5 = darker colour)
 */

THREE.HalftoneShader = {
	uniforms: {
		"shape": {value: 1},
		"tDiffuse": {value: null},
		"radius": {value: 5},
		"rC": {value: Math.PI * 0.25},
		"rM": {value: Math.PI * 0.33},
		"rY": {value: Math.PI * 0.66},
		"width": {value: 1},
		"height": {value: 1},
		"blending": {value: 0},
		"blendingMode": {value: 1},
		"greyscale": {value: false},
		"disable": {value: false}
	},
	vertexShader: `
    varying vec2 vUV;

    void main() {
      vUV = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
	fragmentShader: `
		#define SQRT2 1.41421356
		#define SQRT2_HALF 0.70710678
		#define SQRT2_MINUS_ONE 0.41421356
		#define SQRT2_HALF_MINUS_ONE 0.20710678

		uniform sampler2D tDiffuse;
		uniform float radius;
		uniform float rC;
		uniform float rM;
		uniform float rY;
		uniform float width;
		uniform float height;
		uniform int shape;
		uniform bool disable;
		uniform float blending;
		uniform int blendingMode;
		uniform bool greyscale;

		varying vec2 vUV;

		float blend(float a, float b, float t) {
			return a * (1.0 - t) + b * t;
		}

		float blendColour(float a, float b, float t) {
			if (blendingMode == 1) {
				return blend(a, b, t);
			} else if (blendingMode == 2) {
				return blend(a, min(1.0, a + b), t);
			} else if (blendingMode == 3) {
				return blend(a, max(0.0, a * b), t);
			} else if (blendingMode == 4) {
				return blend(a, max(a, b), t);
			} else {
				return blend(a, min(a, b), t);
			}
		}

		float hypot(float x, float y) {
			return sqrt(x * x + y * y);
		}

		float distanceTo(vec2 a, vec2 b) {
			return hypot(b.x - a.x, b.y - a.y);
		}

		float shapeDistance(vec2 p, vec2 coord, vec2 n) {
			float d = distanceTo(p, coord);

			if (shape == 3) {
				// ellipse
				if (d != 0.0) {
					float dp = abs((p.x - coord.x) / d * n.x + (p.y - coord.y) / d * n.y);
					d = (d * (1.0 - SQRT2_HALF_MINUS_ONE)) + dp * d * SQRT2_MINUS_ONE;
				}
			} else if (shape == 4) {
				// line
				float dp = (p.x - coord.x) * n.x + (p.y - coord.y) * n.y;
				d = hypot(n.x * dp, n.y * dp);
			}

			return d;
		}

		float shapeRadius(float r, vec2 p, vec2 coord) {
			float theta = atan(p.y - coord.y, p.x - coord.x);
			float sin_t = abs(sin(theta));
			float cos_t = abs(cos(theta));

			if (shape == 2) {
				// euclidean dot
				float square = r + ((sin_t > cos_t) ? r - sin_t * r : r - cos_t * r);
				if (r <= 0.5) {
					r = blend(r, square, r * 2.0);
				} else {
					float max_r = r + 2.0 * ((sin_t > cos_t) ? r - sin_t * r : r - cos_t * r);
					r = blend(square, max_r, pow(abs((r - 0.5) * 2.0), 0.4));
				}
			} else if (shape == 5) {
				// square
				r += (sin_t > cos_t) ? r - sin_t * r : r - cos_t * r;
			}

			return r;
		}

		vec2 gridReference(vec2 p, vec2 origin, vec2 n, float step, float aspect) {
			// get nearest grid reference (rotated grid)
			float dot_normal = n.x * (p.x - origin.x) + n.y * (p.y - origin.y);
			float dot_line = -n.y * (p.x - origin.x) + n.x * (p.y - origin.y);
			vec2 offset = vec2(n.x * dot_normal, n.y * dot_normal);
			float offset_normal = mod(hypot(offset.x, offset.y), step);
			float normal_scale = ((offset_normal < step * 0.5) ? -offset_normal : step - offset_normal) * ((dot_normal < 0.0) ? 1.0 : -1.0);
			float offset_line = mod(hypot((p.x - offset.x) - origin.x, (p.y - offset.y) - origin.y), step);
			float line_scale = ((offset_line < step * 0.5) ? -offset_line : step - offset_line) * ((dot_line < 0.0) ? 1.0 : -1.0);

			return vec2(
				p.x - n.x * normal_scale + n.y * line_scale,
				p.y - n.y * normal_scale * aspect - n.x * line_scale
			);
		}

		void main() {
			if (!disable) {
				vec2 origin = vec2(0, 0);
				float step = radius / width;
				float radius_max = step;
				float aspect = height / width;
				float aa = (step < 1.0 / width) ? step * 0.5 : 1.0 / width;
				vec2 normC = vec2(cos(rC), sin(rC));
				vec2 normM = vec2(cos(rM), sin(rM));
				vec2 normY = vec2(cos(rY), sin(rY));

				// sampling
				vec2 coordC = gridReference(vUV, origin, normC, step, aspect);
				vec2 coordM = gridReference(vUV, origin, normM, step, aspect);
				vec2 coordY = gridReference(vUV, origin, normY, step, aspect);
				float distC = shapeRadius(texture2D(tDiffuse, coordC).r, vUV, coordC) * radius_max - shapeDistance(vUV, coordC, normC);
				float distM = shapeRadius(texture2D(tDiffuse, coordM).g, vUV, coordM) * radius_max - shapeDistance(vUV, coordM, normM);
				float distY = shapeRadius(texture2D(tDiffuse, coordY).b, vUV, coordY) * radius_max - shapeDistance(vUV, coordY, normY);
				float r = (distC > 0.0) ? clamp(0.0, 1.0, distC / aa) : 0.0;
				float g = (distM > 0.0) ? clamp(0.0, 1.0, distM / aa) : 0.0;
				float b = (distY > 0.0) ? clamp(0.0, 1.0, distY / aa) : 0.0;

				if (blending != 0.0) {
					vec4 colour = texture2D(tDiffuse, vUV);
					r = blendColour(r, colour.r, blending);
					g = blendColour(g, colour.g, blending);
					b = blendColour(b, colour.b, blending);
				}

				if (greyscale) {
					r = (r + b + g) / 3.0;
					g = r;
					b = r;
				}

				// write
				gl_FragColor = vec4(r, g, b, 1.0);
			} else {
				gl_FragColor = texture2D(tDiffuse, vUV);
			}
		}`
};
