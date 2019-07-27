import React, { Component } from 'react';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import fetchBackend, { postBackend } from '../Backend'

class FormModificationCreate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            errors:[],
            form:this.defaultForm(),
        };
    }

    defaultForm = () => {
        return {title:"", title_eng:"", year:"", description:""};
    }

    handleShow = event => {
        this.validate();
    }

    handleCreate = event => {
        if (!this.state.errors.submit) {
          postBackend('catalog/_create_modification',
                {id:this.props.main_id}, this.state.form)
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

    handleInput = (event, id) => {
        this.setState({form:{...this.state.form,
                       [event.target.id]: event.target.value}},
            this.validate);
    }

    handleItemChange = (event, i, f) => {
        var items = this.state.form.items;
        items[i][f] = event.target.value;
        this.setState({form:{...this.state.form, items:items}},
            this.validate);
    }

    validate = () => {
        const form = this.state.form;
        var errors = {};
        if (form.year.length > 0
            && (form.year < 1500 || form.year > 2100)) {
            errors["year"] = true;
        }
        if (form.title_eng.length === 0) {
            errors["title_eng"] = true;
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
                <h4>Create new modification</h4>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <Form.Group as={Row}>
                    <Form.Label column xs={2}>Main item:</Form.Label>
                    <Col xs={10}>
                      <Form.Control type="text" id="main"
                          readOnly
                          value={this.props.main_title} />
                    </Col>
                  </Form.Group>
                  <Form.Group as={Row}>
                    <Form.Label column xs={2}>Title in English:</Form.Label>
                    <Col xs={10}>
                      <Form.Control type="text" id="title_eng"
                          onChange={this.handleInput}
                          isInvalid={this.state.errors.title_eng}
                          value={this.state.form.title_eng}/>
                    </Col>
                  </Form.Group>
                  <Form.Group as={Row}>
                    <Form.Label column xs={2}>Native title:</Form.Label>
                    <Col xs={10}>
                      <Form.Control type="text" id="title"
                          onChange={this.handleInput}
                          value={this.state.form.title} />
                    </Col>
                  </Form.Group>
                  <Form.Group as={Row}>
                    <Form.Label column xs={2}>Start of production year:</Form.Label>
                    <Col xs={10}>
                        <Form.Control type="text" id="year"
                            onChange={this.handleInput}
                            value={this.state.form.year}
                            isInvalid={this.state.errors.year}
                            maxLength={4} />
                    </Col>
                  </Form.Group>
                  <Form.Group as={Row}>
                    <Form.Label column xs={2}>Description:</Form.Label>
                    <Col xs={10}>
                        <Form.Control as="textarea" id="description"
                            onChange={this.handleInput}
                            value={this.state.form.description}
                            rows={4} />
                    </Col>
                  </Form.Group>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={this.handleHide}>
                  Close
                </Button>
                <Button variant="primary" onClick={this.handleCreate}
                  disabled={this.state.errors.submit}>
                  Create modification
                </Button>
              </Modal.Footer>
            </Modal>
        );
    }
}

export default FormModificationCreate
