import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import Button from 'react-bootstrap/Button'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'
import ReactMarkdown from 'react-markdown';

export default class EditText extends Component {
  constructor(props) {
    super(props)
    this.state = {
      editing: false,
      valid: true,
      value: props.value || '',
      savedValue: ''
    }
    this.editButton = React.createRef()
    this.saveButton = React.createRef()
    this.cancelButton = React.createRef()
    this.input = React.createRef()
  }

  _onInputChange = e => {
    this.setState({
      valid: true,
      value: e.target.value
    })
  }

  _onKeyUp = e => {
    if (e.key === 'Enter') {
      this._onSave();
    } else if (e.key === 'Escape') {
      this._onCancel();
    }
  }

  _onCancel = () => {
    this.setState(
      {
        valid: true,
        editing: false,
        value: this.state.savedValue || this.props.value
      }, () => this.props.onCancel(this.state.value)
    )
  }

  _activateEditMode = () => {
    if (!this.props.canEdit || this.props.canEdit()) {
      this.setState({
        editing: true
      })
    }
  }

  _onSave = () => {
    const { onSave, validation, onValidationFail } = this.props
    const isValid = validation(this.state.value)
    if (!isValid) {
      return this.setState({ valid: false }, () => {
        onValidationFail && onValidationFail(this.state.value)
      })
    }
    this.setState(
      {
        editing: false,
        savedValue: this.state.value
      }, () => onSave(this.state.savedValue)
    )
  }

  _renderInput() {
    if (this.props.type === 'textarea' || this.props.type === 'markdown') {
      return (
        <textarea
          ref={this.input}
          {...this.props.inputProps}
          value={this.state.value}
          onChange={this._onInputChange}
          autoFocus={this.state.editing}
        />
      )
    } else {
      return (
        <input
          ref={this.input}
          {...this.props.inputProps}
          value={this.state.value}
          type={this.props.type}
          onChange={this._onInputChange}
          onKeyUp={this._onKeyUp}
          autoFocus={this.state.editing}
        />
      )
    }
  }
  _renderEditingMode = () => {
    const {
      onValidationFail,
      validationMessage,
      hint
    } = this.props;
    var inputElem = this._renderInput();
    if (hint) {
      inputElem = (
        <OverlayTrigger
          placement="bottom"
          overlay={<Tooltip>{hint}</Tooltip>}
        >
          {inputElem}
        </OverlayTrigger>
      );
    }
    return (
      <div>
        {inputElem}
        <Button
          ref={this.saveButton}
          variant="link"
          onClick={this._onSave}
        >
          <i className="fas fa-check text-success" />
        </Button>
        <Button
          ref={this.cancelButton}
          variant="link"
          onClick={this._onCancel}
        >
          <i className="fas fa-times text-danger" />
        </Button>
        {!this.state.valid && !onValidationFail &&
          <div>
            {validationMessage}
          </div>
        }
      </div>
    )
  }

  _renderValue = () => {
    if (this.props.type === 'markdown') {
      var val = this.state.value;
      if (val === ""
          && (!this.props.canEdit || this.props.canEdit())) {
          return (<Button variant="link"
                    ref={this.editButton}
                    onClick={this._activateEditMode}
                  >
                    <i className="fas fa-edit" />
                  </Button>);
      }
      return <ReactMarkdown escapeHtml={false} source={ val } />;
    } else {
      return (<Fragment>
                {this.props.prefix || ""}
                {this.state.value === ""
                   ? <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
                   : this.state.value}
              </Fragment>
             );
    }
  }

  _renderViewMode = () => {
    var val = this._renderValue();
    return (
      <div onDoubleClick={this._activateEditMode}>
        {val}
      </div>
    )
  }
  render() {
    const mode = this.state.editing ? this._renderEditingMode() : this._renderViewMode()
    return (
      <div>
        { mode }
      </div>
    )
  }
}

EditText.defaultProps = {
  value: '',
  type: 'text',
  validationMessage: 'Invalid Value',
  validation: value => true,
  onCancel: () => { },
}

EditText.propTypes = {
  inputProps: PropTypes.object,
  value: PropTypes.string.isRequired,
  prefix: PropTypes.string,
  hint: PropTypes.string,
  validationMessage: PropTypes.string,
  validation: PropTypes.func,
  onValidationFail: PropTypes.func,
  type: PropTypes.oneOf(
    [
      'text', 'textarea', 'email', 'number', 'date', 'datetime-local',
      'time', 'month', 'url', 'week', 'tel', 'markdown'
    ]
  ).isRequired,
  // Events
  onCancel: PropTypes.func,
  onSave: PropTypes.func.isRequired,
  canEdit: PropTypes.func,
}
