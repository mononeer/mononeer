document.addEventListener('DOMContentLoaded', () => {
    const titleEl = document.getElementById('project-title');
    const descriptionEl = document.getElementById('project-description');
    const readmeEl = document.getElementById('project-readme');

    const params = new URLSearchParams(window.location.search);
    const repoName = params.get('repo');

    if (!repoName) {
        titleEl.textContent = 'Project not found.';
        return;
    }

    const showdownConverter = new showdown.Converter();

    async function fetchProjectDetails() {
        try {
            // Fetch basic repo info
            const repoRes = await fetch(`https://api.github.com/repos/mononeer/${repoName}`);
            if (!repoRes.ok) throw new Error('Repository not found');
            const repoData = await repoRes.json();

            titleEl.textContent = repoData.name;
            descriptionEl.textContent = repoData.description || 'No description provided.';

            // Fetch README
            const readmeRes = await fetch(`https://api.github.com/repos/mononeer/${repoName}/readme`);
            if (!readmeRes.ok) {
                readmeEl.innerHTML = '<p>No README found for this project.</p>';
                return;
            }
            const readmeData = await readmeRes.json();

            // Decode base64 content and convert Markdown to HTML
            const markdownContent = atob(readmeData.content);
            const htmlContent = showdownConverter.makeHtml(markdownContent);
            readmeEl.innerHTML = htmlContent;

        } catch (error) {
            console.error('Error fetching project details:', error);
            titleEl.textContent = 'Error loading project';
            descriptionEl.textContent = error.message;
        }
    }

    fetchProjectDetails();
});
