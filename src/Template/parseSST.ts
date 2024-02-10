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

const tagNameRegExp = /<\/*(\w+)/;
function getTagName(tag: string) {
  return tag.match(tagNameRegExp)?.[1];
}

const OPEN_TAG_REGEX = /^<[^>\/]*>/;
const CLOSE_TAG_REGEX = /^<\/\w+>/;
const TEXT_REGEX = /^[^<]+/;
const WHITE_SPACE_TRIM_REGEX = /\n\s+/g;
function getElements(data: string = '', content: any[]): any {
  let dataEdit = '' + data;
  while (dataEdit.length) {
    dataEdit = dataEdit.replace(WHITE_SPACE_TRIM_REGEX, '').trim();
    const elementType: string = 
    (dataEdit.match(OPEN_TAG_REGEX) && 'open') || 
    (dataEdit.match(CLOSE_TAG_REGEX) && 'close') || 
    'text';
    const elementRegExp: RegExp = (elementType === 'open') ? OPEN_TAG_REGEX : elementType === 'close' ? CLOSE_TAG_REGEX : TEXT_REGEX;
    const elementString: string = dataEdit.match(elementRegExp)?.[0] || '';
    dataEdit = dataEdit.replace(elementRegExp, '');
    if (!elementString.trim()) continue;
    if (elementType === 'open') {
      const tagName = getTagName(elementString);
      const attributes = getAttributes(elementString);
      const elementContentData = getElements(dataEdit, []);
      const element = {
        type: tagName,
        attributes: attributes,
        content: elementContentData.content
      }
      content.push(element);
      dataEdit = elementContentData.dataEdit;
      continue;
    }
    if (elementType === 'close') {
      return {content, dataEdit};
    }
    content.push(elementString);
  }
  return {content, dataEdit}
}

function parseSST(data: string) {
  const result = getElements(data, []);
  return result.content;
}

export { parseSST };
