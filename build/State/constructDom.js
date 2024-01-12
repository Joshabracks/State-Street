import constructElement from "./constructElement.js";
function constructDOM(state) {
    const { data, template } = state;
    if (data.title)
        document.title = data.title;
    const elements = [];
    for (let i = 0; i < template.body.length; i++) {
        const element = constructElement(template.body[i], `${i}`, state);
        elements.push(element);
    }
    document.body.innerHTML = "";
    elements.forEach((element) => document.body.appendChild(element));
    console.log(state);
}
export default constructDOM;
//# sourceMappingURL=constructDom.js.map