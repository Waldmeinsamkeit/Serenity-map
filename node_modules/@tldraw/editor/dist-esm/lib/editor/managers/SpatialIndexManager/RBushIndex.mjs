import RBush from "rbush";
import { Box } from "../../../primitives/Box.mjs";
class TldrawRBush extends RBush {
}
class RBushIndex {
  rBush;
  elementsInTree;
  constructor() {
    this.rBush = new TldrawRBush();
    this.elementsInTree = /* @__PURE__ */ new Map();
  }
  /**
   * Search for shapes within the given bounds.
   * Returns set of shape IDs that intersect with the bounds.
   */
  search(bounds) {
    const results = this.rBush.search({
      minX: bounds.minX,
      minY: bounds.minY,
      maxX: bounds.maxX,
      maxY: bounds.maxY
    });
    return new Set(results.map((e) => e.id));
  }
  /**
   * Insert or update a shape in the spatial index.
   * If the shape already exists, it will be removed first to prevent duplicates.
   */
  upsert(id, bounds) {
    const existing = this.elementsInTree.get(id);
    if (existing) {
      this.rBush.remove(existing);
    }
    const element = {
      minX: bounds.minX,
      minY: bounds.minY,
      maxX: bounds.maxX,
      maxY: bounds.maxY,
      id
    };
    this.rBush.insert(element);
    this.elementsInTree.set(id, element);
  }
  /**
   * Remove a shape from the spatial index.
   */
  remove(id) {
    const element = this.elementsInTree.get(id);
    if (element) {
      this.rBush.remove(element);
      this.elementsInTree.delete(id);
    }
  }
  /**
   * Bulk load elements into the spatial index.
   * More efficient than individual inserts for initial loading.
   */
  bulkLoad(elements) {
    this.rBush.load(elements);
    for (const element of elements) {
      this.elementsInTree.set(element.id, element);
    }
  }
  /**
   * Clear all elements from the spatial index.
   */
  clear() {
    this.rBush.clear();
    this.elementsInTree.clear();
  }
  /**
   * Check if a shape is in the spatial index.
   */
  has(id) {
    return this.elementsInTree.has(id);
  }
  /**
   * Get the number of elements in the spatial index.
   */
  getSize() {
    return this.elementsInTree.size;
  }
  /**
   * Get all shape IDs currently in the spatial index.
   */
  getAllShapeIds() {
    return Array.from(this.elementsInTree.keys());
  }
  /**
   * Get the bounds currently stored in the spatial index for a shape.
   * Returns undefined if the shape is not in the index.
   */
  getBounds(id) {
    const element = this.elementsInTree.get(id);
    if (!element) return void 0;
    return new Box(
      element.minX,
      element.minY,
      element.maxX - element.minX,
      element.maxY - element.minY
    );
  }
  /**
   * Dispose of the spatial index.
   * Clears all data structures to prevent memory leaks.
   */
  dispose() {
    this.clear();
  }
}
export {
  RBushIndex
};
//# sourceMappingURL=RBushIndex.mjs.map
