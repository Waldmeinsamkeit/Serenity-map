import { jsx } from "react/jsx-runtime";
import { preventDefault, useEditor } from "@tldraw/editor";
import React from "react";
const PlainTextArea = React.forwardRef(function TextArea({
  isEditing,
  text,
  handleFocus,
  handleChange,
  handleKeyDown,
  handlePaste,
  handleBlur,
  handleInputPointerDown,
  handleDoubleClick
}, ref) {
  const editor = useEditor();
  const onChange = (e) => {
    handleChange({ plaintext: e.target.value });
  };
  return /* @__PURE__ */ jsx(
    "textarea",
    {
      ref,
      className: "tl-text tl-text-input",
      name: "text",
      tabIndex: -1,
      disabled: !isEditing,
      readOnly: !isEditing,
      autoComplete: "off",
      autoCapitalize: "off",
      autoCorrect: "off",
      autoSave: "off",
      placeholder: "",
      spellCheck: "true",
      wrap: "off",
      dir: "auto",
      defaultValue: text,
      onFocus: handleFocus,
      onChange,
      onKeyDown: (e) => handleKeyDown(e.nativeEvent),
      onBlur: handleBlur,
      onTouchEnd: editor.markEventAsHandled,
      onContextMenu: isEditing ? (e) => e.stopPropagation() : void 0,
      onPointerDown: handleInputPointerDown,
      onPaste: handlePaste,
      onDoubleClick: handleDoubleClick,
      onDragStart: preventDefault
    }
  );
});
export {
  PlainTextArea
};
//# sourceMappingURL=PlainTextArea.mjs.map
