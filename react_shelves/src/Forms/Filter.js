import React, { Component } from 'react';
import PropTypes from 'prop-types'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'

export default class FormCatalogFilter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title:"",
        };
    }

    handleShow = event => {
    }

    handleConfirm = event => {
        this.props.onConfirm({title:this.state.title});
        this.props.onClose();
    }

    handleHide = () => {
        this.props.onClose();
    }

    handleInput = event => {
        this.setState({[event.target.id]: event.target.value});
    }

    render() {
      return (
          <Modal show={this.props.open}
                 size="lg"
                 onShow={this.handleShow}
                 onHide={this.handleHide}>
            <Modal.Header closeButton>
              <h4>Catalog filter</h4>
            </Modal.Header>
            <Modal.Body>
              { this.state.loadingTypes && <div>Loading...</div> }
              <Form>
                <Form.Group as={Row}>
                  <Form.Label column xs={2}>Title:</Form.Label>
                  <Col xs={10}>
                    <Form.Control type="text" id="title"
                        onChange={this.handleInput}
                        value={this.state.title}/>
                  </Col>
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={this.handleHide}>
                Close
              </Button>
              <Button variant="primary" onClick={this.handleConfirm}
                disabled={this.state.loadingTypes}>
                Filter
              </Button>
            </Modal.Footer>
          </Modal>
      );
    }
}

FormCatalogFilter.defaultProps = {
    open: false,
}

FormCatalogFilter.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
}
