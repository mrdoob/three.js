## Setup

- Execute `npm install` from the root folder

## Run

You can run the unit tests in two environments:

- Node.js: Execute `npm run test-unit` from the root folder
- Browser: Execute `npx servez -p 8080 --ssl` (or run any other local web sever) from the root folder and access `https://localhost:8080/test/unit/UnitTests.html` in a web browser. 

See [How to run things locally](https://threejs.org/docs/#manual/introduction/How-to-run-things-locally) for more information.

## Notes

Some tests can only be run in a browser environment.

For browser tests, futher changes to the library will not be reflected until the page is refreshed.

When adding or updating tests, the cost common cause of test failure is forgetting to change `QUnit.todo` to `QUnit.test` when the test is ready.

## Debugging

To debug a test, add `debugger;` to the test code. Then, run the test in a browser and open the developer tools. The test will stop at the `debugger` statement and you can inspect the code.

