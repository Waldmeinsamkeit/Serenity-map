import { tlenv } from "@tldraw/editor";
const cmdKey = tlenv.isDarwin ? "\u2318" : "__CTRL__";
const ctrlKey = tlenv.isDarwin ? "\u2303" : "__CTRL__";
const altKey = tlenv.isDarwin ? "\u2325" : "__ALT__";
function kbd(str) {
  if (str === ",") return [","];
  return str.split(",")[0].split(/(\[\[[^\]]+\]\])/g).map(
    (s) => s.startsWith("[[") ? s.replace(/[[\]]/g, "") : s.replace(/cmd\+/g, cmdKey).replace(/ctrl\+/g, ctrlKey).replace(/alt\+/g, altKey).replace(/shift\+/g, "\u21E7").replace(/\$/g, cmdKey).replace(/\?/g, altKey).replace(/!/g, "\u21E7").match(/__CTRL__|__ALT__|./g) || []
  ).flat().map((sub, index) => {
    if (sub[0] === "+") return [];
    let modifiedKey;
    if (sub === "__CTRL__") {
      modifiedKey = "Ctrl";
    } else if (sub === "__ALT__") {
      modifiedKey = "Alt";
    } else {
      modifiedKey = sub[0].toUpperCase() + sub.slice(1);
    }
    return tlenv.isDarwin || !index ? modifiedKey : ["+", modifiedKey];
  }).flat();
}
function kbdStr(str) {
  return "\u2014 " + kbd(str).join("\u2009");
}
export {
  kbd,
  kbdStr
};
//# sourceMappingURL=kbd-utils.mjs.map
