
let articles = JSON.parse(localStorage.getItem("articles")) || [];

export function ajaxRequest(method, url, data = null) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.responseText ? JSON.parse(xhr.responseText) : null);
            } else {
                reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
            }
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(data ? JSON.stringify(data) : null);
        xhr.onload = () => {
            console.log("Response status:", xhr.status);
            console.log("Response text:", xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.responseText ? JSON.parse(xhr.responseText) : null);
            } else {
                reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
            }
        };
        
    });
}

export function fetchAndDisplayArticles(target, offset = 0, limit = 10) {
    // Завантажуємо статті з локального сховища


    // Пагінація
    const paginatedArticles = articles.slice(offset, offset + limit);
    const currentPage = Math.ceil(offset / limit) + 1;
    const totalPages = Math.ceil(articles.length / limit);

    // Дані для рендерингу
    const data = {
        articles: paginatedArticles,
        hasPrev: currentPage > 1,
        hasNext: currentPage < totalPages,
        currentPage,
        totalPages,
    };

    // Рендеринг за допомогою Mustache
    const template = document.getElementById("template-articles").innerHTML;
    document.getElementById(target).innerHTML = Mustache.render(template, data);

    // Обробники для кнопок пагінації
    if (data.hasPrev) {
        document.getElementById("prevPage").onclick = () => {
            fetchAndDisplayArticles(target, offset - limit, limit);
        };
    }
    if (data.hasNext) {
        document.getElementById("nextPage").onclick = () => {
            fetchAndDisplayArticles(target, offset + limit, limit);
        };
    }
}



function displayArticle(target) {
    const article = articles[currentArticleIndex];
    document.getElementById(target).innerHTML = Mustache.render(
        `
        <article>
            <h2>{{title}}</h2>
            <p><strong>By:</strong> {{author}}</p>
            <p>{{content}}</p>
        </article>
        <footer>
            <button id="prevArticle" {{#disablePrev}}disabled{{/disablePrev}}>Previous</button>
            <button id="nextArticle" {{#disableNext}}disabled{{/disableNext}}>Next</button>
        </footer>
        `,
        {
            ...article,
            disablePrev: currentArticleIndex === 0,
            disableNext: currentArticleIndex === articles.length - 1
        }
    );

    // Обробники для кнопок
    document.getElementById("prevArticle").onclick = () => navigateArticle(target, -1);
    document.getElementById("nextArticle").onclick = () => navigateArticle(target, 1);
}



export function createHtml4Opinions(target) {
    const storedOpinions = localStorage.getItem("bearsOpinions");
    const opinions = storedOpinions ? JSON.parse(storedOpinions) : [];
    const html = opinions.map(opinion => `
        <article>
            <h3>${opinion.name} <span>${new Date(opinion.createdDate).toLocaleDateString()}</span></h3>
            <p>${opinion.comment}</p>
            <p>${opinion.willReturn ? "Will return." : "Won't return."}</p>
        </article>`).join('');
    document.getElementById(target).innerHTML = `<section>${html}</section>`;
}

export function processOpinionFormData(event) {
    event.preventDefault();
    const name = document.getElementById("name").value;
    const comment = document.getElementById("comment").value;
    const willReturn = document.getElementById("willReturn").checked;

    const newOpinion = { name, comment, willReturn, createdDate: new Date() };
    const storedOpinions = localStorage.getItem("bearsOpinions");
    const opinions = storedOpinions ? JSON.parse(storedOpinions) : [];
    opinions.push(newOpinion);
    localStorage.setItem("bearsOpinions", JSON.stringify(opinions));

    location.hash = "opinions";
}


