document.addEventListener('DOMContentLoaded', () => {
    const markdownInput = document.getElementById('markdown-input');
    const markdownPreview = document.getElementById('markdown-preview');

    if (!markdownInput || !markdownPreview) return;

    // Initialize showdown converter
    const converter = new showdown.Converter();
    converter.setOption('tables', true); // Enable table support

    function updatePreview() {
        const markdownText = markdownInput.value;
        const html = converter.makeHtml(markdownText);
        markdownPreview.innerHTML = html;
    }

    // Initial conversion for any default text
    updatePreview();

    // Update on every input event
    markdownInput.addEventListener('input', updatePreview);
});
