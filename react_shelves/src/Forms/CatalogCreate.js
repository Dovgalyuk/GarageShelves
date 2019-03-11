import React, { Component } from 'react';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import fetchBackend, { postBackend } from '../Backend'

class FormCatalogCreate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loadingTypes:true,
            types:[],
            loadingCompanies:true,
            companies:[],
            errors:[],
            form:{...this.defaultForm()},
        };
    }

    defaultForm = () => {
        return {type_id:0, title:"", title_eng:"", company_id:-1,
                year:"", description:"", parent:this.props.parent};
    }

    handleShow = event => {
        this.setState({form:this.defaultForm()}, this.validate);
        if (this.state.loadingTypes) {
            var filter = {};
            if (this.props.type_name) {
                filter.type_name = this.props.type_name;
            }
            fetchBackend('catalog/_types', filter)
                .then(response => response.json())
                .then(data => {
                    this.setState({loadingTypes:false, types:data,
                        form:{...this.state.form, type_id:data[0].id}});
                })
                .catch(e => this.props.onClose());
        }
        if (this.state.loadingCompanies) {
            fetchBackend('company/_filtered_list', {})
                .then(response => response.json())
                .then(data => {
                    this.setState({loadingCompanies:false, companies:data});
                })
                .catch(e => this.props.onClose());
        }
    }

    handleConfirm = event => {
        if (!this.state.errors.submit) {
            postBackend('catalog/_create', {}, this.state.form)
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
              <h4>Create new catalog item</h4>
            </Modal.Header>
            <Modal.Body>
              { (this.state.loadingTypes || this.state.loadingCompanies)
                && <div>Loading...</div> }
              <Form>
                <Form.Group as={Row}>
                  <Form.Label column xs={2}>Type:</Form.Label>
                  <Col xs={10}>
                    <Form.Control as="select" id="type_id"
                        onChange={this.handleInput}
                        defaultValue={this.state.form.type_id}>
                      { this.state.types.map((option) =>
                        <option key={option.id} value={option.id}>
                          {option.title}
                        </option>)
                      }
                    </Form.Control>
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
                        isInvalid={this.state.errors.title}
                        value={this.state.form.title} />
                  </Col>
                </Form.Group>
                <Form.Group as={Row}>
                  <Form.Label column xs={2}>Manufacturer:</Form.Label>
                  <Col xs={10}>
                    <Form.Control as="select"
                      id="company_id"
                      defaultValue={this.state.form.company}
                      onChange={this.handleInput}>
                      <option key={-1} value={-1}>
                        Unknown
                      </option>
                      { this.state.companies.map((option, i) =>
                        <option key={i} value={option.id}>
                          {option.title}
                        </option>)
                      }
                    </Form.Control>
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
              <Button variant="primary" onClick={this.handleConfirm}
                disabled={this.state.loadingTypes
                          || this.state.loadingCompanies
                          || this.state.errors.submit}>
                Create
              </Button>
            </Modal.Footer>
          </Modal>
      );
    }
}

export default FormCatalogCreate
