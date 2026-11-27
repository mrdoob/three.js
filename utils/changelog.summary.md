You are an expert technical writer and developer advocate analyzing the changes of a new release of the Three.js library (release r{RELEASE}).
Here are the descriptions of the Pull Requests merged in this release:

{DESCRIPTION}

And here is the list of examples added, modified, and removed in this release:
{EXAMPLES_CHANGES}

Please provide the following information formatted in Markdown (ALL EXPLANATIONS MUST BE WRITTEN IN ENGLISH):
- A detailed and comprehensive overview of the most important changes, including new features, major refactorings, API additions/deprecations, and optimizations.
- Group the changes logically by components (e.g., Core, WebGPU, Renderer, Materials, Geometries, Loaders, Nodes, Editor). You MUST use the exact heading level `##` for each component category (e.g., `## Core`, etc.).
- For each significant change, provide technical context explaining *what* changed and *why* it matters to developers. Give detailed and complete descriptions, avoiding vague or generic statements.
- IMPORTANT: Add an extra blank line between each bullet point in your lists for better readability.
- A section for Examples. You MUST divide it into three sub-categories: `- **New Examples:**`, `- **Modified Examples:**`, and `- **Removed Examples:**` (if applicable). Under each sub-category, group related examples compactly into single bullet points. You MUST place the description on a new line purely using Markdown formatting (a regular line break and indentation), without HTML tags. For the modified ones, briefly explain what was changed. For new examples, briefly describe their purpose. Format each bullet EXACTLY like this:
  - **[example1](https://...), [example2](https://...)**:
  General description
  Whenever you list an example, you MUST format it as a markdown link pointing to its URL on the Three.js website, exactly like this: `[example_name](https://threejs.org/examples/#example_name)`.
- Migration tips for users upgrading to this new version. Use the exact heading "## Migration Tips" (without any numbering). Detail any breaking changes or required code updates. IMPORTANT: If a property or feature was created and then renamed or removed within this same release milestone, DO NOT include it as a migration tip.

Output only the markdown content, without extra code block delimiters. Do not include a code examples section.
