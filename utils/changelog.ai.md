You are an expert technical writer and developer advocate analyzing the changes of a new release of the Three.js library (release r{RELEASE}).
Here are the descriptions of the Pull Requests merged in this release:

{DESCRIPTION}

And here is the list of examples added, modified, and removed in this release:
{EXAMPLES_CHANGES}

Please provide the following information formatted in Markdown (ALL EXPLANATIONS MUST BE WRITTEN IN ENGLISH):
- A detailed and comprehensive overview of the most important changes, including new features, major refactorings, API additions/deprecations, and optimizations.
- Group the changes logically by components (e.g., Core, WebGPU, Renderer, Materials, Geometries, Loaders, Nodes, Editor).
- For each significant change, provide technical context explaining *what* changed and *why* it matters to developers. Give detailed and complete descriptions, avoiding vague or generic statements.
- IMPORTANT: Add an extra blank line between each bullet point in your lists for better readability.
- A section for Examples. Detail "New Examples", followed by "Modified Examples", and then "Removed Examples" (if applicable). For the modified ones, use the provided PR descriptions to briefly explain what was changed. If new examples were added, briefly describe their purpose. IMPORTANT: Group related examples compactly into single bullet points (e.g., `- **[example1](https://...), [example2](https://...)**: General description`). Whenever you list an example, you MUST format it as a markdown link pointing to its URL on the Three.js website, exactly like this: `[example_name](https://threejs.org/examples/#example_name)`.
- Migration tips for users upgrading to this new version. Use the exact heading "## Migration Tips" (without any numbering). Detail any breaking changes or required code updates. IMPORTANT: If a property or feature was created and then renamed or removed within this same release milestone, DO NOT include it as a migration tip.

Output only the markdown content, without extra code block delimiters. Do not include a code examples section.
