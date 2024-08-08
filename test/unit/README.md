## Setup

- Execute `npm install` from the root folder

## Run

You can run the unit tests in two ways:

- Headless: Execute `npm run test-unit`, `npm run test-unit-addons` from the root folder.  
  In headless mode the tests will run in a headless browser.  
- Headful: Execute `npm run test-unit-headful`, `npm run test-unit-addons-headful` from the root folder.  
  In headful mode, a browser window will open, and you can see the tests running.  
  While the headful mode is running you can also use any browser to navigate to http://localhost:1234/test/unit/UnitTests.html or http://localhost:1234/test/unit/UnitTestsAddons.html to run the tests in that browser.  
  Further changes to the library will not be reflected until the page is refreshed.

See [Installation](https://threejs.org/docs/#manual/introduction/Installation) for more information.

## Troubleshooting

When adding or updating tests, the most common cause of test failure is forgetting to change `QUnit.todo` to `QUnit.test` when the test is ready.

An error that indicates "no tests were found" means that an import statement could not be resolved. This is usually caused by a typo in the import path.

## Debugging

To debug a test, add `debugger;` to the test code. Then, run the test in a browser and open the developer tools. The test will stop at the `debugger` statement, and you can inspect the code.

