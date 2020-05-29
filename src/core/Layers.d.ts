export class Layers {

	constructor();

	mask: number;
	recursive: boolean;

	set( channel: number ): void;
	enable( channel: number ): void;
	enableAll(): void;
	toggle( channel: number ): void;
	disable( channel: number ): void;
	disableAll(): void;
	test( layers: Layers ): boolean;

}
