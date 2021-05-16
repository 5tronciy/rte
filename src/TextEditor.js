import React, { Component } from "react";

import { Editor, EditorState, RichUtils, CompositeDecorator } from "draft-js";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import FormatAlignLeftIcon from "@material-ui/icons/FormatAlignLeft";
import FormatAlignCenterIcon from "@material-ui/icons/FormatAlignCenter";
import FormatAlignRightIcon from "@material-ui/icons/FormatAlignRight";
import FormatAlignJustifyIcon from "@material-ui/icons/FormatAlignJustify";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import MenuItem from "@material-ui/core/MenuItem";
import InputBase from "@material-ui/core/InputBase";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import { makeStyles, withStyles } from "@material-ui/core/styles";
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
        <SideBar />
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

const SideBar = () => {
  const defaultProps = {
    options: fonts,
    getOptionLabel: (option) => option.title,
  };

  return (
    <div className={s.sideBar}>
      <Autocomplete
        {...defaultProps}
        id="debug"
        debug
        renderInput={(params) => (
          <TextField {...params} label="text" margin="normal" />
        )}
      />
      <ButtonGroup color="primary" aria-label="outlined primary button group">
        <MultilineTextFields />
        <BootstrapInput id="demo-customized-textbox" />
      </ButtonGroup>

      <ToggleButtons />
    </div>
  );
};

const BootstrapInput = withStyles((theme) => ({
  root: {
    "label + &": {
      marginTop: theme.spacing(3),
    },
  },
  input: {
    borderRadius: 4,
    position: "relative",
    backgroundColor: theme.palette.background.paper,
    border: "1px solid #ced4da",
    fontSize: 16,
    padding: "10px 26px 10px 12px",
    transition: theme.transitions.create(["border-color", "box-shadow"]),
    // Use the system font instead of the default Roboto font.
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
    "&:focus": {
      borderRadius: 4,
      borderColor: "#80bdff",
      boxShadow: "0 0 0 0.2rem rgba(0,123,255,.25)",
    },
  },
}))(InputBase);

const fonts = [
  { title: "Inter" },
  { title: "Fira Sans" },
  { title: "Lato" },
  { title: "Montserrat" },
  { title: "Roboto Condensed" },
  { title: "Source Sans Pro" },
  { title: "Oswald" },
  { title: "Raleway" },
  { title: "Merriweather" },
  { title: "PT Sans" },
  { title: "Roboto Slab" },
];

export default function ToggleButtons() {
  const [alignment, setAlignment] = React.useState("left");

  const handleAlignment = (event, newAlignment) => {
    setAlignment(newAlignment);
  };

  return (
    <ToggleButtonGroup
      value={alignment}
      exclusive
      onChange={handleAlignment}
      aria-label="text alignment"
    >
      <ToggleButton value="left" aria-label="left aligned">
        <FormatAlignLeftIcon />
      </ToggleButton>
      <ToggleButton value="center" aria-label="centered">
        <FormatAlignCenterIcon />
      </ToggleButton>
      <ToggleButton value="right" aria-label="right aligned">
        <FormatAlignRightIcon />
      </ToggleButton>
      <ToggleButton value="justify" aria-label="justified">
        <FormatAlignJustifyIcon />
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

const fontWeights = [
  {
    value: "400",
    label: "Normal",
  },
  {
    value: "700",
    label: "Bold",
  },
];

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiTextField-root": {
      margin: theme.spacing(1),
      width: "10ch",
    },
  },
}));

function MultilineTextFields() {
  const classes = useStyles();
  const [fontWeight, setFontWeight] = React.useState("Normal");

  const handleChange = (event) => {
    setFontWeight(event.target.value);
  };

  return (
    <form className={classes.root} noValidate autoComplete="off">
      <div>
        <TextField
          id="select-font-weight"
          select
          value={fontWeight}
          onChange={handleChange}
        >
          {fontWeights.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </div>
    </form>
  );
}
