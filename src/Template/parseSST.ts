enum ELEMENT_TYPE {
  OPEN,
  CLOSING,
  TEXT,
  SELF_CLOSING,
}

const REGEX = {
  OPEN_TAG: /^<[^/]{1}[^>]*>/,
  SELF_CLOSING_TAG: /^<[^>]*\/>/,
  CLOSE_TAG: /^<\/\w+>/,
  TEXT: /^[^<]+/,
  WHITE_SPACE_TRIM: /\n\s+/g,
  ATTRIBUTE: /(\w+)=["'`]([\S\s]*?)["'`](?=\s\w+="|\s{0,1}\/>|\s*>$)/g,
  EVENT: /:(\w+)=(\w+)\(([^)]*)\)/g,
};

const ELEMENT_REGEX_MAP = {
  [ELEMENT_TYPE.OPEN]: REGEX.OPEN_TAG,
  [ELEMENT_TYPE.CLOSING]: REGEX.CLOSE_TAG,
  [ELEMENT_TYPE.TEXT]: REGEX.TEXT,
  [ELEMENT_TYPE.SELF_CLOSING]: REGEX.SELF_CLOSING_TAG,
  default: REGEX.TEXT,
};

function getAttributes(tag: string): any[] {
  const cleanTag = tag.replace(REGEX.EVENT, '').replace(/\s+/g, ' ')
  let attributesMatch = (tag && REGEX.ATTRIBUTE.exec(cleanTag)) || null;
  const attributes = [];
  while (attributesMatch !== null) {
    const attribute = {
      name: attributesMatch[1],
      value: attributesMatch[2],
    };
    attributes.push(attribute);
    attributesMatch = (cleanTag && REGEX.ATTRIBUTE.exec(cleanTag)) || null;
  }
  return attributes;
}

function getEvents(tag: string): any[] {
  let eventsMatch = (tag && REGEX.EVENT.exec(tag)) || null;
  const events = [];
  while (eventsMatch !== null) {
    const event = {
      type: eventsMatch[1],
      function: eventsMatch[2],
      props: eventsMatch[3]?.split(",") || [],
    };
    events.push(event);
    eventsMatch = (tag && REGEX.EVENT.exec(tag)) || null;
  }
  return events;
}

function getElementType(data: string): ELEMENT_TYPE {
  if (data.match(REGEX.SELF_CLOSING_TAG)) return ELEMENT_TYPE.SELF_CLOSING;
  if (data.match(REGEX.OPEN_TAG)) return ELEMENT_TYPE.OPEN;
  if (data.match(REGEX.CLOSE_TAG)) return ELEMENT_TYPE.CLOSING;
  return ELEMENT_TYPE.TEXT;
}

const tagNameRegExp = /<\/*([\w:]+)/;
function getTagName(tag: string) {
  return tag.match(tagNameRegExp)?.[1];
}

function getElements(data: string = "", components: any = {}, content: any[] = []): any {
  let dataEdit = "" + data;
  while (dataEdit.length) {
    dataEdit = dataEdit.replace(REGEX.WHITE_SPACE_TRIM, " ").trim();
    const elementType = getElementType(dataEdit);
    const elementRegExp: RegExp = ELEMENT_REGEX_MAP[elementType];
    const elementString: string = dataEdit.match(elementRegExp)?.[0] || "";
    dataEdit = dataEdit.replace(elementRegExp, "");
    if (!elementString.trim()) continue;
    if (elementType === ELEMENT_TYPE.SELF_CLOSING) {
      const tagName: string = getTagName(elementString) || '';
      const isComponent = components[tagName.trim()] ? true : false;
      const element: any = {
        type: isComponent ? '_component' : tagName,
        events: getEvents(elementString),
        selfClosing: true,
      };
      if (isComponent) {
        element.componentName = tagName;
        element.componentProperties = getAttributes(elementString).reduce((res, val) => {
          res[val.name] = val.value;
          return res;
        }, {});
        dataEdit = dataEdit.replace(elementString, "");
      } else {
        element.attributes = getAttributes(elementString);
      }
      content.push(element);
      continue;
    }
    if (elementType === ELEMENT_TYPE.OPEN) {
      const tagName = getTagName(elementString);
      const attributes = getAttributes(elementString);
      const events = getEvents(elementString);
      const elementContentData = getElements(dataEdit, components);
      const element = {
        type: tagName,
        attributes: attributes,
        events: events,
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

function parseSST(data: string, components: any = {}) {
  const result = getElements(data, components);
  return result.content;
}

export { parseSST };
