import htmlDiffPatch, { diff, patch, unpatch, reverse, clone, create } from '../src/index';

describe('HTMLDiffPatch', () => {
  describe('basic diff functionality', () => {
    it('should detect no changes when HTML is identical', () => {
      const left = '<div>Hello World</div>';
      const right = '<div>Hello World</div>';
      const delta = diff(left, right);
      expect(delta).toBeUndefined();
    });

    it('should detect text changes', () => {
      const left = '<div>Hello World</div>';
      const right = '<div>Hello Universe</div>';
      const delta = diff(left, right);
      expect(delta).toBeDefined();
      expect(delta).toHaveProperty('children.0');
    });

    it('should detect attribute changes', () => {
      const left = '<div class="old">Hello</div>';
      const right = '<div class="new">Hello</div>';
      const delta = diff(left, right);
      expect(delta).toBeDefined();
      expect(delta).toHaveProperty('attributes.class');
    });

    it('should detect element additions', () => {
      const left = '<div>Hello</div>';
      const right = '<div>Hello<span>World</span></div>';
      const delta = diff(left, right);
      expect(delta).toBeDefined();
    });

    it('should detect element removals', () => {
      const left = '<div>Hello<span>World</span></div>';
      const right = '<div>Hello</div>';
      const delta = diff(left, right);
      expect(delta).toBeDefined();
    });
  });

  describe('patch functionality', () => {
    it('should apply patches correctly', () => {
      const left = '<div>Hello World</div>';
      const right = '<div>Hello Universe</div>';
      const delta = diff(left, right);

      if (delta) {
        const patched = patch(left, delta);
        expect(patched).toContain('Universe');
      }
    });

    it('should handle reverse patches', () => {
      const left = '<div>Hello World</div>';
      const right = '<div>Hello Universe</div>';
      const delta = diff(left, right);

      if (delta) {
        const reversedDelta = reverse(delta);
        const unpatched = patch(right, reversedDelta);
        expect(unpatched).toContain('World');
      }
    });

    it('should support unpatch operation', () => {
      const left = '<div>Hello World</div>';
      const right = '<div>Hello Universe</div>';
      const delta = diff(left, right);

      if (delta) {
        const original = unpatch(right, delta);
        expect(original).toContain('World');
      }
    });
  });

  describe('utility functions', () => {
    it('should clone objects correctly', () => {
      const obj = { tagName: 'div', attributes: { class: 'test' }, children: [] };
      const cloned = clone(obj);
      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
    });

    it('should create custom instances with options', () => {
      const customInstance = create({
        objectHash: (obj) => JSON.stringify(obj),
        arrays: { detectMove: false }
      });

      expect(customInstance).toBeDefined();
      expect(typeof customInstance.diff).toBe('function');
      expect(typeof customInstance.patch).toBe('function');
    });
  });

  describe('jsondiffpatch compatibility', () => {
    it('should have the same interface as jsondiffpatch', () => {
      expect(typeof htmlDiffPatch.diff).toBe('function');
      expect(typeof htmlDiffPatch.patch).toBe('function');
      expect(typeof htmlDiffPatch.unpatch).toBe('function');
      expect(typeof htmlDiffPatch.reverse).toBe('function');
      expect(typeof htmlDiffPatch.clone).toBe('function');
    });

    it('should support named exports', () => {
      expect(typeof diff).toBe('function');
      expect(typeof patch).toBe('function');
      expect(typeof unpatch).toBe('function');
      expect(typeof reverse).toBe('function');
      expect(typeof clone).toBe('function');
    });

    it('should support create function', () => {
      expect(typeof create).toBe('function');
      const instance = create();
      expect(instance).toBeDefined();
    });
  });

  describe('complex HTML scenarios', () => {
    it('should handle nested elements', () => {
      const left = '<div><p>Hello</p><span>World</span></div>';
      const right = '<div><p>Hi</p><span>Universe</span></div>';
      const delta = diff(left, right);
      expect(delta).toBeDefined();

      if (delta) {
        const patched = patch(left, delta);
        expect(patched).toContain('Hi');
        expect(patched).toContain('Universe');
      }
    });

    it('should handle mixed content', () => {
      const left = '<div>Text<span>Element</span>More text</div>';
      const right = '<div>New text<span>New element</span>Final text</div>';
      const delta = diff(left, right);
      expect(delta).toBeDefined();
    });

    it('should handle empty elements', () => {
      const left = '<div></div>';
      const right = '<div><span>Content</span></div>';
      const delta = diff(left, right);
      expect(delta).toBeDefined();

      if (delta) {
        const patched = patch(left, delta);
        expect(patched).toContain('<span>Content</span>');
      }
    });
  });
});