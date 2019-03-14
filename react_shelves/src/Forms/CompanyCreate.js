import React, { Component } from 'react';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import { postBackend } from '../Backend'

class FormCompanyCreate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            errors:[],
            form:{...this.defaultForm()},
        };
    }

    defaultForm = () => {
        return {title:""};
    }

    handleShow = event => {
        this.setState({form:this.defaultForm()}, this.validate);
    }

    handleConfirm = event => {
        if (!this.state.errors.submit) {
            postBackend('company/_create', {}, this.state.form)
                .catch(e => {})
                .finally((e) => {
                    this.handleHide(e);
                    this.props.handleUpdateItems();
                });
        }
    }

    handleHide = event => {
        this.props.onClose();
    }

    handleInput = event => {
        this.setState({form:{...this.state.form,
                       [event.target.id]: event.target.value}},
                      this.validate);
    }

    validate = () => {
        const form = this.state.form;
        var errors = {};
        if (form.title.length === 0) {
            errors["title"] = true;
        }
        errors["submit"] = Object.keys(errors).length > 0;
        this.setState({errors:errors});
    }

    render() {
      return (
          <Modal show={this.props.open}
                 size="lg"
                 onShow={this.handleShow}
                 onHide={this.handleHide}>
            <Modal.Header closeButton>
              <h4>Add new company</h4>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group as={Row}>
                  <Form.Label column xs={2}>Native title:</Form.Label>
                  <Col xs={10}>
                    <Form.Control type="text" id="title"
                        onChange={this.handleInput}
                        isInvalid={this.state.errors.title}
                        value={this.state.form.title} />
                  </Col>
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={this.handleHide}>
                Close
              </Button>
              <Button variant="primary" onClick={this.handleConfirm}
                disabled={this.state.errors.submit}>
                Create
              </Button>
            </Modal.Footer>
          </Modal>
      );
    }
}

export default FormCompanyCreate
