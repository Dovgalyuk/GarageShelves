import React, { Component } from 'react';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import fetchBackend from '../Backend'

class FormFamilySelect extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading:true,
            families:[],
            family:-1
        };
    }

    handleShow = event => {
        if (this.state.loading) {
            fetchBackend('catalog/_filtered_list', {is_group:true})
                .then(response => response.json())
                .then(data => {
                    this.setState({loading:false, families:data,
                                   family:data[0].id});
                })
                .catch(e => this.props.onClose());
        }
    }

    handleHide = event => {
        this.props.onClose();
    }

    handleChange = (event) => {
        this.setState({[event.target.id]: event.target.value});
    }

    handleSelect = () => {
        this.props.onClose();
        this.props.onSelect(this.state.family);
    }

    render() {
        return (
            <Modal show={this.props.open}
                   onShow={this.handleShow}
                   onHide={this.handleHide}>
              <Modal.Header closeButton>
                <h4>Select family</h4>
              </Modal.Header>
              <Modal.Body>
                { this.state.loading && <div>Loading...</div> }
                <Form>
                  <Form.Group as={Row}>
                    <Col>
                      <Form.Control as="select" id="family"
                        defaultValue={this.state.family}
                        onChange={this.handleChange}>
                        { this.state.families.map((f, i) =>
                          <option key={i} value={f.id}>
                            {f.title_eng || f.title}
                          </option>)
                        }
                      </Form.Control>
                    </Col>
                  </Form.Group>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={this.handleHide}>
                  Close
                </Button>
                <Button variant="primary" onClick={this.handleSelect}>
                  Select family
                </Button>
              </Modal.Footer>
            </Modal>
        );
    }
}

export default FormFamilySelect
