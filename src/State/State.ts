import constructDOM from "./constructDom.js";
import updateDOM from "./updateDom.js";
import { parseSST } from "../Template/parseSST.js";

/**
 * Builds, renders and manages the DOM
 * @param template: string - State Street formatted string template.  Parsed along with components to build the DOM
 * @param data: object - Object containing dynamic variables for use in State.  If renderLoop option is not set to false, any changes made within the data object trigger re-rendering of the DOM where appropriate
 * @param methods: object - Object containing methods meant to be used via event listeners that are declared within the template's elements
 * @param options: object - Options for customizing State rendering behavior
 * renderLoop: boolean - Default: false - When set to true, the DOM automatically re-renders any time a variable within State.data is changed via State.update().  When set to false, State.update must be managed manually.
 * targetFPS: number - Default: 60 - When set, will attempt to run updates at the target fps, if possible.  If not, updates will run at the highest refresh rate determined by the browser via requestAnimationFrame.
 */
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
  targetFPS: number = 60
  nextUpdate: number = 0
  updateInterval: number = -1
  constructor(template: string, data: any = {}, components: any = {}, methods: any = {}, options: any = {}) {
    this.data = data;
    this.template = parseSST(template, components);
    this.previous = JSON.stringify(this.data);
    this.idMap = {};
    this.components = components;
    this.componentMap = {};
    this.methods = methods;
    if (!options?.renderLoop && options.renderLoop === false) this.renderLoop = false;
    if (typeof options?.targetFPS === 'number' && options.targetFPS > 0) this.targetFPS = options.targetFPS;
    this.updateInterval = 1000 / this.targetFPS
    this.nextUpdate = this.updateInterval + Date.now()
    constructDOM(this);
    this.update();
  }
  /**
   * Checks to see if the State.data object has any changes
   * @returns boolean
   */
  sameState = () => {
    const current = JSON.stringify(this.data);
    if (this.previous === current) {
      return true;
    }
    this.previous = current;
    return false;
  };
  setNextUpdate = () => {
    this.nextUpdate = Date.now() + this.updateInterval
  }
  /**
   * Updates the DOM, taking changes made within the State.data object into account
   * @returns undefined
   */
  update = () => {
    if (!this.renderLoop) {
      updateDOM(this);
      return;
    }
    if (this.nextUpdate > Date.now()) {
      window.requestAnimationFrame(this.update);
      return;
    }
    if (this.sameState()) {
      window.requestAnimationFrame(this.update);
      return;
    }
    this.setNextUpdate();
    updateDOM(this);
    window.requestAnimationFrame(this.update);
  };
}
