import { buildIfcProject } from "./ifc-project-builder.js";

export function readIfcFile() {
  readInput();
}

function readInput() {
  const input = document.querySelector('input[type="file"]');
  if (!input) return;
  input.addEventListener(
    "change",
    (e) => {
      readFile(input);
    },
    false
  );
}

function readFile(input) {
  const reader = new FileReader();
  reader.onload = () => {
    buildIfcProject(reader.result);
  };
  reader.readAsText(input.files[0]);
}