export function fetchAndDisplayArticleDetail(target, id) {
    const articleId = parseInt(id);
    const article = articles.find(article => article.id === articleId);

    if (article) {
        const template = `
            <article>
                <button id="backButton">Back</button>
                <h2>${article.title}</h2>
                <p><strong>By:</strong> ${article.author}</p>
                <p>${article.content}</p>
                <footer>
                    <button id="deleteButton">Delete</button>
                    <button id="editButton">Edit</button>
                </footer>
                <h3>Comments</h3>
                <div id="commentsSection"></div>
                <form id="commentForm">
                    <label for="commentAuthor">Your Name:</label>
                    <input type="text" id="commentAuthor" placeholder="Enter your name" required />
                    <label for="commentContent">Your Comment:</label>
                    <textarea id="commentContent" placeholder="Write your comment" required></textarea>
                    <button type="submit">Add Comment</button>
                </form>
            </article>`;
        
        document.getElementById(target).innerHTML = template;

        // Відображення коментарів з пагінацією
        displayCommentsWithPagination(article.id, "commentsSection");

        // Обробник для форми додавання коментарів
        document.getElementById("commentForm").onsubmit = (e) => {
            e.preventDefault();
            const author = document.getElementById("commentAuthor").value.trim();
            const content = document.getElementById("commentContent").value.trim();

            if (author && content) {
                addComment(article.id, author, content);
                displayCommentsWithPagination(article.id, "commentsSection");
                document.getElementById("commentForm").reset();
            } else {
                alert("Both name and comment are required!");
            }
        };

        // Кнопка "Back"
        document.getElementById("backButton").onclick = () => {
            location.hash = "#articles";
            fetchAndDisplayArticles(target);
        };

        // Кнопка "Delete"
        document.getElementById("deleteButton").onclick = () => {
            deleteArticle(id);
            location.hash = "#articles";
        };

        // Кнопка "Edit"
        document.getElementById("editButton").onclick = () => {
            location.hash = `#artEdit/${id}`;
            editArticle(id);
        };
    } else {
        document.getElementById(target).innerHTML = `<p>Article not found.</p>`;
    }
}





export function editArticle(articleId) {
    // Знаходимо статтю в локальному масиві
    const article = articles.find(article => article.id === parseInt(articleId));

    if (article) {
        const template = document.getElementById("template-article-form").innerHTML;
        document.getElementById("router-view").innerHTML = Mustache.render(template, {
            ...article,
            formTitle: "Edit Article",
            submitBtTitle: "Save Changes"
        });

        // Прив'язуємо подію до форми редагування
        document.getElementById("articleForm").onsubmit = (e) => {
            e.preventDefault();

            // Збираємо оновлені дані з форми
            const updatedArticle = {
                id: article.id,
                title: document.getElementById("title").value,
                author: document.getElementById("author").value,
                content: document.getElementById("content").value,
                createdDate: article.createdDate // Зберігаємо початкову дату
            };

            // Оновлення статті у масиві `articles`
            const index = articles.findIndex(item => item.id === article.id);
            if (index !== -1) {
                articles[index] = updatedArticle;
                // Синхронізуємо з localStorage
                localStorage.setItem("articles", JSON.stringify(articles));
            }

            alert("Article updated successfully!");

            // Повернення до перегляду оновленої статті
            fetchAndDisplayArticleDetail("router-view", article.id);
        };

        // Додаємо кнопку "Back" для повернення до списку статей
        const backButton = document.createElement("button");
        backButton.id = "backButton";
        backButton.textContent = "Back";
        backButton.onclick = () => {
            location.hash = "#articles"; // Змінюємо хеш
            fetchAndDisplayArticles("router-view"); // Оновлюємо список статей
        };
        document.getElementById("router-view").prepend(backButton);
    } else {
        document.getElementById("router-view").innerHTML = `<p>Article not found.</p>`;
    }
}


export function insertArticle(targetElm) {
    document.getElementById(targetElm).innerHTML = `
        <section>
            <h2>Add New Article</h2>
            <form id="articleForm">
                <label for="title">Title:</label>
                <input type="text" id="title" name="title" required>
                
                <label for="author">Author:</label>
                <input type="text" id="author" name="author" required>
                
                <label for="content">Content:</label>
                <textarea id="content" name="content" required></textarea>
                
                <button type="submit">Add Article</button>
            </form>
        </section>
    `;

    document.getElementById("articleForm").onsubmit = function (e) {
        e.preventDefault();

        const newArticle = {
            id: articles.length > 0 ? articles[articles.length - 1].id + 1 : 1,
            title: document.getElementById("title").value,
            author: document.getElementById("author").value,
            content: document.getElementById("content").value,
            createdDate: new Date().toISOString().split("T")[0],
        };

        // Додаємо статтю до масиву
        articles.push(newArticle);

        // Оновлюємо локальне сховище
        localStorage.setItem("articles", JSON.stringify(articles));

        // Повертаємося до списку статей
        location.hash = "#articles";
        fetchAndDisplayArticles("router-view");
    };
}




