import {
	Color,
	Group,
	Loader,
	LoadingManager,
	Material,
	Mesh,
	Texture
} from '../../../src/Three';

export class TDSLoader extends Loader {

	constructor( manager?: LoadingManager );
	debug: boolean;
	group: Group;
	manager: LoadingManager;
	materials: Material[];
	meshes: Mesh[];
	position: number;

	load( url: string, onLoad: ( object: Group ) => void, onProgress?: ( event: ProgressEvent ) => void, onError?: ( event: ErrorEvent ) => void ): void;
	loadAsync( url: string, onProgress?: ( event: ProgressEvent ) => void ): Promise<Group>;
	parse( arraybuffer: ArrayBuffer, path: string ): Group;

	debugMessage( message: object ): void;
	endChunk( chunk: object ): void;
	nextChunk( data: DataView, chunk: object ): void;
	readByte( data: DataView ): number;
	readChunk( data: DataView ): object;
	readColor( data: DataView ): Color;
	readDWord( data: DataView ): number;
	readFaceArray( data: DataView, mesh: Mesh ): void;
	readFile( arraybuffer: ArrayBuffer, path: string ): void;
	readFloat( data: DataView ): number;
	readInt( data: DataView ): number;
	readMap( data: DataView, path: string ): Texture;
	readMesh( data: DataView ): Mesh;
	readMeshData( data: DataView, path: string ): void;
	readMaterialEntry( data: DataView, path: string ): void;
	readMaterialGroup( data: DataView ): object;
	readNamedObject( data: DataView ): void;
	readShort( data: DataView ): number;
	readString( data: DataView, maxLength: number ): string;
	readWord( data: DataView ): number;
	resetPosition(): void;

}
