export class WebGLLights {

	constructor( gl: WebGLRenderingContext, properties: any, info: any );

	state: {
		version: number;

		hash: {
			directionalLength: number;
			pointLength: number;
			spotLength: number;
			rectAreaLength: number;
			hemiLength: number;

			numDirectionalShadows: number;
			numPointShadows: number;
			numSpotShadows: number;
		};

		ambient: Array<number>;
		probe: Array<any>;
		directional: Array<any>;
		directionalShadow: Array<any>;
		directionalShadowMap: Array<any>;
		directionalShadowMatrix: Array<any>;
		spot: Array<any>;
		spotShadow: Array<any>;
		spotShadowMap: Array<any>;
		spotShadowMatrix: Array<any>;
		rectArea: Array<any>;
		point: Array<any>;
		pointShadow: Array<any>;
		pointShadowMap: Array<any>;
		pointShadowMatrix: Array<any>;
		hemi: Array<any>;
	};

	get( light: any ): any;
	setup( lights: any, shadows: any, camera: any ): void;

}
