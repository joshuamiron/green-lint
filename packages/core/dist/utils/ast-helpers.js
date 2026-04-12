"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseHTML = parseHTML;
exports.serializeHTML = serializeHTML;
exports.isElement = isElement;
exports.isTextNode = isTextNode;
exports.getAttribute = getAttribute;
exports.setAttribute = setAttribute;
exports.traverse = traverse;
exports.findAll = findAll;
exports.findAllImages = findAllImages;
exports.hasParentWithTag = hasParentWithTag;
exports.createElement = createElement;
exports.wrapElement = wrapElement;
exports.insertBefore = insertBefore;
exports.getLocation = getLocation;
const parse5 = __importStar(require("parse5"));
/**
 * Parse HTML into AST
 */
function parseHTML(html) {
    return parse5.parse(html, {
        sourceCodeLocationInfo: true, // This gives us line/column positions!
    });
}
/**
 * Serialize AST back to HTML
 */
function serializeHTML(ast) {
    return parse5.serialize(ast);
}
/**
 * Check if node is an Element
 */
function isElement(node) {
    return 'tagName' in node;
}
/**
 * Check if node is a Text node
 */
function isTextNode(node) {
    return 'value' in node && !('tagName' in node);
}
/**
 * Get attribute value from element
 */
function getAttribute(element, name) {
    const attr = element.attrs.find(a => a.name === name);
    return attr?.value;
}
/**
 * Set attribute on element
 */
function setAttribute(element, name, value) {
    const existingIndex = element.attrs.findIndex(a => a.name === name);
    if (existingIndex >= 0) {
        element.attrs[existingIndex].value = value;
    }
    else {
        element.attrs.push({ name, value });
    }
}
/**
 * Traverse AST and call visitor for each element
 */
function traverse(node, visitor, parent = null) {
    if (isElement(node)) {
        visitor(node, parent);
        if (node.childNodes) {
            for (const child of node.childNodes) {
                traverse(child, visitor, node);
            }
        }
    }
    else if ('childNodes' in node && node.childNodes) {
        // Document or fragment
        for (const child of node.childNodes) {
            traverse(child, visitor, node);
        }
    }
}
/**
 * Find all elements matching a predicate
 */
function findAll(node, predicate) {
    const results = [];
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
function findAllImages(ast) {
    return findAll(ast, (element) => element.tagName === 'img');
}
/**
 * Check if element has a parent with given tag name
 */
function hasParentWithTag(element, tagName, ast) {
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
function createElement(tagName, attrs = [], children = []) {
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
function wrapElement(ast, elementToWrap, wrapperTag, wrapperAttrs = []) {
    let wrapper = null;
    traverse(ast, (node, parent) => {
        if (node === elementToWrap && parent && 'childNodes' in parent) {
            // Create wrapper with the element as child
            wrapper = createElement(wrapperTag, wrapperAttrs, [elementToWrap]);
            // Replace child in parent
            const index = parent.childNodes.indexOf(elementToWrap);
            if (index >= 0) {
                parent.childNodes[index] = wrapper;
            }
        }
    });
    return wrapper;
}
/**
 * Insert element before another element
 */
function insertBefore(ast, referenceElement, newElement) {
    traverse(ast, (node, parent) => {
        if (node === referenceElement && parent && 'childNodes' in parent) {
            const index = parent.childNodes.indexOf(referenceElement);
            if (index >= 0) {
                parent.childNodes.splice(index, 0, newElement);
            }
        }
    });
}
/**
 * Get source location of element (line/column)
 */
function getLocation(element) {
    if (element.sourceCodeLocation) {
        return {
            line: element.sourceCodeLocation.startLine,
            column: element.sourceCodeLocation.startCol,
        };
    }
    return null;
}
//# sourceMappingURL=ast-helpers.js.map