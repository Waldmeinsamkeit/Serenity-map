import { STRUCTURED_CLONE_OBJECT_PROTOTYPE } from "@tldraw/utils";
import { isDev } from "./isDev.mjs";
function devFreeze(object) {
  if (!isDev()) return object;
  const proto = Object.getPrototypeOf(object);
  if (proto && !(Array.isArray(object) || proto === Object.prototype || proto === null || proto === STRUCTURED_CLONE_OBJECT_PROTOTYPE)) {
    console.error("cannot include non-js data in a record", object);
    throw new Error("cannot include non-js data in a record");
  }
  if (Object.isFrozen(object)) {
    return object;
  }
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      devFreeze(value);
    }
  }
  return Object.freeze(object);
}
export {
  devFreeze
};
//# sourceMappingURL=devFreeze.mjs.map
