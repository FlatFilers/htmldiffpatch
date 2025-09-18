import { HTMLDiffPatch, Delta, DiffOptions, PatchOptions } from './types';
import { HTMLDiffer } from './html-differ';
import { HTMLPatcher } from './html-patcher';

export class HTMLDiffPatchImpl implements HTMLDiffPatch {
  private differ: HTMLDiffer;
  private patcher: HTMLPatcher;

  constructor(options: DiffOptions = {}) {
    this.differ = new HTMLDiffer(options);
    this.patcher = new HTMLPatcher();
  }

  diff(left: string | Element, right: string | Element, options?: DiffOptions): Delta | undefined {
    if (options) {
      const differ = new HTMLDiffer(options);
      return differ.diff(left, right);
    }
    return this.differ.diff(left, right);
  }

  patch(left: string | Element, delta: Delta, options?: PatchOptions): string | Element {
    if (options) {
      const patcher = new HTMLPatcher(options);
      return patcher.patch(left, delta);
    }
    return this.patcher.patch(left, delta);
  }

  unpatch(right: string | Element, delta: Delta): string | Element {
    return this.patcher.unpatch(right, delta);
  }

  reverse(delta: Delta): Delta {
    return this.patcher.reverse(delta);
  }

  clone(value: any): any {
    if (value === null || typeof value !== 'object') {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map(item => this.clone(item));
    }

    const cloned: any = {};
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        cloned[key] = this.clone(value[key]);
      }
    }

    return cloned;
  }
}

// Create default instance
const htmlDiffPatch = new HTMLDiffPatchImpl();

// Export default instance and class
export default htmlDiffPatch;
export { Delta, DiffOptions, PatchOptions };

// Named exports for compatibility
export const diff = htmlDiffPatch.diff.bind(htmlDiffPatch);
export const patch = htmlDiffPatch.patch.bind(htmlDiffPatch);
export const unpatch = htmlDiffPatch.unpatch.bind(htmlDiffPatch);
export const reverse = htmlDiffPatch.reverse.bind(htmlDiffPatch);
export const clone = htmlDiffPatch.clone.bind(htmlDiffPatch);

// Create function for custom instances (jsondiffpatch compatibility)
export function create(options?: DiffOptions): HTMLDiffPatch {
  return new HTMLDiffPatchImpl(options);
}