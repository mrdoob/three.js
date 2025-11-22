document.querySelectorAll("pre code").forEach(block => {
    const button = document.createElement("button");
    button.textContent = "Copy";
    button.className = "copy-btn";
    
    button.onclick = async () => {
    await navigator.clipboard.writeText(block.textContent);
    button.textContent = "Copied!";
    setTimeout(() => (button.textContent = "Copy"), 1500);
    };
    
    block.parentElement.style.position = "relative";
    block.parentElement.appendChild(button);
    });
    