export function deleteArticle(articleId) {
    if (confirm("Are you sure you want to delete this article?")) {
        const index = articles.findIndex(article => article.id === parseInt(articleId));
        
        if (index !== -1) {
            articles.splice(index, 1);
            localStorage.setItem("articles", JSON.stringify(articles)); // Оновлення локального сховища
            alert("Article deleted successfully!");
            fetchAndDisplayArticles("router-view"); // Оновлення списку статей
        } else {
            alert("Article not found.");
        }
    }
}


export function removeArticleFromDOM(articleId) {
    const articleElement = document.getElementById(`article-${articleId}`);
    if (articleElement) {
        articleElement.remove();
    }
}

export function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}


export function navigatePage(direction) {
    const currentPage = parseInt(location.hash.split("/").pop()) || 1;
    const newPage = currentPage + direction;
    location.hash = `#articles/page/${newPage}`;
    // Викликаємо перезавантаження списку статей:
    fetchAndDisplayArticles('router-view', (newPage - 1) * 10);
}


let comments = JSON.parse(localStorage.getItem("comments")) || {};
export function addComment(articleId, author, content) {
    if (!comments[articleId]) {
        comments[articleId] = [];
    }
    const newComment = {
        author,
        content,
        date: new Date().toISOString().split("T")[0],
    };
    comments[articleId].push(newComment);
    localStorage.setItem("comments", JSON.stringify(comments));
}



export function displayComments(articleId, targetId) {
    const commentsSection = document.getElementById(targetId);
    const articleComments = comments[articleId] || [];
    if (articleComments.length === 0) {
        commentsSection.innerHTML = "<p>No comments yet. Be the first to comment!</p>";
    } else {
        commentsSection.innerHTML = articleComments
            .map(
                comment => `
                <div class="comment">
                    <p><strong>${comment.author}</strong> (${comment.date})</p>
                    <p>${comment.content}</p>
                </div>`
            )
            .join("");
    }
}

export function displayCommentsWithPagination(articleId, targetId, page = 1) {
    const commentsSection = document.getElementById(targetId);
    const articleComments = comments[articleId] || [];
    const commentsPerPage = 10; // Кількість коментарів на сторінку
    const totalComments = articleComments.length;
    const totalPages = Math.ceil(totalComments / commentsPerPage);

    // Вираховуємо межі для поточної сторінки
    const start = (page - 1) * commentsPerPage;
    const end = start + commentsPerPage;
    const commentsToShow = articleComments.slice(start, end);

    // Рендеримо коментарі
    if (commentsToShow.length === 0) {
        commentsSection.innerHTML = "<p>No comments yet. Be the first to comment!</p>";
    } else {
        commentsSection.innerHTML = commentsToShow
            .map(
                comment => `
                <div class="comment">
                    <p><strong>${comment.author}</strong> (${comment.date})</p>
                    <p>${comment.content}</p>
                </div>`
            )
            .join("");
    }

    // Додаємо кнопки пагінації
    const paginationControls = document.createElement("div");
    paginationControls.className = "pagination-controls";

    if (page > 1) {
        const prevButton = document.createElement("button");
        prevButton.textContent = "Previous";
        prevButton.onclick = () => {
            displayCommentsWithPagination(articleId, targetId, page - 1);
        };
        paginationControls.appendChild(prevButton);
    }

    // Відображення номерів сторінок
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement("button");
        pageButton.textContent = i;
        pageButton.className = i === page ? "active-page" : "";
        pageButton.onclick = () => {
            displayCommentsWithPagination(articleId, targetId, i);
        };
        paginationControls.appendChild(pageButton);
    }

    if (page < totalPages) {
        const nextButton = document.createElement("button");
        nextButton.textContent = "Next";
        nextButton.onclick = () => {
            displayCommentsWithPagination(articleId, targetId, page + 1);
        };
        paginationControls.appendChild(nextButton);
    }

    commentsSection.appendChild(paginationControls);
}
