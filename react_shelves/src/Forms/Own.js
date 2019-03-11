import React, { Component, Fragment } from 'react';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import fetchBackend, { postBackend } from '../Backend'

class FormOwn extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading:true,
            items:[],
            form:this.defaultForm()
        };
    }

    defaultForm = () => {
        var form = new Map();
        form[this.props.id] = {use:true, internal: ""};
        return form;
    }

    handleShow = event => {
        var form = this.defaultForm();
        fetchBackend('catalog/_filtered_list', {parent:this.props.id})
            .then(response => response.json())
            .then(data => {
                for (var i = 0 ; i < data.length ; ++i) {
                    form[data[i].id] = {use:false, internal: ""};
                }
                this.setState({loading:false, items:data});
            })
            .catch(e => this.setState({loading:false, items:[]}))
            .finally(this.setState({form:form}));
    }

    handleConfirm = event => {
        postBackend('catalog/_own', {id:this.props.id}, this.state.form)
            .catch(e => {})
            .finally((e) => {
                this.handleHide(e);
                this.props.handleUpdateItems();
            });
    }

    handleHide = event => {
        this.setState({loading:true, items:[], form:this.defaultForm()});
        this.props.onClose();
    }

    handleCheckBox = (event, id) => {
        var form = this.state.form;
        form[id].use = event.target.checked;
        this.setState({form:form});
    }

    handleInput = (event, id) => {
        var form = this.state.form;
        form[id].internal = event.target.value;
        this.setState({form:form});
    }

    render() {
        return (
              <Modal show={this.props.open}
                     size="lg"
                     onShow={this.handleShow}
                     onHide={this.handleHide}>
                <Modal.Header closeButton>
                  <h4>Confirm ownership of the catalog item</h4>
                </Modal.Header>
                <Modal.Body>
                  { this.state.loading && <div>Loading...</div> }
                  <Form>
                    <Form.Group as={Row}>
                      <Form.Label column xs={2}>Internal ID:</Form.Label>
                      <Col xs={10}>
                        <Form.Control type="text" id={this.props.id}
                          value={this.state.form[this.props.id].internal}
                          onChange={e => this.handleInput(e, this.props.id)}/>
                      </Col>
                    </Form.Group>
                    { this.state.items.length > 0 &&
                      <Form.Group>
                        <h4>Also add the next items from the kit</h4>
                      </Form.Group>
                    }
                    { this.state.items.map((c) =>
                      <Fragment key={c.id}>
                        { c.is_physical &&
                          <Form.Group as={Row}>
                            <Col xs={3}>
                              <Form.Control type="text"
                                id={"I" + c.id}
                                value={this.state.form[c.id].internal}
                                onChange={e => this.handleInput(e, c.id)}/>
                            </Col>
                            <Col xs={9}>
                              <Form.Check custom type="checkbox"
                                id={"C" + c.id}
                                checked={this.state.form[c.id].use}
                                label={c.type_title + " : "
                                  + (c.title_eng ? c.title_eng : c.title)}
                                onChange={e => this.handleCheckBox(e, c.id)} />
                            </Col>
                          </Form.Group>
                        }
                      </Fragment>)
                    }
                  </Form>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={this.handleHide}>
                    Close
                  </Button>
                  <Button variant="primary" onClick={this.handleConfirm}
                    disabled={this.state.loading}>
                    Confirm
                  </Button>
                </Modal.Footer>
              </Modal>
        );
    }
}

export default FormOwn
