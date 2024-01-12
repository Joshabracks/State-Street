import constructDOM from "./constructDom.js";
export default class State {
    constructor(template, data) {
        this.sameState = () => {
            const current = JSON.stringify(this.data);
            if (this.previous === current) {
                return true;
            }
            this.previous = current;
            return false;
        };
        this.update = () => {
            if (this.sameState()) {
                window.requestAnimationFrame(this.update);
                return;
            }
            constructDOM(this);
            window.requestAnimationFrame(this.update);
        };
        this.data = data;
        this.template = template;
        this.previous = JSON.stringify(this.data);
        this.idMap = {};
        constructDOM(this);
        this.update();
    }
}
//# sourceMappingURL=State.js.map