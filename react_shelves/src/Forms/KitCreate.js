import React, { Component } from 'react';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import fetchBackend, { postBackend } from '../Backend'

class FormKitCreate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loadingTypes:true,
            types:[],
            errors:[],
            form:this.defaultForm(),
        };
    }

    defaultForm = () => {
        return {title:"", title_eng:"", items:[]};
    }

    handleShow = event => {
        this.setState({form:this.defaultForm()},
          () => {
            if (this.state.loadingTypes) {
                fetchBackend('catalog/_types', {})
                    .then(response => response.json())
                    .then(data => {
                        var types = data.filter(t =>
                          (t.is_physical && t.title !== "Kit"));
                        this.setState({loadingTypes:false, types:types});
                    })
                    .catch(e => this.props.onClose());
            }
            this.validate();
          }
        );
    }

    handleCreate = event => {
        if (!this.state.errors.submit) {
          postBackend('catalog/_create_kit', {id:this.props.main_id}, this.state.form)
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

    handleAddItem = () => {
        var items = this.state.form.items;
        items.push({type:this.state.types[0].id, title:""});
        this.setState({form:{...this.state.form, items:items}},
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
        if (form.title_eng.length === 0) {
            errors["title_eng"] = true;
        }
        form.items.forEach((item, i) => {
          if (item.title.length === 0) {
              errors["E" + i] = true;
          }
        });
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
                <h4>Create new kit</h4>
              </Modal.Header>
              <Modal.Body>
                { this.state.loading && <div>Loading...</div> }
                <Form>
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
                    <Form.Label column xs={2}>Main item:</Form.Label>
                    <Col xs={10}>
                      <Form.Control type="text" id="main"
                          readOnly
                          value={this.props.main_title} />
                    </Col>
                  </Form.Group>
                  <Form.Group as={Row}>
                    <Form.Label column>Kit subitems</Form.Label>
                  </Form.Group>
                  { this.state.form.items.map((item, i) =>
                    <Form.Group as={Row} key={i}>
                      <Col xs={3}>
                        <Form.Control as="select"
                          id={"K" + i}
                          defaultValue={item.type}
                          onChange={event => this.handleItemChange(event, i, "type")}>
                          { this.state.types.map((option, i) =>
                            <option key={i} value={option.id}>
                              {option.title}
                            </option>)
                          }
                        </Form.Control>
                      </Col>
                      <Col xs={9}>
                        <Form.Control type="text" id={"T" + i}
                            onChange={event => this.handleItemChange(event, i, "title")}
                            isInvalid={this.state.errors["E" + i]}
                            value={item.title} />
                      </Col>
                    </Form.Group>)
                  }
                  <Form.Group as={Row}>
                    <Col>
                      <Button variant="secondary"
                          onClick={this.handleAddItem}
                          disabled={this.state.loadingTypes}>
                        Add new kit item
                      </Button>
                    </Col>
                  </Form.Group>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={this.handleHide}>
                  Close
                </Button>
                <Button variant="primary" onClick={this.handleCreate}
                  disabled={this.state.loadingTypes || this.state.errors.submit}>
                  Create kit
                </Button>
              </Modal.Footer>
            </Modal>
        );
    }
}

export default FormKitCreate
