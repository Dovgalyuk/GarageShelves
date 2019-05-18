import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import Button from 'react-bootstrap/Button'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'
import Form from 'react-bootstrap/Form'

export default class EditDropDown extends Component {
  constructor(props) {
    super(props)
    this.state = {
      editing: false,
      loading: true,
      value: props.value || props.defaultValue,
      name: props.name || props.defaultName,
      savedValue: null,
      savedName: null,
      options:[]
    }
    this.editButton = React.createRef()
    this.saveButton = React.createRef()
    this.cancelButton = React.createRef()
  }

  _onInputChange = e => {
    this.setState({
      value: e.target.value,
      name: e.target.options[e.target.selectedIndex].text
    })
  }

  _onCancel = () => {
    this.setState(
      {
        editing: false,
        value: this.state.savedValue || this.props.value || this.props.defaultValue,
        name: this.state.savedName || this.props.name || this.props.defaultName,
      }, () => this.props.onCancel(this.state.value)
    )
  }

  _onOptionsLoaded = data => {
    this.setState({
      loading: false,
      options:data
    });
  }

  _activateEditMode = () => {
    this.setState({
      editing: true
    })
    if (this.state.loading) {
      this.props.onLoadList(this._onOptionsLoaded);
    }
  }

  _onSave = () => {
    const { onSave } = this.props
    this.setState(
      {
        editing: false,
        savedValue: this.state.value,
        savedName: this.state.name
      }, () => onSave(this.state.savedValue)
    )
  }

  _renderInput = () => {
    return (
      <Form.Control as="select" defaultValue={this.state.value}
        onChange={this._onInputChange}>
        { this.props.defaultName &&
          <option key={-1} value={this.props.defaultValue}>
            {this.props.defaultName}
          </option>
        }
        { this.state.options.map((option, i) =>
          <option key={i} value={option.value}>
            {option.name}
          </option>)
        }
      </Form.Control>
    );
  }

  _renderEditingMode = () => {
    return (
      <div>
        {this.state.loading && "Loading..."}
        {!this.state.loading &&
          <Fragment>
            {this.props.hint
              ? <OverlayTrigger
                  placement="bottom"
                  overlay={<Tooltip>{this.props.hint}</Tooltip>}
                >
                  { this._renderInput() }
                </OverlayTrigger>
              : this._renderInput()
            }
            <Button
              ref={this.saveButton}
              variant="link"
              onClick={this._onSave}
            >
              <i className="fas fa-check text-success" />
            </Button>
          </Fragment>
        }
        <Button
          ref={this.cancelButton}
          variant="link"
          onClick={this._onCancel}
        >
          <i className="fas fa-times text-danger" />
        </Button>
      </div>
    )
  }

  _renderViewMode = () => {
    const name = this.state.name || "";
    var nameElem;
    if (this.props.onRender)
      nameElem = this.props.onRender(this.state.value, this.state.name);
    else
      nameElem = <span> { name } </span>;
    return (
      <span onDoubleClick={this._activateEditMode}>
        {this.props.hint
          ? <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip>{this.props.hint}</Tooltip>}
            >
              { nameElem }
            </OverlayTrigger>
          : { nameElem }
        }
        <Button
          ref={this.editButton}
          variant="link"
          onClick={this._activateEditMode}
        >
          <i className="fas fa-edit" />
        </Button>
      </span>
    )
  }
  render() {
    const mode = this.state.editing ? this._renderEditingMode() : this._renderViewMode()
    return (
      <Fragment>
        { mode }
      </Fragment>
    )
  }
}

EditDropDown.defaultProps = {
  onCancel: () => { },
}

EditDropDown.propTypes = {
  value: PropTypes.number,
  name: PropTypes.string,
  hint: PropTypes.string,
  defaultValue: PropTypes.number,
  defaultName: PropTypes.string,
  // Events
  onCancel: PropTypes.func,
  onLoadList: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onRender: PropTypes.func,
}
