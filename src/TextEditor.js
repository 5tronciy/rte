import React, { Component } from "react";

import { Editor, EditorState, RichUtils, CompositeDecorator } from "draft-js";

import { getSelectionRange, getSelectionCoords } from "./utils";
import { InlineToolbar } from "./InlineToolbar";
import s from "./TextEditor.module.css";

export class TextEditor extends Component {
  constructor() {
    super();

    const decorator = new CompositeDecorator([
      {
        strategy: findLinkEntities,
        component: Link,
      },
    ]);

    this.state = {
      inlineToolbar: { show: false, position: {} },
      editorState: EditorState.createEmpty(decorator),
    };

    this.toggleInlineStyle = this.toggleInlineStyle.bind(this);
    this.handleKeyCommand = this.handleKeyCommand.bind(this);
    this.onChange = this.onChange.bind(this);
    this.setLink = this.setLink.bind(this);
    this.focus = () => this.refs.editor.focus();
  }
  onChange = (editorState) => {
    if (!editorState.getSelection().isCollapsed()) {
      const selectionRange = getSelectionRange();
      if (!selectionRange) {
        this.setState({ inlineToolbar: { show: false } });
        return;
      }
      const selectionCoords = getSelectionCoords(selectionRange);
      this.setState({
        inlineToolbar: {
          show: true,
          position: {
            top: selectionCoords.offsetTop,
            left: selectionCoords.offsetLeft,
          },
        },
      });
    } else {
      this.setState({ inlineToolbar: { show: false } });
    }
    this.setState({ editorState });
  };

  setLink() {
    const urlValue = prompt("Введите ссылку", "");
    const { editorState } = this.state;
    const contentState = editorState.getCurrentContent();

    const contentStateWithEntity = contentState.createEntity(
      "LINK",
      "SEGMENTED",
      { url: urlValue }
    );

    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithEntity,
    });

    this.setState(
      {
        editorState: RichUtils.toggleLink(
          newEditorState,
          newEditorState.getSelection(),
          entityKey
        ),
      },
      () => {
        setTimeout(() => this.focus(), 0);
      }
    );
  }

  toggleInlineStyle(inlineStyle) {
    this.onChange(
      RichUtils.toggleInlineStyle(this.state.editorState, inlineStyle)
    );
  }

  handleKeyCommand(command) {
    const { editorState } = this.state;
    const newState = RichUtils.handleKeyCommand(editorState, command);

    if (newState) {
      this.onChange(newState);
      return true;
    }

    return false;
  }
  render() {
    const { editorState, inlineToolbar } = this.state;

    return (
      <div id="editor-container" className={s.editorContainer}>
        <div className={s.editor}>
          {inlineToolbar.show ? (
            <InlineToolbar
              editorState={editorState}
              onToggle={this.toggleInlineStyle}
              position={inlineToolbar.position}
              setLink={this.setLink}
            />
          ) : null}
          <div className={s.textArea}>
            <Editor
              editorState={editorState}
              onChange={this.onChange}
              placeholder="Здесь можно печатать..."
              customStyleMap={customStyleMap}
              ref="editor"
            />
          </div>
        </div>
        <div className={s.sideBar}>sideBar</div>
      </div>
    );
  }
}

const customStyleMap = {
  HIGHLIGHT: {
    backgroundColor: "palegreen",
  },
};

function findLinkEntities(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges((character) => {
    const entityKey = character.getEntity();
    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === "LINK"
    );
  }, callback);
}

const Link = (props) => {
  const { url } = props.contentState.getEntity(props.entityKey).getData();

  return (
    <a href={url} title={url} className="ed-link">
      {props.children}
    </a>
  );
};
