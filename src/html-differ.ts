import { Delta, DiffOptions } from './types';
import { HTMLParser, ParsedElement } from './html-parser';

export class HTMLDiffer {
  private options: DiffOptions;

  constructor(options: DiffOptions = {}) {
    this.options = {
      objectHash: options.objectHash || this.defaultObjectHash,
      arrays: {
        detectMove: options.arrays?.detectMove ?? true,
        includeValueOnMove: options.arrays?.includeValueOnMove ?? false,
        ...options.arrays
      },
      textDiff: {
        minLength: options.textDiff?.minLength ?? 60,
        ...options.textDiff
      },
      ...options
    };
  }

  diff(left: string | Element, right: string | Element): Delta | undefined {
    const leftParsed = HTMLParser.parse(left);
    const rightParsed = HTMLParser.parse(right);

    const delta = this.diffObjects(leftParsed, rightParsed);
    return Object.keys(delta).length === 0 ? undefined : delta;
  }

  private diffObjects(left: any, right: any, path: string = ''): Delta {
    const delta: Delta = {};

    if (this.isEqual(left, right)) {
      return delta;
    }

    if (left === undefined) {
      delta[path] = [right];
      return delta;
    }

    if (right === undefined) {
      delta[path] = [left, 0, 0];
      return delta;
    }

    if (typeof left !== typeof right || this.getType(left) !== this.getType(right)) {
      delta[path] = [left, right];
      return delta;
    }

    if (typeof left === 'string') {
      if (left !== right) {
        delta[path] = [left, right];
      }
      return delta;
    }

    if (Array.isArray(left) && Array.isArray(right)) {
      return this.diffArrays(left, right, path);
    }

    if (typeof left === 'object' && typeof right === 'object') {
      const allKeys = new Set([...Object.keys(left), ...Object.keys(right)]);

      for (const key of allKeys) {
        const newPath = path ? `${path}.${key}` : key;
        const leftValue = left[key];
        const rightValue = right[key];

        if (leftValue === undefined) {
          delta[newPath] = [rightValue];
        } else if (rightValue === undefined) {
          delta[newPath] = [leftValue, 0, 0];
        } else if (!this.isEqual(leftValue, rightValue)) {
          const childDelta = this.diffObjects(leftValue, rightValue, newPath);
          Object.assign(delta, childDelta);
        }
      }
    }

    return delta;
  }

  private diffArrays(left: any[], right: any[], path: string): Delta {
    const delta: Delta = {};

    if (this.options.arrays?.detectMove) {
      return this.diffArraysWithMove(left, right, path);
    }

    const maxLength = Math.max(left.length, right.length);

    for (let i = 0; i < maxLength; i++) {
      const leftItem = i < left.length ? left[i] : undefined;
      const rightItem = i < right.length ? right[i] : undefined;
      const itemPath = path ? `${path}.${i}` : String(i);

      if (leftItem === undefined) {
        delta[itemPath] = [rightItem];
      } else if (rightItem === undefined) {
        delta[itemPath] = [leftItem, 0, 0];
      } else if (!this.isEqual(leftItem, rightItem)) {
        const childDelta = this.diffObjects(leftItem, rightItem, itemPath);
        Object.assign(delta, childDelta);
      }
    }

    return delta;
  }

  private diffArraysWithMove(left: any[], right: any[], path: string): Delta {
    const delta: Delta = {};
    const leftHashes = left.map((item, index) => ({ item, hash: this.options.objectHash!(item, index), index }));
    const rightHashes = right.map((item, index) => ({ item, hash: this.options.objectHash!(item, index), index }));

    const rightHashMap = new Map(rightHashes.map(({ hash, index }) => [hash, index]));
    const leftHashMap = new Map(leftHashes.map(({ hash, index }) => [hash, index]));

    const processed = new Set<number>();

    for (let rightIndex = 0; rightIndex < right.length; rightIndex++) {
      const rightHash = rightHashes[rightIndex].hash;
      const leftIndex = leftHashMap.get(rightHash);

      if (leftIndex !== undefined && !processed.has(leftIndex)) {
        processed.add(leftIndex);

        if (leftIndex !== rightIndex) {
          const itemPath = path ? `${path}._${rightIndex}` : `_${rightIndex}`;
          delta[itemPath] = ['', leftIndex, 3]; // Move operation
        }

        if (!this.isEqual(left[leftIndex], right[rightIndex])) {
          const itemPath = path ? `${path}.${rightIndex}` : String(rightIndex);
          const childDelta = this.diffObjects(left[leftIndex], right[rightIndex], itemPath);
          Object.assign(delta, childDelta);
        }
      } else {
        const itemPath = path ? `${path}.${rightIndex}` : String(rightIndex);
        delta[itemPath] = [right[rightIndex]]; // Addition
      }
    }

    for (let leftIndex = 0; leftIndex < left.length; leftIndex++) {
      if (!processed.has(leftIndex)) {
        const itemPath = path ? `${path}._${leftIndex}` : `_${leftIndex}`;
        delta[itemPath] = [left[leftIndex], 0, 0]; // Deletion
      }
    }

    return delta;
  }

  private isEqual(left: any, right: any): boolean {
    if (left === right) return true;
    if (left === null || right === null) return false;
    if (typeof left !== typeof right) return false;

    if (Array.isArray(left) && Array.isArray(right)) {
      if (left.length !== right.length) return false;
      return left.every((item, index) => this.isEqual(item, right[index]));
    }

    if (typeof left === 'object') {
      const leftKeys = Object.keys(left);
      const rightKeys = Object.keys(right);
      if (leftKeys.length !== rightKeys.length) return false;
      return leftKeys.every(key => this.isEqual(left[key], right[key]));
    }

    return false;
  }

  private getType(value: any): string {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  }

  private defaultObjectHash(obj: any, index?: number): string {
    if (typeof obj === 'string') return obj;
    if (typeof obj === 'number') return String(obj);
    if (obj && typeof obj === 'object') {
      if (obj.tagName) {
        const attrs = Object.entries(obj.attributes || {})
          .sort()
          .map(([k, v]) => `${k}="${v}"`)
          .join(' ');
        return `<${obj.tagName} ${attrs}>`;
      }
      return JSON.stringify(obj);
    }
    return String(index || 0);
  }
}