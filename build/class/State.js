// function hash(str: string) {
//   var hash = 0,
//     i,
//     chr;
//   if (str.length === 0) return hash;
//   for (i = 0; i < str.length; i++) {
//     chr = str.charCodeAt(i);
//     hash = (hash << 5) - hash + chr;
//     hash |= 0; // Convert to 32bit integer
//   }
//   return hash;
// }
const valsRegex = /{{.[^{]+}}/g;
const cleanerRegex = /{{(.*)}}/;
function getValue(obj, values) {
    console.log(obj);
    console.log(values);
    if (values.length === 0)
        return obj;
    const key = values.shift() || '';
    console.log(key);
    const value = obj[key];
    if (!value)
        return value;
    return getValue(value, values);
}
function constructElement(data, depth, state) {
    var _a;
    const content = (data === null || data === void 0 ? void 0 : data.content) || [];
    if (((_a = content === null || content === void 0 ? void 0 : content.constructor) === null || _a === void 0 ? void 0 : _a.name) !== "Array") {
        return Error("Failed to construct element: content object must be an Array");
    }
    const tag = (data === null || data === void 0 ? void 0 : data.tag) || 'div';
    const element = document.createElement(tag);
    state.idMap[depth] = element;
    element.setAttribute('ststid', depth);
    for (let i = 0; i < content.length; i++) {
        const child = content[i];
        const type = typeof child;
        const subDepth = `${depth}${i}`;
        if (type === 'object' && type !== null) {
            element.appendChild(constructElement(child, subDepth, state));
        }
        else {
            const subElement = document.createElement('span');
            subElement.setAttribute('ststid', subDepth);
            let innerText = '';
            const mapValues = {};
            if (type == 'string') {
                const variables = child.match(valsRegex) || [];
                console.log(variables);
                for (let j = 0; j < variables.length; j++) {
                    const valuesString = variables[j].match(cleanerRegex)[1] || '';
                    const values = valuesString.split('.');
                    console.log('values: ', values);
                    const value = getValue(state.data, values);
                    mapValues[valuesString] = JSON.parse(JSON.stringify(value || ''));
                    innerText = value;
                }
            }
            else {
                innerText = JSON.stringify(child);
            }
            subElement.innerText = innerText;
            state.idMap[subDepth] = { element: subElement, values: mapValues };
            element.appendChild(subElement);
        }
    }
    return element;
}
function constructDOM(state) {
    const { data, template } = state;
    if (data.title)
        document.title = data.title;
    const elements = [];
    for (let i = 0; i < template.body.length; i++) {
        const element = constructElement(template.body[i], `${i}`, state);
        console.log(element);
        elements.push(element);
    }
    document.body.innerHTML = '';
    elements.forEach((element) => document.body.appendChild(element));
    console.log(state);
}
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