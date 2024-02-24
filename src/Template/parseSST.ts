const ATTRIBUTE_REGEX = /(\w+)=["']([^"']+)["']/g;

enum ELEMENT_TYPE {
  COMPONENT,
  OPEN,
  CLOSING,
  TEXT,
  SELF_CLOSING,
}

const REGEX = {
  OPEN_TAG: /^<[^>\/]*>/,
  SELF_CLOSING_TAG: /^<[^>\/]*\/>/,
  COMPONENT_TAG: /^<:[^>\/]*\/>/,
  CLOSE_TAG: /^<\/\w+>/,
  TEXT: /^[^<]+/,
  WHITE_SPACE_TRIM: /\n\s+/g,
};

const ELEMENT_REGEX_MAP = {
  [ELEMENT_TYPE.COMPONENT]: REGEX.COMPONENT_TAG,
  [ELEMENT_TYPE.OPEN]: REGEX.OPEN_TAG,
  [ELEMENT_TYPE.CLOSING]: REGEX.CLOSE_TAG,
  [ELEMENT_TYPE.TEXT]: REGEX.TEXT,
  [ELEMENT_TYPE.SELF_CLOSING]: REGEX.SELF_CLOSING_TAG,
  default: REGEX.TEXT,
};

// const OPEN_TAG_REGEX = /^<[^>\/]*>/;
// const SELF_CLOSING_TAG_REGEX = /<[^>\/]*\/>/;
// const COMPONENT_TAG_REGEX = /<:[^>\/]*\/>/;
// const CLOSE_TAG_REGEX = /^<\/\w+>/;
// const TEXT_REGEX = /^[^<]+/;
// const WHITE_SPACE_TRIM_REGEX = /\n\s+/g;

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

function getElementType(data: string): ELEMENT_TYPE {
    if (data.match(REGEX.COMPONENT_TAG)) return ELEMENT_TYPE.COMPONENT;
    if (data.match(REGEX.SELF_CLOSING_TAG)) return ELEMENT_TYPE.SELF_CLOSING;
    if (data.match(REGEX.OPEN_TAG)) return ELEMENT_TYPE.OPEN;
    if (data.match(REGEX.CLOSE_TAG)) return ELEMENT_TYPE.CLOSING;
    return ELEMENT_TYPE.TEXT;
}

const tagNameRegExp = /<\/*([\w:]+)/;
function getTagName(tag: string) {
  return tag.match(tagNameRegExp)?.[1];
}

function getElements(
  data: string = "",
  content: any[] = []
): any {
  let dataEdit = "" + data;
  while (dataEdit.length) {
    dataEdit = dataEdit.replace(REGEX.WHITE_SPACE_TRIM, "").trim();
    const elementType = getElementType(dataEdit);
    const elementRegExp: RegExp = ELEMENT_REGEX_MAP[elementType];
    const elementString: string = dataEdit.match(elementRegExp)?.[0] || "";
    dataEdit = dataEdit.replace(elementRegExp, "");
    if (!elementString.trim()) continue;
    if (elementType === ELEMENT_TYPE.SELF_CLOSING) {
      const element = {
        type: getTagName(elementString),
        attributes: getAttributes(elementString),
        selfClosing: true,
      };
      content.push(element);
      continue;
    }
    if (elementType === ELEMENT_TYPE.COMPONENT) {
      const element = {
        type: "_component",
        componentName: getTagName(elementString)?.replace(":", ''),
        componentProperties: getAttributes(elementString),
      };
      content.push(element);
      dataEdit = dataEdit.replace(elementString, "");
      continue;
    }
    if (elementType === ELEMENT_TYPE.OPEN) {
      const tagName = getTagName(elementString);
      const attributes = getAttributes(elementString);
      const elementContentData = getElements(dataEdit);
      const element = {
        type: tagName,
        attributes: attributes,
        content: elementContentData.content,
      };
      content.push(element);
      dataEdit = elementContentData.dataEdit;
      continue;
    }
    if (elementType === ELEMENT_TYPE.CLOSING) {
      return { content, dataEdit };
    }
    content.push(elementString);
  }
  return { content, dataEdit };
}

function parseSST(data: string) {
  const result = getElements(data);
  return result.content;
}

export { parseSST };
