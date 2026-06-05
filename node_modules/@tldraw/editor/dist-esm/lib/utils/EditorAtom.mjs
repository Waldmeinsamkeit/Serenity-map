import { atom } from "@tldraw/state";
import { WeakCache } from "@tldraw/utils";
class EditorAtom {
  constructor(name, getInitialState) {
    this.name = name;
    this.getInitialState = getInitialState;
  }
  states = new WeakCache();
  getAtom(editor) {
    return this.states.get(editor, () => atom(this.name, this.getInitialState(editor)));
  }
  get(editor) {
    return this.getAtom(editor).get();
  }
  update(editor, update) {
    return this.getAtom(editor).update(update);
  }
  set(editor, state) {
    return this.getAtom(editor).set(state);
  }
}
export {
  EditorAtom
};
//# sourceMappingURL=EditorAtom.mjs.map
