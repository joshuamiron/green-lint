import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import type { File, JSXElement, JSXOpeningElement, JSXAttribute } from '@babel/types';

// @babel/traverse's CJS/ESM interop puts the callable on .default under esModuleInterop.
const traverse: typeof _traverse = (_traverse as unknown as { default: typeof _traverse }).default || _traverse;

/**
 * An <img> JSXElement found in the source, along with its direct parent's
 * tag name (used to detect e.g. an existing <picture> wrapper).
 */
export interface JSXImage {
  element: JSXElement;
  openingElement: JSXOpeningElement;
  parentTag: string | null;
}

/**
 * Parse JSX/TSX source into a Babel AST.
 */
export function parseJSX(code: string, isTypeScript: boolean): File {
  return parse(code, {
    sourceType: 'module',
    plugins: isTypeScript ? ['jsx', 'typescript'] : ['jsx'],
  });
}

/**
 * Find all <img> elements in a JSX/TSX AST.
 */
export function findAllJSXImages(ast: File): JSXImage[] {
  const images: JSXImage[] = [];

  traverse(ast, {
    JSXElement(path) {
      const opening = path.node.openingElement;

      if (opening.name.type === 'JSXIdentifier' && opening.name.name === 'img') {
        const parentPath = path.findParent(p => p.isJSXElement());
        let parentTag: string | null = null;

        if (parentPath && parentPath.isJSXElement()) {
          const parentOpening = (parentPath.node as JSXElement).openingElement;
          if (parentOpening.name.type === 'JSXIdentifier') {
            parentTag = parentOpening.name.name;
          }
        }

        images.push({ element: path.node, openingElement: opening, parentTag });
      }
    },
  });

  return images;
}

/**
 * Get a JSX attribute's literal string value. Returns undefined if the
 * attribute is absent, or its value is a dynamic expression (e.g. src={x})
 * that can't be resolved statically.
 */
export function getJSXAttribute(opening: JSXOpeningElement, name: string): string | undefined {
  const attr = opening.attributes.find(
    (a): a is JSXAttribute => a.type === 'JSXAttribute' && a.name.name === name
  );

  if (!attr || !attr.value) return undefined;
  if (attr.value.type === 'StringLiteral') return attr.value.value;
  return undefined;
}

/**
 * Get the source location of a JSX opening element.
 */
export function getJSXLocation(opening: JSXOpeningElement): { line: number; column: number } | null {
  if (!opening.loc) return null;
  return { line: opening.loc.start.line, column: opening.loc.start.column };
}

/**
 * Character offset at which to splice a new attribute into an opening tag,
 * e.g. `<img src="x" |/>` (after the last attribute) or `<img| />` (after
 * the tag name, if there are no attributes yet).
 */
export function jsxOpeningTagInsertionOffset(opening: JSXOpeningElement): number {
  if (opening.attributes.length > 0) {
    const last = opening.attributes[opening.attributes.length - 1];
    return last.end!;
  }
  return opening.name.end!;
}
