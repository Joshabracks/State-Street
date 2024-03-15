import constructDOM from "./constructDom.js";
import updateDOM from "./updateDom.js";

export default class State {
  data: any;
  template: any;
  idMap: any;
  dataMap: any;
  previous: string;
  components: any;
  componentMap: any;
  methods: any;
  renderLoop: boolean = true
  elementCount: number = 0
  constructor(template: any = [], data: any = {}, components: any = {}, methods: any = {}, options: any = {}) {
    this.data = data;
    this.template = template;
    this.previous = JSON.stringify(this.data);
    this.idMap = {};
    this.components = components;
    this.componentMap = {};
    this.methods = methods;
    if (!options?.renderLoop && options.renderLoop === false) this.renderLoop = false;
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
    if (!this.renderLoop) {
      updateDOM(this);
      return;
    }
    if (this.sameState()) {
      window.requestAnimationFrame(this.update);
      return;
    }
    updateDOM(this);
    window.requestAnimationFrame(this.update);
  };
}
