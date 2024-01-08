const valsRegex = /{{.[^{]+}}/g
const cleanerRegex = /{{(.*)}}/

function getValue(obj: any, values: string[]) {
  if (values.length === 0) return obj;
  const key: string = values.shift() || ''
  const value = obj[key]
  if (!value) return value;
  return getValue(value, values)
}

function constructElement(data: any, depth: string, state: State) {
  const content = data?.content || [];
  if (content?.constructor?.name !== "Array") {
    return Error("Failed to construct element: content object must be an Array");
  }
  const tag = data?.tag || 'div';
  const classList = data?.class?.split(' ') || [];
  const element = document.createElement(tag);
  classList.forEach((className: string) => {
    element.classList.add(className);
  })
  state.idMap[depth] = element;
  element.setAttribute('ststid', depth)
  for (let i = 0; i < content.length; i++) {
    const child = content[i];
    const type = typeof child;
    const subDepth = `${depth}${i}`;
    if (type === 'object' && type !== null) {
      element.appendChild(constructElement(child, subDepth, state));
    } else {
      const subElement = document.createElement('span');
      subElement.setAttribute('ststid', subDepth);
      let innerText = '';
      const mapValues: any = {};
      if (type == 'string') {
        innerText = child;
        const variables = child.match(valsRegex) || [];
        for (let j = 0; j < variables.length; j++) {
          const valuesString: string = variables[j].match(cleanerRegex)[1] || '';
          const values = valuesString.split('.');
          const value = getValue(state.data, values);
          mapValues[valuesString] = JSON.parse(JSON.stringify(value || ''));
          innerText = innerText.replace(variables[j], value);
        }
      } else {
        innerText = JSON.stringify(child);
      }
      subElement.innerText = innerText;
      state.idMap[subDepth] = { element: subElement, values: mapValues};
      element.appendChild(subElement);
    }
  }
  return element;
}

function constructDOM(state: State) {
  const { data, template } = state;
  if (data.title) document.title = data.title;
  const elements = [];
  for (let i = 0; i < template.body.length; i++) {
    const element = constructElement(template.body[i], `${i}`, state);
    elements.push(element);
  }
  document.body.innerHTML = '';
  elements.forEach((element: any) => document.body.appendChild(element));
  console.log(state)
}

export default class State {
  data: any;
  template: any;
  idMap: any;
  previous: string;
  constructor(template: any, data: any) {
    this.data = data;
    this.template = template;
    this.previous = JSON.stringify(this.data);
    this.idMap = {};
    constructDOM(this);
    this.update()
  }
  sameState = () => {
    const current = JSON.stringify(this.data);
    if (this.previous === current) {
      return true;
    }
    this.previous = current;
    return false;
  }
  update = () => {
    if (this.sameState()) {
      window.requestAnimationFrame(this.update)
      return
    }
    constructDOM(this);
    window.requestAnimationFrame(this.update)
  }
}
