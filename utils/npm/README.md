To build the npm modules:

1. install nodejs.
2. install npm (if it was not installed with nodejs)
3. determine the version of THREE that you want to publish (usually it is specified in src/Three.js as the REVISION)
4. increment the fix number above what was previously published if you are re-publishing an existing Three.js version.
5. add "-dev" to the version number if this is a development branch.
6. run the follow to build both the three and three-math node modules
 * node build.js 0.54.3-dev
7. npm publish node_module/three
8. npm publish node_module/three-math

