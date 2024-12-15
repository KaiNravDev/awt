// paramHashRouter.js
export class ParamHashRouter {
    constructor(routes) {
        this.routes = routes;
        window.addEventListener("hashchange", () => this.handleRouteChange());
        this.handleRouteChange();
    }

    handleRouteChange() {
        const hash = location.hash.slice(1) || "welcome"; // Встановлюємо хеш за замовчуванням
        const route = this.routes.find(r => r.hash === hash);
        if (route) {
            route.getTemplate(route.target);
        }
    }
    
}