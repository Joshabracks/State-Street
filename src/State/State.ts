import constructDOM from "./constructDom.js";
import updateDOM from "./updateDom.js";

export default class State {
  data: any;
  template: any;
  idMap: any;
  dataMap: any;
  previous: string;
  components: any;
  methods: any;
  constructor(template: any = [], data: any = {}, components: any = {}, methods: any = {}) {
    this.data = data;
    this.template = template;
    this.previous = JSON.stringify(this.data);
    this.idMap = {};
    this.dataMap = {};
    this.components = components
    this.methods = methods;
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
