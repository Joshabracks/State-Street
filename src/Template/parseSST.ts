enum ELEMENT_TYPE {
  OPEN,
  CLOSING,
  TEXT,
  SELF_CLOSING,
}

const REGEX = {
  OPEN_TAG: /^<[^/](?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|[^>"'`])*>/,
  SELF_CLOSING_TAG: /^<(?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|[^>"'`])*\/>/,
  CLOSE_TAG: /^<\/\w+>/,
  TEXT: /^[^<]+/,
  WHITE_SPACE_TRIM: /\n\s+/g,
  ATTRIBUTE: /([\w-]+)(?:=(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|`((?:[^`\\]|\\.)*)`))?(?=[\s/>])/g,
  EVENT: /:(\w+)=(\w+)\(((?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|[^)"'`])*)\)/g,
  PROP: /([\w-]+)\s*=\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|[^,]*)/g,
};

// Sticky (`y`) clones of the element regexes, anchored at `lastIndex` so the
// parser can scan with a moving cursor instead of slicing/replacing the string.
const STICKY = {
  SELF_CLOSING: new RegExp(REGEX.SELF_CLOSING_TAG.source.replace(/^\^/, ""), "y"),
  OPEN: new RegExp(REGEX.OPEN_TAG.source.replace(/^\^/, ""), "y"),
  CLOSE: new RegExp(REGEX.CLOSE_TAG.source.replace(/^\^/, ""), "y"),
  TEXT: new RegExp(REGEX.TEXT.source.replace(/^\^/, ""), "y"),
};

function isWhitespace(code: number): boolean {
  return code === 32 || (code >= 9 && code <= 13);
}

function getAttributes(tag: string): any[] {
  const cleanTag = tag
    .replace(/^<[\w:-]+\s*/, '')
    .replace(REGEX.EVENT, '')
    .replace(/\s+/g, ' ');
  let attributesMatch = (cleanTag && REGEX.ATTRIBUTE.exec(cleanTag)) || null;
  const attributes = [];
  while (attributesMatch !== null) {
    const attribute = {
      name: attributesMatch[1],
      value: attributesMatch[2] ?? attributesMatch[3] ?? attributesMatch[4],
    };
    attributes.push(attribute);
    attributesMatch = (cleanTag && REGEX.ATTRIBUTE.exec(cleanTag)) || null;
  }
  return attributes;
}

function parseProps(raw: string): { key: string; value: string }[] {
  const props: { key: string; value: string }[] = [];
  REGEX.PROP.lastIndex = 0;
  let m = REGEX.PROP.exec(raw);
  while (m !== null) {
    props.push({ key: m[1], value: m[2] });
    m = REGEX.PROP.exec(raw);
  }
  return props;
}

function getEvents(tag: string): any[] {
  let eventsMatch = (tag && REGEX.EVENT.exec(tag)) || null;
  const events = [];
  while (eventsMatch !== null) {
    const event = {
      type: eventsMatch[1],
      function: eventsMatch[2],
      props: parseProps(eventsMatch[3]?.trim() || ""),
    };
    events.push(event);
    eventsMatch = (tag && REGEX.EVENT.exec(tag)) || null;
  }
  return events;
}

const tagNameRegExp = /<\/*([\w:]+)/;
function getTagName(tag: string) {
  return tag.match(tagNameRegExp)?.[1];
}

// Single-pass parser: scans `data` with a moving cursor `pos` (no slicing or
// per-token re-copying of the remaining string -> O(n) instead of O(n^2)).
function getElements(data: string, components: any, pos: number, content: any[]): { content: any[]; pos: number } {
  const len = data.length;
  while (pos < len) {
    // Skip whitespace between tokens (replaces the old per-iteration .trim()).
    while (pos < len && isWhitespace(data.charCodeAt(pos))) pos++;
    if (pos >= len) break;

    let elementType: ELEMENT_TYPE;
    let match: RegExpExecArray | null;
    STICKY.SELF_CLOSING.lastIndex = pos;
    if ((match = STICKY.SELF_CLOSING.exec(data))) {
      elementType = ELEMENT_TYPE.SELF_CLOSING;
    } else {
      STICKY.OPEN.lastIndex = pos;
      if ((match = STICKY.OPEN.exec(data))) {
        elementType = ELEMENT_TYPE.OPEN;
      } else {
        STICKY.CLOSE.lastIndex = pos;
        if ((match = STICKY.CLOSE.exec(data))) {
          elementType = ELEMENT_TYPE.CLOSING;
        } else {
          STICKY.TEXT.lastIndex = pos;
          match = STICKY.TEXT.exec(data);
          elementType = ELEMENT_TYPE.TEXT;
        }
      }
    }
    if (!match) { pos++; continue; } // lone unmatched char (e.g. stray '<')
    const elementString = match[0];
    pos += elementString.length;

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
      const child = getElements(data, components, pos, []);
      content.push({
        type: tagName,
        attributes: attributes,
        events: events,
        content: child.content,
      });
      pos = child.pos;
      continue;
    }
    if (elementType === ELEMENT_TYPE.CLOSING) {
      return { content, pos };
    }
    content.push(elementString);
  }
  return { content, pos };
}

function parseSST(data: string, components: any = {}) {
  // Convert component comments (<!-- Name attrs / -->) to self-closing tags (<Name attrs />)
  let processed = data.replace(
    /<!--\s+([\w]+)((?:\s+[\w]+="[^"]*")*)\s*\/\s*-->/g,
    (_match: string, name: string, attrs: string) => components[name] ? `<${name}${attrs} />` : ''
  );
  // Strip remaining HTML comments
  processed = processed.replace(/<!--[\s\S]*?-->/g, '');
  // Collapse newline-indentation runs once up front (was applied per-token before).
  processed = processed.replace(REGEX.WHITE_SPACE_TRIM, " ");
  const result = getElements(processed, components, 0, []);
  return result.content;
}

export { parseSST };
