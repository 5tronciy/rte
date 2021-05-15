import React from "react";
import cn from "classnames";
import LinkIcon from "@material-ui/icons/Link";
import s from "./InlineToolbar.module.css";

const INLINE_STYLES = [
  { label: "B", style: "BOLD" },
  { label: "I", style: "ITALIC" },
  { label: "H", style: "HIGHLIGHT" },
];

export const InlineToolbar = ({ editorState, onToggle, position, setLink }) => {
  const currentStyle = editorState.getCurrentInlineStyle();
  console.log(currentStyle);
  return (
    <div className={s.toolbar} style={position}>
      <ul className={s.toolbarItems}>
        {INLINE_STYLES.map((type) => (
          <li
            key={type.label}
            className={cn(
              s.toolbarItem,
              s[type.style.toLowerCase()],
              currentStyle.has(type.style) ? s.active : ""
            )}
            onMouseDown={(e) => {
              e.preventDefault();
              onToggle(type.style);
            }}
          >
            {type.label}
          </li>
        ))}
        <li
          key="add-link-button"
          className={s.toolbarItem}
          onMouseDown={setLink}
        >
          <LinkIcon />
        </li>
      </ul>
    </div>
  );
};
