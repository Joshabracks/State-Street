
const TAG_REGEX = /<[^\/]*?(\w+)[^>]*?>/g;
function getTag(elementString: string) {
    const match = elementString.match(TAG_REGEX);
    return match?.[0] || '';
}

const ATTRIBUTE_REGEX = /(\w+)=["']([^"']+)["']/g;
function getAttributes(tag: string) {
    let attributesMatch = (tag && ATTRIBUTE_REGEX.exec(tag)) || null;
    const attributes = [];
    while (attributesMatch !== null) {
        const attribute = {
            name: attributesMatch[1],
            value: attributesMatch[2],
        };
        attributes.push(attribute);
        attributesMatch = (tag && ATTRIBUTE_REGEX.exec(tag)) || null;
    }
    return attributes;
}

const tagNameRegExp = /<(\w+)/;
function getTagName(tag: string) {
    return tag.match(tagNameRegExp)?.[1];
}

const INNER_TEXT_REGEX = /<\w+[^>]*>([^<]*)<\/\w+>/;
function getInnerText(elementString: string) {
    return elementString.match(INNER_TEXT_REGEX)?.[1] || "";
}

const PARENTLESS_ELEMENT_REGEX = /<\w+[^>]+>(?:[^<]*?)<\/\w+>/g;
const PRETAG_REGEX = /^[^<]+/;



function getElements(data: string, content: any[] = []): any {
    data = data.replace(/\n\s+/g, '').trim();
    if (!data) {
        return {content, data};
    }
    const preDataText = data.match(PRETAG_REGEX)?.[0];
    if (preDataText?.trim()) {
        data = data.replace(preDataText, '').trim();
        return getElements(data, content);
    }
    const parentlessElements = data.match(PARENTLESS_ELEMENT_REGEX);
    if (parentlessElements === null) {
        return {content: content.concat([{type: "text", content: [data], attributes: []}]), data: ''};
    }
    if (parentlessElements.length === 1) {
        const tag = getTag(parentlessElements[0]) || '';
        const attributes = getAttributes(tag);
        const tagName = getTagName(parentlessElements[0]);
        const innerText = getInnerText(parentlessElements[0]);
        return {
            content: [{type: tagName, content: content.concat([innerText]), attributes: attributes}], 
            data: data.replace(parentlessElements[0], '').trim()
        };
    }
    for (let i = 0; i < parentlessElements.length; i++) {
        const tag = getTag(parentlessElements[i]);
        if (tag === null) {
            return {content: content.concat([{type: "text", content: [data], attributes: []}]), data: ''};
        }
        let tweenText;
        if (i < parentlessElements.length - 1) {
            const regexString = `${parentlessElements[i]}([\\s\\S]+)${parentlessElements[i + 1]}`;
            const tweenTextRegexp = new RegExp(regexString);
            const tweenTextMatch = data.match(tweenTextRegexp);
            tweenText = tweenTextMatch && tweenTextMatch[1].trim();
        }
        const attributes = getAttributes(tag);
        const tagName = getTagName(tag);
        const innerText = getInnerText(parentlessElements[i]);
        content.push({type: tagName, attributes: attributes, content: [innerText]});
        data = data.replace(parentlessElements[i], '').trim();
        if (tweenText) {
            content.push(tweenText);
            data = data.replace(tweenText, '')
        }
    }
    const result = getElements(data, content);
    const newData = result.data;
    const newContent = result.content;
    if (!newData || !newData.trim()) {
        return { data: newData, content: newContent };
    }
    return getElements(newData, newContent);
}

function parseSST(data: string) {
  const result = getElements(data)
  return result.content;
}

export { parseSST }
