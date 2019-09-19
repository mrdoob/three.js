import {
	BufferGeometry,
	Color,
	Geometry,
	Mesh,
	Texture,
	Vector2
} from '../../../src/Three';

export interface WaterOptions {
	color?: Color | string | number;
	textureWidth?: number;
	textureHeight?: number;
	clipBias?: number;
	flowDirection?: Vector2;
	flowSpeed?: number;
	reflectivity?: number;
	scale?: number;
	shader?: object;
	flowMap?: Texture;
	normalMap0?: Texture;
	normalMap1?: Texture;
}

export class Water extends Mesh {

	constructor( geometry: Geometry | BufferGeometry, options: WaterOptions );

}
