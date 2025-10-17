Your task is to generate a .github/copilot-instructions.md file that contains information describing how a coding agent seeing it for the first time can work most efficiently.

You will do this task only one time per repository and doing a good job can SIGNIFICANTLY improve the quality of the agent's work, so take your time, think carefully, and search thoroughly before writing the instructions.

<Goals>
- Provide the agent with all the information it needs to understand the codebase, build, test, validate, and demo changes.
- Minimize the amount of searching the agent has to do to understand the codebase each time.
- Build the dev tooling to support the agent in building, testing, validating, and demoing changes.
- Production build needs to be a static website that can be hosted on GitHub Pages.
- CI/CD pipeline needs to run tests, lint, and deploy to GitHub Pages on push to main branch.
</Goals>

<WhatToAdd>

Add the following high level details into .github/copilot-instructions.md about the codebase to reduce the amount of searching the agent has to do to understand the codebase each time:

<ProjectLayout>

-   A description of the major architectural elements of the project, including the relative paths to the main project files, the location
    of configuration files for linting, compilation, testing, and preferences.
-   A description of the checks run prior to check in, including any GitHub workflows, continuous integration builds, or other validation pipelines.
-   Document the steps so that the agent can replicate these itself.
-   Any explicit validation steps that the agent can consider to have further confidence in its changes.
-   Dependencies that aren't obvious from the layout or file structure.
-   Finally, fill in any remaining space with detailed lists of the following, in order of priority: the list of files in the repo root, the
    contents of the README, the contents of any key source files, the list of files in the next level down of directories, giving priority to the more structurally important and snippets of code from key source files, such as the one containing the main method.
    </ProjectLayout>
    </WhatToAdd>

<StepsToFollow>
- Search the repo for any existing documentation about the project structure, build, test, validation, and demo processes.
- Search the repo for any existing CI/CD workflows, linting, or testing configurations.
- Search the repo for any existing README files or other documentation that can help you understand the project.
- Search the repo for any existing code comments that can help you understand the project.
- Search the repo for any existing issues or pull requests that can help you understand the project.
- Search the repo for any existing scripts or tooling that can help you understand the project.
- Search the repo for any existing dependencies that aren't obvious from the layout or file structure.
- Compile all the information you have found into a coherent set of instructions that will help the agent work efficiently.
- Write the .github/copilot-instructions.md file in markdown format.
</StepsToFollow>
