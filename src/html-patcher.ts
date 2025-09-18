import { Delta, PatchOptions } from './types';
import { HTMLParser, ParsedElement } from './html-parser';

export class HTMLPatcher {
  private options: PatchOptions;

  constructor(options: PatchOptions = {}) {
    this.options = options;
  }

  patch(left: string | Element, delta: Delta): string | Element {
    const leftParsed = HTMLParser.parse(left);
    const patched = this.applyDelta(leftParsed, delta);

    if (typeof left === 'string') {
      return HTMLParser.stringify(patched);
    } else {
      const htmlString = HTMLParser.stringify(patched);
      const dom = new (require('jsdom')).JSDOM(`<!DOCTYPE html><html><body>${htmlString}</body></html>`);
      return dom.window.document.body.firstChild;
    }
  }

  unpatch(right: string | Element, delta: Delta): string | Element {
    const reversedDelta = this.reverse(delta);
    return this.patch(right, reversedDelta);
  }

  reverse(delta: Delta): Delta {
    const reversed: Delta = {};

    for (const [path, change] of Object.entries(delta)) {
      if (Array.isArray(change)) {
        if (change.length === 1) {
          // Addition -> Deletion
          reversed[path] = [change[0], 0, 0];
        } else if (change.length === 2) {
          // Modification -> Reverse modification
          reversed[path] = [change[1], change[0]];
        } else if (change.length === 3 && change[2] === 0) {
          // Deletion -> Addition
          reversed[path] = [change[0]];
        } else if (change.length === 3 && change[2] === 3) {
          // Move operation - reverse the move
          reversed[path] = change; // Move operations are symmetric in this implementation
        }
      }
    }

    return reversed;
  }

  private applyDelta(obj: any, delta: Delta): any {
    const result = this.clone(obj);

    // Sort paths by depth (deeper first) to avoid conflicts
    const sortedPaths = Object.keys(delta).sort((a, b) => {
      const depthA = a.split('.').length;
      const depthB = b.split('.').length;
      return depthB - depthA;
    });

    for (const path of sortedPaths) {
      const change = delta[path];
      this.applyChange(result, path, change);
    }

    return result;
  }

  private applyChange(obj: any, path: string, change: any[]): void {
    const pathParts = path.split('.');
    let current = obj;

    // Navigate to parent object
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (current[part] === undefined) {
        current[part] = {};
      }
      current = current[part];
    }

    const lastPart = pathParts[pathParts.length - 1];

    if (Array.isArray(change)) {
      if (change.length === 1) {
        // Addition
        current[lastPart] = change[0];
      } else if (change.length === 2) {
        // Modification
        current[lastPart] = this.options.reverse ? change[0] : change[1];
      } else if (change.length === 3 && change[2] === 0) {
        // Deletion
        if (!this.options.reverse) {
          delete current[lastPart];
        } else {
          current[lastPart] = change[0];
        }
      } else if (change.length === 3 && change[2] === 3) {
        // Move operation (simplified - would need more complex logic for full array moves)
        const sourceIndex = change[1];
        const targetIndex = parseInt(lastPart.replace('_', ''));

        if (Array.isArray(current) && sourceIndex < current.length) {
          const item = current.splice(sourceIndex, 1)[0];
          current.splice(targetIndex, 0, item);
        }
      }
    }
  }

  private clone(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.clone(item));
    }

    const cloned: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.clone(obj[key]);
      }
    }

    return cloned;
  }
}