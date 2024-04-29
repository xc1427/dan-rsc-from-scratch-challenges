/** ====== */

const KEY_ORDER = ['$$typeof', 'type', 'key', 'ref', 'props'];

/**
 * Remove all keys in resolved react element and transform react element object to array
 * @param {*} jsx react element resolved
 * @returns compressed format
 */
export function compressJSX(jsx) {
  if (
    typeof jsx === "string" ||
    typeof jsx === "number" ||
    typeof jsx === "boolean" ||
    jsx == null
  ) {
    return jsx;
  }
  const kvToBeSerialized = Object.entries(jsx).filter(([key]) => key !== '_owner' && key !== '_store'); // _owner and _store can be ignored
  kvToBeSerialized.sort((a, b) => {
    return KEY_ORDER.indexOf(a[0]) - KEY_ORDER.indexOf(b[0]);
  });
  const compressed = kvToBeSerialized.map(elem => elem[1]);
  const lastElemCompressed = compressed[compressed.length - 1];
  if (Object.keys(lastElemCompressed).length === 0) {
    return compressed;
  } else {
    let compressedChildren = lastElemCompressed?.children;
    if (Array.isArray(lastElemCompressed?.children)) {
      compressedChildren = lastElemCompressed.children.map(compressJSX);
    } else if (typeof lastElemCompressed?.children === 'object') {
      compressedChildren = compressJSX(lastElemCompressed.children);
    }
    return [...compressed.slice(0, -1), { ...lastElemCompressed, children: compressedChildren }];

  }
}

/**
 * Restore react element from compressed format
 */
export function decompressJSX(jsx) {
  if (
    typeof jsx === "string" ||
    typeof jsx === "number" ||
    typeof jsx === "boolean" ||
    jsx == null
  ) {
    return jsx;
  }

  if (Array.isArray(jsx) && jsx.length !== 0) {
    const restoredEntries = jsx.map((elem, index) => {
      return [KEY_ORDER[index], elem];
    });
    const restoredRawObject = Object.fromEntries(restoredEntries);

    // It should be restored to an array of react node
    if (typeof (restoredRawObject.props) !== 'object') {
      return jsx.map(e => decompressJSX(e));
    }

    // It should be restored to a single react element
    if (restoredRawObject.$$typeof === Symbol.for('react.element')) {
      return {
        ...restoredRawObject,
        props: {
          ...restoredRawObject.props,
          children: decompressJSX(restoredRawObject.props.children),
        },
      };
    } else {
      throw new Error('Not expected.');
    }
  } else {
    throw new Error('Not expected.');
  }
}

