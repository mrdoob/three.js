To build the npm modules:

1. install nodejs.
2. install npm (if it was not installed with nodejs)
3. install npm module dependencies (see utils/build/package.json)
4. determine the version of THREE that you want to publish (usually it is specified in src/Three.js as the REVISION)
5. increment the fix number above what was previously published if you are re-publishing an existing Three.js version.
6. add "-dev" to the version number if this is a development branch.
7. run the follow to build both the three and three-math node modules
 * node build.js 0.54.3-dev
8. npm publish node_modules/three
9. npm publish node_modules/three-math

