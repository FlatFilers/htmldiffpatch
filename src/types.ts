export interface Delta {
  [key: string]: any;
}

export interface DiffOptions {
  objectHash?: (obj: any, index?: number) => string;
  arrays?: {
    detectMove?: boolean;
    includeValueOnMove?: boolean;
  };
  textDiff?: {
    minLength?: number;
  };
  propertyFilter?: (name: string, context: any) => boolean;
  cloneDiffValues?: boolean;
}

export interface PatchOptions {
  reverse?: boolean;
}

export interface HTMLDiffPatch {
  diff(left: string | Element, right: string | Element, options?: DiffOptions): Delta | undefined;
  patch(left: string | Element, delta: Delta, options?: PatchOptions): string | Element;
  unpatch(right: string | Element, delta: Delta): string | Element;
  reverse(delta: Delta): Delta;
  clone(value: any): any;
}