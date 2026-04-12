import type { DefaultTreeAdapterMap } from 'parse5';
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
export declare function serializeHTML(ast: Document): string;
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
export {};
//# sourceMappingURL=ast-helpers.d.ts.map