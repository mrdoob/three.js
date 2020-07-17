export namespace Cache {
	export let enabled: boolean;
	export let files: any;

	export function add( key: string, file: any ): void;
	export function get( key: string ): any;
	export function remove( key: string ): void;
	export function clear(): void;
}
