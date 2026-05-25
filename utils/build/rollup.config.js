import terser from '@rollup/plugin-terser';
import MagicString from 'magic-string';
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

function copyWasm() {
    return {
        name: 'copy-wasm',
        writeBundle() {
            const wasmSrc = resolve('src/wasm/three_core_bg.wasm');
            if (existsSync(wasmSrc)) {
                mkdirSync(resolve('build'), { recursive: true });
                copyFileSync(wasmSrc, resolve('build/three_core_bg.wasm'));
                console.log('WASM binary copied to build/');
            }
        }
    };
}

function glsl() {

    return {

        transform( code, id ) {

            if ( /\.glsl.js$/.test( id ) === false ) return;

            code = new MagicString( code );

            code.replace( /\/\* glsl \*\/\`(.*?)\`/sg, function ( match, p1 ) {

                return JSON.stringify(
                    p1
                        .trim()
                        .replace( /\r/g, '' )
                        .replace( /[ \t]*\/\/.*\n/g, '' ) // remove //
                        .replace( /[ \t]*\/\*[\s\S]*?\*\//g, '' ) // remove /* */
                        .replace( /\n{2,}/g, '\n' ) // # \n+ to \n
                );

            } );

            return {
                code: code.toString(),
                map: code.generateMap()
            };

        }

    };

}

function header() {

    return {

        renderChunk( code ) {

            code = new MagicString( code );

            code.prepend( `/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */\n` );

            return {
                code: code.toString(),
                map: code.generateMap()
            };

        }

    };

}

/**
 * @type {Array<import('rollup').RollupOptions>}
 */
const builds = [
    {
        input: {
            'three.core.js': 'src/Three.Core.js',
        },
        plugins: [
            glsl(),
            header(),
            copyWasm()
        ],
        preserveEntrySignatures: 'allow-extension',
        output: [
            {
                format: 'esm',
                dir: 'build',
                minifyInternalExports: false,
                entryFileNames: '[name]',
            }
        ]
    },
    {
        input: {
            'three.core.js': 'src/Three.Core.js',
            'three.module.js': 'src/Three.js',
        },
        plugins: [
            glsl(),
            header(),
            copyWasm()
        ],
        preserveEntrySignatures: 'allow-extension',
        output: [
            {
                format: 'esm',
                dir: 'build',
                minifyInternalExports: false,
                entryFileNames: '[name]',
            }
        ]
    },
    {
        input: {
            'three.core.min.js': 'src/Three.Core.js',
        },
        plugins: [
            glsl(),
            header(),
            terser(),
            copyWasm()
        ],
        preserveEntrySignatures: 'allow-extension',
        output: [
            {
                format: 'esm',
                dir: 'build',
                minifyInternalExports: false,
                entryFileNames: '[name]',
            }
        ]
    },
    {
        input: {
            'three.core.min.js': 'src/Three.Core.js',
            'three.module.min.js': 'src/Three.js',
        },
        plugins: [
            glsl(),
            header(),
            terser(),
            copyWasm()
        ],
        preserveEntrySignatures: 'allow-extension',
        output: [
            {
                format: 'esm',
                dir: 'build',
                minifyInternalExports: false,
                entryFileNames: '[name]',
            }
        ]
    }
];

export default ( args ) => args.configOnlyModule ? builds.slice( 0, 2 ) : builds;
