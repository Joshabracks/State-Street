const valsRegex = /{{.[^{]+}}/g;
const cleanerRegex = /{{(.*)}}/;
function getValue(obj, values) {
    if (values.length === 0)
        return obj;
    const key = values.shift() || "";
    const value = obj[key];
    if (!value)
        return value;
    return getValue(value, values);
}
function constructElement(data, depth, state) {
    var _a, _b;
    const content = (data === null || data === void 0 ? void 0 : data.content) || [];
    if (((_a = content === null || content === void 0 ? void 0 : content.constructor) === null || _a === void 0 ? void 0 : _a.name) !== "Array") {
        return Error("Failed to construct element: content object must be an Array");
    }
    const tag = (data === null || data === void 0 ? void 0 : data.tag) || "div";
    const classList = ((_b = data === null || data === void 0 ? void 0 : data.class) === null || _b === void 0 ? void 0 : _b.split(" ")) || [];
    const element = document.createElement(tag);
    classList.forEach((className) => {
        element.classList.add(className);
    });
    state.idMap[depth] = element;
    element.setAttribute("ststid", depth);
    for (let i = 0; i < content.length; i++) {
        const child = content[i];
        const type = typeof child;
        const subDepth = `${depth}${i}`;
        if (type === "object" && type !== null) {
            element.appendChild(constructElement(child, subDepth, state));
        }
        else {
            const subElement = document.createElement("span");
            subElement.setAttribute("ststid", subDepth);
            let innerText = "";
            const mapValues = {};
            if (type == "string") {
                innerText = child;
                const variables = child.match(valsRegex) || [];
                for (let j = 0; j < variables.length; j++) {
                    const valuesString = variables[j].match(cleanerRegex)[1] || "";
                    const values = valuesString.split(".");
                    const value = getValue(state.data, values);
                    mapValues[valuesString] = JSON.parse(JSON.stringify(value || ""));
                    innerText = innerText.replace(variables[j], value);
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
export default constructElement;
//# sourceMappingURL=constructElement.js.map