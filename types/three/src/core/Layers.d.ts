export class Layers {
    constructor();

    /**
     * @default 1 | 0
     */
    mask: number;

    set(channel: number): void;
    enable(channel: number): void;
    enableAll(): void;
    toggle(channel: number): void;
    disable(channel: number): void;
    disableAll(): void;
    test(layers: Layers): boolean;
}
