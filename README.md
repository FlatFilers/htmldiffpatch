# HTMLDiffPatch

HTML diffing and patching using the same interfaces as jsondiffpatch.

## Installation

```bash
npm install htmldiffpatch
```

## Usage

### Basic Usage

```javascript
import htmlDiffPatch from 'htmldiffpatch';

const left = '<div>Hello World</div>';
const right = '<div>Hello Universe</div>';

// Create a diff
const delta = htmlDiffPatch.diff(left, right);

// Apply the diff
const patched = htmlDiffPatch.patch(left, delta);
// Result: '<div>Hello Universe</div>'

// Reverse a diff
const reversed = htmlDiffPatch.reverse(delta);
const original = htmlDiffPatch.patch(right, reversed);
// Result: '<div>Hello World</div>'
```

### Named Exports

```javascript
import { diff, patch, unpatch, reverse, clone } from 'htmldiffpatch';

const left = '<div class="old">Content</div>';
const right = '<div class="new">Content</div>';

const delta = diff(left, right);
const result = patch(left, delta);
```

### Custom Configuration

```javascript
import { create } from 'htmldiffpatch';

const customDiffPatch = create({
  objectHash: (obj, index) => {
    // Custom hash function for object comparison
    return obj.id || String(index);
  },
  arrays: {
    detectMove: true,
    includeValueOnMove: false
  }
});

const delta = customDiffPatch.diff(leftHtml, rightHtml);
```

### Working with DOM Elements

```javascript
import { diff, patch } from 'htmldiffpatch';

// Works with DOM elements too
const leftElement = document.getElementById('left');
const rightElement = document.getElementById('right');

const delta = diff(leftElement, rightElement);
const patchedElement = patch(leftElement, delta);
```

## API

### diff(left, right, options?)

Creates a diff between two HTML strings or DOM elements.

- `left`: Source HTML string or DOM element
- `right`: Target HTML string or DOM element
- `options`: Optional configuration object

Returns a delta object representing the differences, or `undefined` if no changes.

### patch(left, delta, options?)

Applies a delta to an HTML string or DOM element.

- `left`: Source HTML string or DOM element
- `delta`: Delta object from `diff()`
- `options`: Optional configuration object

Returns the patched HTML string or DOM element.

### unpatch(right, delta)

Reverses a patch operation.

- `right`: The result of a patch operation
- `delta`: The original delta used for patching

Returns the original HTML before patching.

### reverse(delta)

Creates a reversed delta that undoes the original changes.

- `delta`: Delta object to reverse

Returns a new delta object.

### clone(value)

Deep clones a value.

- `value`: Value to clone

Returns a deep copy of the value.

### create(options?)

Creates a new HTMLDiffPatch instance with custom options.

- `options`: Configuration object

Returns a new HTMLDiffPatch instance.

## Options

### DiffOptions

```javascript
{
  objectHash: (obj, index) => string,  // Custom hash function
  arrays: {
    detectMove: boolean,               // Detect array element moves
    includeValueOnMove: boolean        // Include values when moving
  },
  textDiff: {
    minLength: number                  // Minimum length for text diffing
  },
  propertyFilter: (name, context) => boolean,  // Filter properties
  cloneDiffValues: boolean             // Clone values in diff
}
```

### PatchOptions

```javascript
{
  reverse: boolean  // Apply patch in reverse
}
```

## Features

- **jsondiffpatch compatibility**: Same API and interfaces
- **HTML-aware**: Understands HTML structure, attributes, and text content
- **DOM support**: Works with both strings and DOM elements
- **Move detection**: Can detect when elements are moved rather than deleted/added
- **TypeScript**: Full TypeScript support with type definitions
- **Extensible**: Configurable with custom hash functions and options

## License

MIT