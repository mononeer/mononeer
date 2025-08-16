document.addEventListener('DOMContentLoaded', () => {
    const articlesContainer = document.getElementById('articles-container');
    if (!articlesContainer) return;

    const apiKey = 'c39dfc340784447bab487145f48bee80';
    const keywords = 'developer OR software OR ai OR programming';
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(keywords)}&apiKey=${apiKey}&language=en&sortBy=publishedAt&pageSize=20`;

    async function fetchNews() {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            const data = await response.json();
            renderArticles(data.articles);
        } catch (error) {
            console.error('Error fetching news:', error);
            articlesContainer.innerHTML = '<p>Could not fetch news articles. Please try again later.</p>';
        }
    }

    function renderArticles(articles) {
        if (!articles || articles.length === 0) {
            articlesContainer.innerHTML = '<p>No news articles found.</p>';
            return;
        }

        articlesContainer.innerHTML = ''; // Clear loading message

        articles.forEach(article => {
            if (!article.title || article.title === '[Removed]') return;

            const articleEl = document.createElement('div');
            articleEl.classList.add('article-card');

            const title = document.createElement('h3');
            const link = document.createElement('a');
            link.href = article.url;
            link.textContent = article.title;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            title.appendChild(link);

            const description = document.createElement('p');
            description.textContent = article.description || '';

            const source = document.createElement('span');
            source.classList.add('article-source');
            source.textContent = `Source: ${article.source.name}`;

            const published = document.createElement('span');
            published.classList.add('article-published');
            published.textContent = `Published: ${new Date(article.publishedAt).toLocaleDateString()}`;

            const image = document.createElement('img');
            if(article.urlToImage) {
                image.src = article.urlToImage;
                image.alt = article.title;
                articleEl.appendChild(image);
            }

            articleEl.appendChild(title);
            articleEl.appendChild(description);
            articleEl.appendChild(source);
            articleEl.appendChild(published);

            articlesContainer.appendChild(articleEl);
        });
    }

    fetchNews();
});
