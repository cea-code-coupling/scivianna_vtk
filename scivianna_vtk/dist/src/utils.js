/**
 * Utility functions for VTK data conversion and manipulation.
 */

import vtkCellArray from '@kitware/vtk.js/Common/Core/CellArray';

/**
 * Convert a buffer to a typed array based on dtype.
 * @param {ArrayBuffer} buffer - The buffer to convert.
 * @param {string} dtype - The data type ('uint8', 'float32', etc.).
 * @returns {TypedArray|null} The typed array or null if buffer is invalid.
 */
export function toTyped(buffer, dtype) {
  if (!buffer) return null;
  switch (dtype) {
    case 'uint8':
      return new Uint8Array(buffer);
    case 'float32':
    default:
      return new Float32Array(buffer);
  }
}

/**
 * Decode null-padded UTF-8 byte buffer into an array of strings.
 *
 * @param {Uint8Array} buffer
 * @param {number} numTuples
 * @param {number} stringLength - Fixed byte width per string.
 * @returns {string[]}
 */
export function toStrings(buffer, numTuples, stringLength) {
  if (!buffer || numTuples === 0 || stringLength === 0) {
    return [];
  }

  const decoder = new TextDecoder('utf-8');
  const strings = [];

  for (let i = 0; i < numTuples; i++) {
    const start = i * stringLength;
    const end = start + stringLength;

    const bytes = buffer.subarray(start, end);

    // Find the null terminator.
    let length = bytes.indexOf(0);
    if (length === -1) {
      length = bytes.length;
    }

    strings.push(decoder.decode(bytes.subarray(0, length)));
  }

  return strings;
}
/**
 * Get value from an array at index, handling both numeric and string arrays.
 * For vtkStringArray, uses getData()[index]; for numeric arrays, uses getValue(index).
 * @param {vtkDataArray|vtkStringArray} arr - The array to get value from.
 * @param {number} index - The index to retrieve.
 * @returns {*} The value at the specified index.
 */
export function getArrayValue(arr, index) {
  if (!arr) return undefined;

  if (typeof arr.getValue === 'function') {
    return arr.getValue(index);
  }

  return arr.getData()?.[index];
}
/**
 * Create a vtkCellArray from a cell stream buffer.
 * @param {object} cell - Cell data with buffer property.
 * @returns {vtkCellArray|null} The cell array or null if invalid.
 */
export function makeCellArray(cell) {
  if (!cell || !cell.buffer) return null;
  const values = new Uint32Array(cell.buffer);
  const vtkArr = vtkCellArray.newInstance();
  vtkArr.setData(values);
  return vtkArr;
}
// Resolve the *real* cell_id value for a local cell index in `dataset`,
// working around vtkClipPolyData's inability to carry string arrays.
export function getCellIdResolver(dataset, sourcePolyData) {
  if (!dataset) return null;
  const cd = dataset.getCellData();
  const origIdArray = cd.getArrayByName('orig_cell_id');

  if (origIdArray) {
    // dataset is clip/cap output - map each local cell back to the
    // source polyData's cell to read the (valid) string cell_id there.
    const srcCellIdArray = sourcePolyData.getCellData().getArrayByName('cell_id');
    if (!srcCellIdArray) return null;
    return (i) => {
      const origId = getArrayValue(origIdArray, i);
      return getArrayValue(srcCellIdArray, origId);
    };
  }

  // dataset is the unclipped source polyData - cell_id is valid as-is.
  const cellIdArray = cd.getArrayByName('cell_id');
  return cellIdArray ? (i) => getArrayValue(cellIdArray, i) : null;
}