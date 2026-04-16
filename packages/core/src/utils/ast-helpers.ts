import * as parse5 from 'parse5';
import * as prettier from 'prettier';
import type { DefaultTreeAdapterMap } from 'parse5';

type Element = DefaultTreeAdapterMap['element'];
type Node = DefaultTreeAdapterMap['node'];
type Document = DefaultTreeAdapterMap['document'];
type DocumentFragment = DefaultTreeAdapterMap['documentFragment'];
type TextNode = DefaultTreeAdapterMap['textNode'];
type ChildNode = DefaultTreeAdapterMap['childNode'];
type ParentNode = DefaultTreeAdapterMap['parentNode'];

/**
 * Parse HTML into AST
 */
export function parseHTML(html: string): Document {
  return parse5.parse(html, {
    sourceCodeLocationInfo: true, // This gives us line/column positions!
  });
}

/**
 * Serialize AST back to HTML with proper formatting
 */
export async function serializeHTML(ast: Document): Promise<string> {
  const rawHTML = parse5.serialize(ast);

  console.log('Attempting to format HTML with prettier...');
  console.log('Raw HTML length:', rawHTML.length);

  // Format with prettier (async in v3+)
  try {
    const formatted = await prettier.format(rawHTML, {
      parser: 'html',
      printWidth: 100,
      tabWidth: 2,
      useTabs: false,
    });
    
    console.log('Formatted HTML length:', formatted.length);
    console.log('First 200 chars of formatted:', formatted.substring(0, 200));
    console.log('Prettier formatting successful!');

    return formatted;

  } catch (error) {
    // If formatting fails, return raw HTML
    console.error('Prettier formatting failed:', error);
    return rawHTML;
  }
}

/**
 * Check if node is an Element
 */
export function isElement(node: Node): node is Element {
  return 'tagName' in node;
}

/**
 * Check if node is a Text node
 */
export function isTextNode(node: Node): node is TextNode {
  return 'value' in node && !('tagName' in node);
}

/**
 * Get attribute value from element
 */
export function getAttribute(element: Element, name: string): string | undefined {
  const attr = element.attrs.find(a => a.name === name);
  return attr?.value;
}

/**
 * Set attribute on element
 */
export function setAttribute(element: Element, name: string, value: string): void {
  const existingIndex = element.attrs.findIndex(a => a.name === name);
  
  if (existingIndex >= 0) {
    element.attrs[existingIndex].value = value;
  } else {
    element.attrs.push({ name, value });
  }
}

/**
 * Traverse AST and call visitor for each element
 */
export function traverse(
  node: Node,
  visitor: (node: Element, parent: ParentNode | null) => void,
  parent: ParentNode | null = null
): void {
  if (isElement(node)) {
    visitor(node, parent);
    
    if (node.childNodes) {
      for (const child of node.childNodes) {
        traverse(child, visitor, node);
      }
    }
  } else if ('childNodes' in node && node.childNodes) {
    // Document or fragment
    for (const child of node.childNodes) {
      traverse(child, visitor, node as ParentNode);
    }
  }
}

/**
 * Find all elements matching a predicate
 */
export function findAll(
  node: Node,
  predicate: (element: Element) => boolean
): Element[] {
  const results: Element[] = [];
  
  traverse(node, (element) => {
    if (predicate(element)) {
      results.push(element);
    }
  });
  
  return results;
}

/**
 * Find all <img> elements
 */
export function findAllImages(ast: Document): Element[] {
  return findAll(ast, (element) => element.tagName === 'img');
}

/**
 * Check if element has a parent with given tag name
 */
export function hasParentWithTag(
  element: Element,
  tagName: string,
  ast: Document
): boolean {
  let found = false;
  
  traverse(ast, (node, parent) => {
    if (node === element && parent && isElement(parent) && parent.tagName === tagName) {
      found = true;
    }
  });
  
  return found;
}

/**
 * Create a new element
 */
export function createElement(
  tagName: string,
  attrs: Array<{ name: string; value: string }> = [],
  children: ChildNode[] = []
): Element {
  return {
    nodeName: tagName,
    tagName: tagName,
    attrs: attrs,
    namespaceURI: parse5.html.NS.HTML,
    childNodes: children,
    parentNode: null, // FIX: Add parentNode (will be set when inserted into tree)
  };
}

/**
 * Wrap an element with another element
 */
export function wrapElement(
  ast: Document,
  elementToWrap: Element,
  wrapperTag: string,
  wrapperAttrs: Array<{ name: string; value: string }> = []
): Element {
  let wrapper: Element | null = null;
  
  traverse(ast, (node, parent) => {
    if (node === elementToWrap && parent && 'childNodes' in parent) {
      // Create wrapper with the element as child
      wrapper = createElement(wrapperTag, wrapperAttrs, [elementToWrap as ChildNode]);
      
      // Replace child in parent
      const index = parent.childNodes.indexOf(elementToWrap as ChildNode);
      if (index >= 0) {
        parent.childNodes[index] = wrapper as ChildNode;
      }
    }
  });
  
  return wrapper!;
}

/**
 * Insert element before another element
 */
export function insertBefore(
  ast: Document,
  referenceElement: Element,
  newElement: Element
): void {
  traverse(ast, (node, parent) => {
    if (node === referenceElement && parent && 'childNodes' in parent) {
      const index = parent.childNodes.indexOf(referenceElement as ChildNode);
      if (index >= 0) {
        parent.childNodes.splice(index, 0, newElement as ChildNode);
      }
    }
  });
}

/**
 * Get source location of element (line/column)
 */
export function getLocation(element: Element): { line: number; column: number } | null {
  if (element.sourceCodeLocation) {
    return {
      line: element.sourceCodeLocation.startLine,
      column: element.sourceCodeLocation.startCol,
    };
  }
  return null;
}