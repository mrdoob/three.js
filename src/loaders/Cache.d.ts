export namespace Cache {
	/**
	 * @default false
	 */
	export let enabled: boolean;

	/**
	 * @default {}
	 */
	export let files: any;

	export function add( key: string, file: any ): void;
	export function get( key: string ): any;
	export function remove( key: string ): void;
	export function clear(): void;
}
