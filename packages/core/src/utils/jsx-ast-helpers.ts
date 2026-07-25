import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import type { File, JSXElement, JSXFragment, JSXOpeningElement, JSXAttribute } from '@babel/types';
import type { DOMNode } from '../types';

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

function jsxTagName(element: JSXElement | JSXFragment): string | null {
  if (element.type === 'JSXFragment') return null;
  return element.openingElement.name.type === 'JSXIdentifier'
    ? element.openingElement.name.name
    : null;
}

/**
 * Convert a JSXElement/JSXFragment's children into the simplified DOMNode
 * representation used for cross-language DOM-size analysis. Fragments
 * (<>...</>) don't produce a DOM node of their own, so their children are
 * flattened into the caller's list; expression containers ({x}) can't be
 * resolved statically and are skipped; whitespace-only JSXText is dropped
 * so formatting doesn't inflate the node count.
 */
function jsxChildrenToDOMNodes(children: Array<JSXElement['children'][number]>): DOMNode[] {
  const result: DOMNode[] = [];

  for (const child of children) {
    if (child.type === 'JSXElement') {
      result.push(jsxElementToDOMNode(child));
    } else if (child.type === 'JSXFragment') {
      result.push(...jsxChildrenToDOMNodes(child.children));
    } else if (child.type === 'JSXText') {
      if (child.value.trim().length === 0 || !child.loc) continue;
      result.push({
        type: 'text',
        position: { line: child.loc.start.line, column: child.loc.start.column },
      });
    }
    // JSXExpressionContainer / JSXSpreadChild: dynamic content, can't
    // resolve statically - not counted.
  }

  return result;
}

function jsxElementToDOMNode(element: JSXElement): DOMNode {
  const attributes: Record<string, string> = {};
  for (const attr of element.openingElement.attributes) {
    if (attr.type === 'JSXAttribute' && attr.value?.type === 'StringLiteral') {
      attributes[attr.name.name as string] = attr.value.value;
    }
  }

  return {
    type: 'element',
    tag: jsxTagName(element) ?? undefined,
    attributes,
    children: jsxChildrenToDOMNodes(element.children),
    position: element.loc
      ? { line: element.loc.start.line, column: element.loc.start.column }
      : { line: 0, column: 0 },
  };
}

/**
 * Build the simplified DOM tree for a JSX/TSX file: every top-level (not
 * nested inside another JSX element/fragment) JSX root found anywhere in
 * the file, e.g. one per component's return statement.
 */
export function buildDOMTreeFromJSX(ast: File): DOMNode[] {
  const roots: DOMNode[] = [];

  traverse(ast, {
    JSXElement(path) {
      const isNested = path.findParent(p => p.isJSXElement() || p.isJSXFragment());
      if (!isNested) {
        roots.push(jsxElementToDOMNode(path.node));
      }
    },
  });

  return roots;
}

/**
 * Check if a JSX element has no significant attributes (only
 * className/style).
 */
function hasNoSignificantJSXAttributes(opening: JSXOpeningElement): boolean {
  const insignificant = new Set(['className', 'style']);
  return opening.attributes.every(
    attr => attr.type === 'JSXAttribute' && insignificant.has(attr.name.name as string)
  );
}

/**
 * Find <div> JSX elements that serve no purpose: a single element/fragment
 * child and no significant attributes of their own.
 */
export function findUnnecessaryJSXDivWrappers(ast: File): JSXElement[] {
  const wrappers: JSXElement[] = [];

  traverse(ast, {
    JSXElement(path) {
      const opening = path.node.openingElement;

      if (
        opening.name.type !== 'JSXIdentifier' ||
        opening.name.name !== 'div' ||
        !hasNoSignificantJSXAttributes(opening)
      ) {
        return;
      }

      const significantChildren = path.node.children.filter(
        child => !(child.type === 'JSXText' && child.value.trim().length === 0)
      );

      if (significantChildren.length === 1 && significantChildren[0].type === 'JSXElement') {
        wrappers.push(path.node);
      }
    },
  });

  return wrappers;
}
