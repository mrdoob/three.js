#### Dependencies
1. To build the npm modules you will need both `node` and `npm` installed.
2. We can then use `npm` to resolve our remaining Javascript build dependences. These
dependencies are specified in `utils/build/package.json`.
3. Note that there are other dependences - in particular, the
[closure compiler](https://developers.google.com/closure/compiler/)
is invoked, so you will need to ensure that `java` points to a suitably
up-to-date version of the JVM.

#### Specifying the version

To invoke the build script (which will build both the both the `three` and
`three-math` node modules) we need to run a command like
```
> node build.js 0.54.3-dev
 ```
in this directory. Note how we have to provide the build script with the version
number. The version number is of the form `major.minor.fix[-dev]`.
The major/minor version numbers of the build should be taken from the
`REVISION` parameter in `src/Three.js` (e.g. if `REVISION: '68'` choose `0.68`).

Note that the following rules should be followed to determine the full version
identifier:
- Increment the fix number by `1` if you are re-publishing an existing Three.js
version. If this is a new release the fix number should be `0`.
- Add `-dev` to the version number if this is a development branch.

As an example, to build r68, checkout the `r68` tag, follow the above, and then
run
```
> node build.js 0.68.0
 ```

#### Publishing

The built modules will be left in `node_modules` in this directory. To upload
both `three` and `three-math` to `npm`, run
```
> npm publish node_modules/three
> npm publish node_modules/three-math
```
in this directory.
