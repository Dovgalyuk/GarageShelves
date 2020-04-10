import React, { Component } from 'react';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import fetchBackend, { postBackend } from '../Backend'
import SubmitButton from '../Widgets/SubmitButton'
import CatalogTypeName from '../Catalog/Type'

export default class FormCatalogCreate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loadingRoots:!this.props.noroot,
            roots:[],
            errors:[],
            form:{...this.defaultForm()},
        };
    }

    defaultForm = () => {
        return {type:this.props.type ? this.props.type : "physical",
                title:"", title_eng:"", root:-1,
                year:"", description:"", parent:this.props.parent};
    }

    handleShow = event => {
        if (this.state.loadingRoots) {
            fetchBackend('catalog/_filtered_list', {noparent:true})
                .then(response => response.json())
                .then(data => {
                    var root = -1;
                    data.some(r => {
                      if (r.is_group === 1) {
                        root = r.id;
                        return true;
                      }
                      return false;
                    });
                    this.setState({loadingRoots:false, roots:data,
                                   form: {...this.state.form, root:root}});
                })
                .catch(e => this.props.onClose());
        }
  }

    handleConfirm = event => {
        if (!this.state.errors.submit) {
            postBackend('catalog/_create', {}, this.state.form)
                .then(response => response.json())
                .then(data => {
                  this.handleHide();
                  this.props.handleUpdateItems(data.id);
                })
                .catch(e => {})
                .finally((e) => {
                });
        }
    }

    handleHide = () => {
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
              { this.state.loadingRoots
                && <div>Loading...</div> }
              <Form>
                <Form.Group as={Row}>
                  <Form.Label column xs={2}>Type:</Form.Label>
                  <Col xs={10}>
                    {this.props.type 
                    ? <CatalogTypeName type={this.props.type} />
                    : <Form.Control as="select" id="type"
                          onChange={this.handleInput}
                          defaultValue={this.state.form.type} >
                        <option value="physical">Physical item</option>
                        { (!this.props.not_type || this.props.not_type !== "abstract")
                          && <option value="abstract">Group/family/class</option>
                        }
                        {/*TODO <option value="kit">Kit</option> */}
                        <option value="bits">Software/data/text without storage media</option>
                      </Form.Control>
                    }
                  </Col>
                </Form.Group>
                { this.props.noroot ? <div /> :
                  <Form.Group as={Row}>
                    <Form.Label column xs={2}>Category:</Form.Label>
                    <Col xs={10}>
                      <Form.Control as="select" id="root"
                          onChange={this.handleInput}
                          defaultValue={this.state.form.root} >
                        { this.state.roots.map((option, i) => {
                            if (option.is_group === 1) {
                              return (<option key={i} value={option.id}>
                                  {option.title_eng}
                                </option>);
                            }
                            return "";
                          }
                        )}
                      </Form.Control>
                    </Col>
                  </Form.Group>
                }
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
              <SubmitButton caption="Create" onClick={this.handleConfirm}
                disabled={this.state.loadingRoots
                          || this.state.errors.submit}/>
            </Modal.Footer>
          </Modal>
      );
    }
}
