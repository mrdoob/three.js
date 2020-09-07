export default class WebGPUAttributes {

	constructor( device );
	buffers: WeakMap;
	device: any;

	get( attribute ): any;

	remove( attribute ): void;

	update( attribute, isIndex?: boolean ): void;

	_createBuffer( attribute, usage ): Object;

	_writeBuffer( buffer, attribute ): void;

}

export default WebGPUAttributes;
