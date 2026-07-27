import * as parse5 from 'parse5';
import * as prettier from 'prettier';
import type { DefaultTreeAdapterMap } from 'parse5';
import type { DOMNode } from '../types';

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

/**
 * Convert parse5 child nodes into the simplified DOMNode representation
 * used for cross-language DOM-size analysis. Synthetic nodes (e.g. an
 * auto-inserted <html>/<head>/<body> not actually present in the source)
 * are flattened rather than counted; whitespace-only text nodes are
 * dropped so formatting doesn't inflate the node count.
 */
export function parse5ToDOMNodes(nodes: ChildNode[]): DOMNode[] {
  const result: DOMNode[] = [];

  for (const node of nodes) {
    if (isElement(node)) {
      if (!node.sourceCodeLocation) {
        // Synthetic node not present in the original source - flatten.
        if (node.childNodes) {
          result.push(...parse5ToDOMNodes(node.childNodes));
        }
        continue;
      }

      const attributes: Record<string, string> = {};
      for (const attr of node.attrs) {
        attributes[attr.name] = attr.value;
      }

      result.push({
        type: 'element',
        tag: node.tagName,
        attributes,
        children: node.childNodes ? parse5ToDOMNodes(node.childNodes) : [],
        position: {
          line: node.sourceCodeLocation.startLine,
          column: node.sourceCodeLocation.startCol,
        },
      });
    } else if (isTextNode(node)) {
      if (node.value.trim().length === 0 || !node.sourceCodeLocation) {
        continue;
      }

      result.push({
        type: 'text',
        position: {
          line: node.sourceCodeLocation.startLine,
          column: node.sourceCodeLocation.startCol,
        },
      });
    }
  }

  return result;
}

/**
 * Build the simplified DOM tree for an entire parsed document.
 */
export function buildDOMTreeFromHTML(ast: Document): DOMNode[] {
  return parse5ToDOMNodes(ast.childNodes);
}

/**
 * Check if an element has no significant attributes (only class/style).
 */
function hasNoSignificantAttributes(element: Element): boolean {
  const insignificant = new Set(['class', 'style']);
  return element.attrs.every(attr => insignificant.has(attr.name));
}

/**
 * Find <div> elements that serve no purpose: a single element child and
 * no significant attributes of their own.
 */
export function findUnnecessaryDivWrappers(ast: Document): Element[] {
  const wrappers: Element[] = [];

  traverse(ast, (element) => {
    if (element.tagName !== 'div' || !hasNoSignificantAttributes(element)) {
      return;
    }

    const significantChildren = (element.childNodes || []).filter(
      child => !(isTextNode(child) && child.value.trim().length === 0)
    );

    if (significantChildren.length === 1 && isElement(significantChildren[0])) {
      wrappers.push(element);
    }
  });

  return wrappers;
}
