
# Help
The issues section is for bug reports and feature requests only. If you need help, please use the [forum](http://discourse.threejs.org/) or [stackoverflow](http://stackoverflow.com/questions/tagged/three.js).

# Bugs
#### Before reporting a bug

1. Search issue tracker for similar issues.
2. Try the latest dev branch version of three.js.
3. Refer to the [Migration Guide](https://github.com/mrdoob/three.js/wiki/Migration) when upgrading to the dev version.

#### How to report a bug

1. Specify the revision number of the three.js library where the bug occurred.
2. Specify your browser version, operating system, and graphics card. (for example, Chrome 23.0.1271.95, Windows 7, Nvidia Quadro 2000M)
3. Describe the problem in detail. Explain what happened, and what you expected would happen.
4. Provide a small test-case (http://jsfiddle.net). [Here is a fiddle](https://jsfiddle.net/3foLr7sn/) you can edit that runs the current version. [And here is a fiddle](https://jsfiddle.net/qgu17w5o/) that uses the dev branch. If a test-case is not possible, provide a link to a live version of your application.
5. If helpful, include a screenshot. Annotate the screenshot for clarity.

# Contribution
#### Introduction

It is assumed that you know a little about node.js and git. If not, [here's some help to get started
with git](https://help.github.com/en/github/using-git) and [here’s some help to get started with node.js.](https://nodejs.org/en/docs/guides/getting-started-guide/)

* Install [Node.js](https://nodejs.org/)
* Install [Git](https://git-scm.com/)
* [Fork](https://help.github.com/en/github/getting-started-with-github/fork-a-repo) three.js 
* Open your OS’s terminal
* Change into the directory you’d like
* Clone your forked repo

        git clone https://github.com/[yourgithubname]/three.js.git
* Go into the three.js directory.
        
        cd ./three.js
* Install the dependencies

        npm install

#### Next Steps

As per the npm standard, ‘start’ is the place to begin the package.

    npm start

This script will start a local server similar to three.js, but instead will be hosted on your local
machine. Browse to http://localhost:8080/ to check it out. It also automatically creates the
‘build/three.js’ and ‘build/three.module.js’ scripts anytime there is a change within your three.js
directory.

The next most important script runs all the appropriate testing.
        
        npm test

The linting is there to keep a consistent code-style across the all of the code and the testing is
there to help catch bugs and check that the code behaves as expected. It is important that
neither of these steps comes up with any errors due to your changes.
* If you’d like the linter to fix any errors that it can change, make the following addition to the “test-lint” script.
        
        {
        ...
        "test-lint": "eslint src --ext js --ext ts --fix && tsc -p utils/build/tsconfig.lint.json"
        ...
        }

If you’d like to make a minified version of the build files i.e. ‘build/three.min.js’ run:
        
    npm run-script build-closure

#### Making changes

When you’ve decided to make changes, start with the following:
* Update your local repo
        
        git pull https://github.com/mrdoob/three.js.git
        git push
* Make a new branch from the dev branch
        
        git checkout dev
        git branch [mychangesbranch]
        git checkout [mychangesbranch]
* Add your changes to your commit.
* Push the changes to your forked repo.
* Open a Pull Request (PR)

Important notes:
* Don't include any build files to your commit.
* Not all new features will need a new example. Simpler features could be incorporated into an existing example. Bigger features may be asked to add an example demonstrating the feature.
* Making changes may require changes to the documentation. If so, please make a new PR for the appropriate doc changes. To update the Chinese docs, simply copy the English to begin with.
* it's good to also add an example and screenshot for it, for showing how it's used and for end-to-end testing.
* If you modify existing code, run relevant examples to check they didn't break and there wasn't performance regress.
* If you add some assets for the examples (models, textures, sounds, etc), make sure they have a proper license allowing for their use here, less restrictive the better. It is unlikely for large assets to be accepted.
* If some issue is relevant to patch / feature, please mention it with hash (e.g. #2774) in a commit message to get cross-reference in GitHub.
* If you modify files in examples/js directory, then don't perform any changes in the examples/jsm, JavaScript modules are auto-generated via running ‘node utils/modularize.js’.
* If end-to-end test failed in Travis and you are sure that all is correct, make a new screenshots with npm run make-screenshot <example_1_name> ... <example_N_name> .
* Watch out for Closure compiler warnings when building the libs, there should not be any.
* Once done with a patch / feature do not add more commits to a feature branch
* Create separate branches per patch or feature.

This project is currently contributed to mostly via everyone's spare time. Please keep that in mind as it may take some time for the appropriate feedback to get to you. If you are unsure about adding a new feature, it might be better to ask first to see whether other people think it's a good idea.