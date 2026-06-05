import { deleteFromLocalStorage, getFromLocalStorage, setInLocalStorage } from "@tldraw/utils";
import { atom } from "./Atom.mjs";
import { react } from "./EffectScheduler.mjs";
function localStorageAtom(name, initialValue, options) {
  let _initialValue = initialValue;
  try {
    const value = getFromLocalStorage(name);
    if (value) {
      _initialValue = JSON.parse(value);
    }
  } catch {
    deleteFromLocalStorage(name);
  }
  const outAtom = atom(name, _initialValue, options);
  const reactCleanup = react(`save ${name} to localStorage`, () => {
    setInLocalStorage(name, JSON.stringify(outAtom.get()));
  });
  const handleStorageEvent = (event) => {
    if (event.key !== name) return;
    if (event.newValue === null) {
      outAtom.set(initialValue);
      return;
    }
    try {
      const newValue = JSON.parse(event.newValue);
      outAtom.set(newValue);
    } catch {
    }
  };
  window.addEventListener("storage", handleStorageEvent);
  const cleanup = () => {
    reactCleanup();
    window.removeEventListener("storage", handleStorageEvent);
  };
  return [outAtom, cleanup];
}
export {
  localStorageAtom
};
//# sourceMappingURL=localStorageAtom.mjs.map
