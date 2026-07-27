import type { DefaultTreeAdapterMap } from 'parse5';
import type { DOMNode } from '../types';
type Element = DefaultTreeAdapterMap['element'];
type Node = DefaultTreeAdapterMap['node'];
type Document = DefaultTreeAdapterMap['document'];
type TextNode = DefaultTreeAdapterMap['textNode'];
type ChildNode = DefaultTreeAdapterMap['childNode'];
type ParentNode = DefaultTreeAdapterMap['parentNode'];
/**
 * Parse HTML into AST
 */
export declare function parseHTML(html: string): Document;
/**
 * Serialize AST back to HTML with proper formatting
 */
export declare function serializeHTML(ast: Document): Promise<string>;
/**
 * Check if node is an Element
 */
export declare function isElement(node: Node): node is Element;
/**
 * Check if node is a Text node
 */
export declare function isTextNode(node: Node): node is TextNode;
/**
 * Get attribute value from element
 */
export declare function getAttribute(element: Element, name: string): string | undefined;
/**
 * Set attribute on element
 */
export declare function setAttribute(element: Element, name: string, value: string): void;
/**
 * Traverse AST and call visitor for each element
 */
export declare function traverse(node: Node, visitor: (node: Element, parent: ParentNode | null) => void, parent?: ParentNode | null): void;
/**
 * Find all elements matching a predicate
 */
export declare function findAll(node: Node, predicate: (element: Element) => boolean): Element[];
/**
 * Find all <img> elements
 */
export declare function findAllImages(ast: Document): Element[];
/**
 * Check if element has a parent with given tag name
 */
export declare function hasParentWithTag(element: Element, tagName: string, ast: Document): boolean;
/**
 * Create a new element
 */
export declare function createElement(tagName: string, attrs?: Array<{
    name: string;
    value: string;
}>, children?: ChildNode[]): Element;
/**
 * Wrap an element with another element
 */
export declare function wrapElement(ast: Document, elementToWrap: Element, wrapperTag: string, wrapperAttrs?: Array<{
    name: string;
    value: string;
}>): Element;
/**
 * Insert element before another element
 */
export declare function insertBefore(ast: Document, referenceElement: Element, newElement: Element): void;
/**
 * Get source location of element (line/column)
 */
export declare function getLocation(element: Element): {
    line: number;
    column: number;
} | null;
/**
 * Convert parse5 child nodes into the simplified DOMNode representation
 * used for cross-language DOM-size analysis. Synthetic nodes (e.g. an
 * auto-inserted <html>/<head>/<body> not actually present in the source)
 * are flattened rather than counted; whitespace-only text nodes are
 * dropped so formatting doesn't inflate the node count.
 */
export declare function parse5ToDOMNodes(nodes: ChildNode[]): DOMNode[];
/**
 * Build the simplified DOM tree for an entire parsed document.
 */
export declare function buildDOMTreeFromHTML(ast: Document): DOMNode[];
/**
 * Find <div> elements that serve no purpose: a single element child and
 * no significant attributes of their own.
 */
export declare function findUnnecessaryDivWrappers(ast: Document): Element[];
export {};
//# sourceMappingURL=ast-helpers.d.ts.map