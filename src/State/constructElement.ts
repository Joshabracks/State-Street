import State from "./State.js";

const valsRegex = /{{.[^{]+}}/g;
const cleanerRegex = /{{(.*)}}/;

function getValue(obj: any, values: string[]) {
  if (values.length === 0) return obj;
  const key: string = values.shift() || "";
  const value = obj[key];
  if (!value) return value;
  return getValue(value, values);
}

function constructElement(data: any, depth: string, state: State) {
  const content = data?.content || [];
  if (content?.constructor?.name !== "Array") {
    return Error(
      "Failed to construct element: content object must be an Array"
    );
  }
  const tag = data?.type || "div";
  const element = document.createElement(tag);
  // const classList = data?.class?.split(" ") || [];
  // classList.forEach((className: string) => {
  //   element.classList.add(className);
  // });
  const attributes = data?.attributes || [];
  attributes.forEach((attribute: any) => {
    element.setAttribute(attribute.name, attribute.value);
  });
  state.idMap[depth] = element;
  element.setAttribute("ststid", depth);
  for (let i = 0; i < content.length; i++) {
    const child = content[i];
    const type = typeof child;
    const subDepth = `${depth}${i}`;
    if (type === "object" && type !== null) {
      element.appendChild(constructElement(child, subDepth, state));
    } else {
      const subElement = document.createElement("span");
      subElement.setAttribute("ststid", subDepth);
      let innerText = "";
      const mapValues: any = {};
      if (type == "string") {
        innerText = child;
        const variables = child.match(valsRegex) || [];
        for (let j = 0; j < variables.length; j++) {
          const valuesString: string =
            variables[j].match(cleanerRegex)[1] || "";
          const values = valuesString.split(".");
          const value = getValue(state.data, values);
          mapValues[valuesString] = JSON.parse(JSON.stringify(value || ""));
          innerText = innerText.replace(variables[j], value);
        }
      } else {
        innerText = JSON.stringify(child);
      }
      subElement.innerText = innerText;
      state.idMap[subDepth] = { element: subElement, values: mapValues };
      element.appendChild(subElement);
    }
  }
  return element;
}

export default constructElement