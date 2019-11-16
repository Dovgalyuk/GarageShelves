import React, { Component } from 'react'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import SubmitButton from '../Widgets/SubmitButton'
import { uploadBackend } from '../Backend'

export class FormUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      description: "",
      selectedFile: "",
    };
    this.fileRef = React.createRef();
  }

  handleUpload = event => {
    if (this.state.selectedFile === "")
      return;

    uploadBackend(this.props.entity + '/_upload_' + this.props.type,
      { id: this.props.id, desc: this.state.description }, this.fileRef.current.files[0])
      .then(response => response.json())
      .then(() => this.props.onUpload())
      .catch(() => { })
      .finally(() => this.handleHide());
  }

  handleHide = event => {
    this.fileRef.current.value = null;
    this.setState({ description: "", selectedFile: "" }, this.props.onClose);
  }

  handleInput = (event, id) => {
    this.setState({ [event.target.id]: event.target.value });
  }

  handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleUpload(event);
    }
  }

  handleSelectFile = () => {
    this.setState({ selectedFile: this.fileRef.current.files[0].name });
  };
  render() {
    return (<Modal show={this.props.open} onShow={this.handleShow} onHide={this.handleHide}>
      <Modal.Header closeButton>
        <h4>Upload {this.props.type} </h4>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group as={Row}>
            <Form.Label column xs={2}>File:</Form.Label>
            <Col xs={3}>
              <div className="input-group">
                <label className="input-group-btn">
                  <span className="btn btn-primary" onChange={this.handleSelectFile}>
                    Choose file
                            <input type="file" style={{ display: "none" }} ref={this.fileRef} />
                  </span>
                </label>
              </div>
            </Col>
            <Col><h5>{this.state.selectedFile}</h5></Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column xs={2}>Description:</Form.Label>
            <Col xs={10}>
              <Form.Control type="text" id="description"
                  onChange={this.handleInput}
                  onKeyPress={this.handleKeyPress}
                  value={this.state.description} />
            </Col>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={this.handleHide}>
          Close
        </Button>
        <SubmitButton caption="Upload"
            onClick={this.handleUpload}
            disabled={this.state.selectedFile === ""} />
      </Modal.Footer>
    </Modal>);
  }
}
