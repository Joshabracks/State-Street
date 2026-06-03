import constructDOM from "./constructDom.js";
import updateDOM from "./updateDom.js";
import { parseSST } from "../Template/parseSST.js";
import { reactive } from "./reactive.js";
import { setImageMemoryBudget, enqueueWarm, processWarmQueue } from "./imageCache.js";

/**
 * Builds, renders and manages the DOM
 * @param template: string - State Street formatted string template.  Parsed along with components to build the DOM
 * @param data: object - Object containing dynamic variables for use in State.  If renderLoop option is not set to false, any changes made within the data object trigger re-rendering of the DOM where appropriate
 * @param methods: object - Object containing methods meant to be used via event listeners that are declared within the template's elements
 * @param options: object - Options for customizing State rendering behavior
 * renderLoop: boolean - Default: true - When true, an internal requestAnimationFrame loop calls State.update() automatically so the DOM re-renders whenever a variable within State.data changes.  When false, State.update() (or State.forceUpdate()) must be called manually.
 * targetFPS: number - Default: 60 - When set, will attempt to run updates at the target fps, if possible.  If not, updates will run at the highest refresh rate determined by the browser via requestAnimationFrame.
 * imgMemoryBudget: number - Default: 256MB - Maximum total bytes of cached image blobs. Base64 image src values are auto-converted to cached blob URLs (opt out per-image with the `nocache` attribute); least-recently-used blobs are revoked when over budget, except those still on the DOM.
 * targetFPS and imgMemoryBudget aside, imgWarmPerFrame: number - Default: 4 - How many queued images State.warmImages() converts/pre-decodes per frame.
 */
export default class State {
  private _data: any;
  template: any;
  idMap: any;
  textMap: any;
  attrMap: any;
  nodeMap: any;
  dataMap: any;
  dirty: boolean = true;
  dirtyKeys: Set<string> = new Set();
  components: any;
  componentMap: any;
  methods: any;
  renderLoop: boolean = true
  elementCount: number = 0
  targetFPS: number = 60
  nextUpdate: number = 0
  updateInterval: number = -1
  imgWarmPerFrame: number = 4
  constructor(template: string, data: any = {}, components: any = {}, methods: any = {}, options: any = {}) {
    this._data = reactive(data, (key) => {
      this.dirty = true;
      this.dirtyKeys.add(key);
    });
    this.template = parseSST(template, components);
    this.idMap = {};
    this.textMap = {};
    this.attrMap = {};
    this.nodeMap = {};
    this.components = components;
    this.componentMap = {};
    this.methods = methods;
    if (!options?.renderLoop && options.renderLoop === false) this.renderLoop = false;
    if (typeof options?.targetFPS === 'number' && options.targetFPS > 0) this.targetFPS = options.targetFPS;
    if (typeof options?.imgMemoryBudget === 'number' && options.imgMemoryBudget > 0) setImageMemoryBudget(options.imgMemoryBudget);
    if (typeof options?.imgWarmPerFrame === 'number' && options.imgWarmPerFrame > 0) this.imgWarmPerFrame = options.imgWarmPerFrame;
    this.updateInterval = 1000 / this.targetFPS
    this.nextUpdate = this.updateInterval + Date.now()
    constructDOM(this);
    this.update();
  }
  get data(): any {
    return this._data;
  }
  set data(next: any) {
    this._data = reactive(next, (key) => {
      this.dirty = true;
      this.dirtyKeys.add(key);
    });
    this.dirty = true;
    for (const k in next) this.dirtyKeys.add(k);
  }
  /**
   * Checks to see if the State.data object has any changes
   * @returns boolean
   */
  sameState = () => {
    return !this.dirty;
  };
  private clearDirty = () => {
    this.dirty = false;
    this.dirtyKeys.clear();
  }
  setNextUpdate = () => {
    this.nextUpdate = Date.now() + this.updateInterval
  }
  /**
   * Updates the DOM, taking changes made within the State.data object into account
   * @returns undefined
   */
  update = () => {
    processWarmQueue(this.imgWarmPerFrame);
    if (!this.renderLoop) {
      updateDOM(this);
      this.clearDirty();
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
    this.clearDirty();
    window.requestAnimationFrame(this.update);
  };
  forceUpdate = () => {
    updateDOM(this)
    this.clearDirty();
  }
  /**
   * Queues base64 image data URIs to be converted to cached blob URLs and
   * pre-decoded during idle frames, so they render instantly when shown.
   * @param list: string[] - base64 data URIs to warm
   */
  warmImages = (list: string[]) => enqueueWarm(list);
}
