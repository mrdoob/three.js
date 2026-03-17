# Critical Bug: AnimationClip.parse crashes when userData is an object

## Summary
Animation clip parsing throws at runtime when serialized clip input contains userData as an object instead of a JSON string.

This is a hard failure path in public APIs:
- [src/animation/AnimationClip.js](src/animation/AnimationClip.js#L110)
- [src/loaders/AnimationLoader.js](src/loaders/AnimationLoader.js#L85)
- [src/loaders/ObjectLoader.js](src/loaders/ObjectLoader.js#L421)

## Why this is high impact
- Causes runtime exceptions during animation import/parsing.
- Breaks both direct parsing and loader-based pipelines.
- A single clip payload with object userData can abort animation loading entirely.

## Root cause
In [src/animation/AnimationClip.js](src/animation/AnimationClip.js#L110):

```js
clip.userData = JSON.parse( json.userData || '{}' );
```

If json.userData is already an object, this becomes JSON.parse( object ), which throws:
"[object Object]" is not valid JSON

## Reproduction (verified)

### Repro 1: Direct parse crash

```bash
@'
import { AnimationClip } from "./src/animation/AnimationClip.js";
const json = { name: "c", duration: 1, tracks: [], userData: { foo: 1 } };
try {
	const c = AnimationClip.parse( json );
	console.log( 'parsed', c.userData );
} catch ( e ) {
	console.error( 'ERR', e.message );
}
'@ | node --input-type=module
```

Observed:
- ERR "[object Object]" is not valid JSON

### Repro 2: Public loader parse path crash

```bash
@'
import { AnimationLoader } from "./src/loaders/AnimationLoader.js";
const loader = new AnimationLoader();
try {
	loader.parse( [ { name: "clip", duration: 1, tracks: [], userData: { important: true } } ] );
	console.log( 'unexpected success' );
} catch ( e ) {
	console.error( 'ERR', e.message );
}
'@ | node --input-type=module
```

Observed:
- ERR "[object Object]" is not valid JSON

## Expected behavior
AnimationClip.parse should accept both:
- userData as stringified JSON
- userData as plain object

## Actual behavior
Only string form works; object form throws and aborts parse.

## Suggested fix
In [src/animation/AnimationClip.js](src/animation/AnimationClip.js#L110), make parsing type-safe:

1. If userData is undefined/null: use {}
2. If userData is a string: JSON.parse with try/catch
3. If userData is an object: assign directly (or shallow clone)

## Suggested tests
Add unit cases in animation tests to verify:
1. parse accepts string userData
2. parse accepts object userData
3. parse handles invalid string userData with clear error path

