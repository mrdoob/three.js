// tslint:disable-next-line:interface-name
export interface IUniform<TValue = any> {
    value: TValue;
}

export let UniformsLib: {
    common: {
        diffuse: IUniform;
        opacity: IUniform;
        map: IUniform;
        uvTransform: IUniform;
        uv2Transform: IUniform;
        alphaMap: IUniform;
    };
    specularmap: {
        specularMap: IUniform;
    };
    envmap: {
        envMap: IUniform;
        flipEnvMap: IUniform;
        reflectivity: IUniform;
        refractionRatio: IUniform;
        maxMipLevel: IUniform;
    };
    aomap: {
        aoMap: IUniform;
        aoMapIntensity: IUniform;
    };
    lightmap: {
        lightMap: IUniform;
        lightMapIntensity: IUniform;
    };
    emissivemap: {
        emissiveMap: IUniform;
    };
    bumpmap: {
        bumpMap: IUniform;
        bumpScale: IUniform;
    };
    normalmap: {
        normalMap: IUniform;
        normalScale: IUniform;
    };
    displacementmap: {
        displacementMap: IUniform;
        displacementScale: IUniform;
        displacementBias: IUniform;
    };
    roughnessmap: {
        roughnessMap: IUniform;
    };
    metalnessmap: {
        metalnessMap: IUniform;
    };
    gradientmap: {
        gradientMap: IUniform;
    };
    fog: {
        fogDensity: IUniform;
        fogNear: IUniform;
        fogFar: IUniform;
        fogColor: IUniform;
    };
    lights: {
        ambientLightColor: IUniform;
        directionalLights: {
            value: any[];
            properties: {
                direction: {};
                color: {};
            };
        };
        directionalLightShadows: {
            value: any[];
            properties: {
                shadowBias: {};
                shadowNormalBias: {};
                shadowRadius: {};
                shadowMapSize: {};
            };
        };
        directionalShadowMap: IUniform;
        directionalShadowMatrix: IUniform;
        spotLights: {
            value: any[];
            properties: {
                color: {};
                position: {};
                direction: {};
                distance: {};
                coneCos: {};
                penumbraCos: {};
                decay: {};
            };
        };
        spotLightShadows: {
            value: any[];
            properties: {
                shadowBias: {};
                shadowNormalBias: {};
                shadowRadius: {};
                shadowMapSize: {};
            };
        };
        spotShadowMap: IUniform;
        spotShadowMatrix: IUniform;
        pointLights: {
            value: any[];
            properties: {
                color: {};
                position: {};
                decay: {};
                distance: {};
            };
        };
        pointLightShadows: {
            value: any[];
            properties: {
                shadowBias: {};
                shadowNormalBias: {};
                shadowRadius: {};
                shadowMapSize: {};
            };
        };
        pointShadowMap: IUniform;
        pointShadowMatrix: IUniform;
        hemisphereLights: {
            value: any[];
            properties: {
                direction: {};
                skycolor: {};
                groundColor: {};
            };
        };
        rectAreaLights: {
            value: any[];
            properties: {
                color: {};
                position: {};
                width: {};
                height: {};
            };
        };
    };
    points: {
        diffuse: IUniform;
        opacity: IUniform;
        size: IUniform;
        scale: IUniform;
        map: IUniform;
        uvTransform: IUniform;
    };
};
