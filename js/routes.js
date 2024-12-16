import { ParamHashRouter } from "./paramHashRouter.js";
import { fetchAndDisplayArticles, createHtml4Opinions, processOpinionFormData } from './main.js';
import { fetchAndDisplayArticleDetail, editArticle, insertArticle, deleteArticle} from './main.js';
import { removeArticleFromDOM, formatDate, navigatePage} from './main.js';

const routes = [
    {
        hash: "welcome",
        target: "router-view",
        getTemplate: (target) => {
            document.getElementById(target).innerHTML = `
                <section>
                     <h2>Welcome to Blockbench Hub!</h2>
                     <p>Discover the art of 3D modeling and animation using Blockbench. Dive into tutorials, share your creations, and connect with the community.</p>
                </section>`;
        }
    },
    {
        hash: "articles",
        target: "router-view",
        getTemplate: fetchAndDisplayArticles
        },
        {
            hash: "opinions",
            target: "router-view",
            getTemplate: createHtml4Opinions
        },
        {
          hash: "article",
          target: "router-view",
          getTemplate: fetchAndDisplayArticleDetail
      },
      {
        hash: "artEdit",
        target: "router-view",
        getTemplate: (targetElm, id) => editArticle(id)
      },
      {
          hash: "artInsert",
          target: "router-view",
          getTemplate: insertArticle
      },
      {
        hash: "artDelete",
        target: "router-view",
        getTemplate: (targetElm, id) => deleteArticle(id)
    },
      
    {
        hash: "addOpinion",
        target: "router-view",
        getTemplate: (target) => {
            document.getElementById(target).innerHTML = `
                <section>
                    <h2>Share Your Opinion</h2>
                    <form id="opinionForm">
                        <label for="name">Your Name:</label>
                        <input type="text" id="name" name="name" required>
                        
                        <label for="comment">Your Opinion:</label>
                        <textarea id="comment" name="comment" required></textarea>
                        
                        <label>
                            <input type="checkbox" id="willReturn" name="willReturn">
                            I will return to this blog.
                        </label>
                        
                        <button type="submit">Submit</button>
                    </form>
                </section>`;
            document.getElementById("opinionForm").onsubmit = processOpinionFormData;
        }
    }
];

new ParamHashRouter(routes);

window.fetchAndDisplayArticleDetail = fetchAndDisplayArticleDetail;
window.deleteArticle = deleteArticle;
window.editArticle = editArticle;

