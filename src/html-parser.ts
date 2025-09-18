import { JSDOM } from 'jsdom';

export interface ParsedElement {
  tagName: string;
  attributes: Record<string, string>;
  children: (ParsedElement | string)[];
  textContent?: string;
}

export class HTMLParser {
  static parse(html: string | Element): ParsedElement {
    if (typeof html === 'string') {
      const dom = new JSDOM(`<!DOCTYPE html><html><body>${html}</body></html>`);
      const body = dom.window.document.body;
      return this.elementToObject(body.firstChild as Element);
    } else {
      return this.elementToObject(html);
    }
  }

  static stringify(obj: ParsedElement): string {
    if (obj.textContent !== undefined) {
      return obj.textContent;
    }

    const attrs = Object.entries(obj.attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');

    const attrString = attrs ? ` ${attrs}` : '';

    if (obj.children.length === 0) {
      return `<${obj.tagName}${attrString}/>`;
    }

    const childrenString = obj.children
      .map(child => typeof child === 'string' ? child : this.stringify(child))
      .join('');

    return `<${obj.tagName}${attrString}>${childrenString}</${obj.tagName}>`;
  }

  private static elementToObject(element: Element | Node): ParsedElement {
    if (element.nodeType === 3) { // Text node
      return {
        tagName: '#text',
        attributes: {},
        children: [],
        textContent: element.textContent || ''
      };
    }

    if (element.nodeType !== 1) { // Not an element node
      return {
        tagName: '#unknown',
        attributes: {},
        children: [],
        textContent: element.textContent || ''
      };
    }

    const el = element as Element;
    const attributes: Record<string, string> = {};

    for (let i = 0; i < el.attributes.length; i++) {
      const attr = el.attributes[i];
      attributes[attr.name] = attr.value;
    }

    const children: (ParsedElement | string)[] = [];
    for (let i = 0; i < el.childNodes.length; i++) {
      const child = el.childNodes[i];
      if (child.nodeType === 3 && child.textContent?.trim()) {
        children.push(child.textContent);
      } else if (child.nodeType === 1) {
        children.push(this.elementToObject(child));
      }
    }

    return {
      tagName: el.tagName.toLowerCase(),
      attributes,
      children
    };
  }
}