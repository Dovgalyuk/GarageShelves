import React, { Component } from 'react';
import PropTypes from 'prop-types'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import FormCatalogSelect from '../Forms/CatalogSelect'
import CatalogButton from '../Catalog/Button'

export default class FormCatalogFilter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: "",
            categories: [],
            showForm: false,
            formTitle: "",
            formFilter: {},
        };
    }

    handleShow = event => {
    }

    handleConfirm = () => {
        var filter = {title:this.state.title,
            categories: this.state.categories.join(",")};
        this.props.onConfirm(filter);
        this.props.onClose();
    }

    handleHide = () => {
        this.props.onClose();
    }

    handleInput = event => {
        this.setState({[event.target.id]: event.target.value});
    }

    handleAddPlatform = () => {
        this.setState({ showForm: true, formTitle: "Add platform",
            formFilter: {type_name: "Computer family,Computer", notype: true} });
    }
    handleFormClose = () => {
        this.setState({ showForm: false });
    }
    handleFormSelect = (family) => {
        this.setState({categories: this.state.categories.concat([family,])});
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
                <Form.Group as={Row}>
                  <Form.Label column xs={2}>On platforms:</Form.Label>
                  <Col xs={10}>
                    { this.state.categories.map(cat => <span key={cat}>
                          <CatalogButton id={cat} /> &nbsp;
                        </span>
                      )
                    }
                    <Button size="sm" variant="outline-info"
                        onClick={this.handleAddPlatform}>
                      Add platform
                    </Button>
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
            <FormCatalogSelect
                    title={this.state.formTitle}
                    open={this.state.showForm}
                    filter={this.state.formFilter}
                    onClose={this.handleFormClose}
                    onSelect={this.handleFormSelect} />
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
