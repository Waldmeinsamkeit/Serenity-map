import { tlenv } from "../globals/environment.mjs";
function isAccelKey(e) {
  return tlenv.isDarwin ? e.metaKey : e.ctrlKey || e.metaKey;
}
export {
  isAccelKey
};
//# sourceMappingURL=keyboard.mjs.map
