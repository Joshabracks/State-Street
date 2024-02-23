import constructDOM from "./constructDOM.js";
import updateDOM from "./updateDom.js";

export default class State {
  data: any;
  template: any;
  idMap: any;
  dataMap: any;
  previous: string;
  constructor(template: any, data: any) {
    this.data = data;
    this.template = template;
    this.previous = JSON.stringify(this.data);
    this.idMap = {};
    this.dataMap = {};
    constructDOM(this);
    this.update();
  }
  sameState = () => {
    const current = JSON.stringify(this.data);
    if (this.previous === current) {
      return true;
    }
    this.previous = current;
    return false;
  };
  update = () => {
    if (this.sameState()) {
      window.requestAnimationFrame(this.update);
      return;
    }
    updateDOM(this);
    window.requestAnimationFrame(this.update);
  };
}
