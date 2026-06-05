import { StateNode } from "./StateNode.mjs";
class RootState extends StateNode {
  static id = "root";
  static initial = "";
  static children() {
    return [];
  }
}
export {
  RootState
};
//# sourceMappingURL=RootState.mjs.map
