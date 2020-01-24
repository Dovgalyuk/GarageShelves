import React, { Component } from 'react';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import PropTypes from 'prop-types'
import { postBackend } from '../Backend'
import KitItemsSelect from '../Catalog/Kit'

class FormOwn extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading:true,
            count:0,
            form:this.defaultForm()
        };
    }

    defaultForm = () => {
        var form = new Map();
        form[this.props.id] = {use:true, internal: ""};
        return form;
    }

    handleShow = event => {
        this.itemsRef.handleShow();
    }

    handleConfirm = event => {
        var form = this.itemsRef.getSelectedList();
        form[-1] = {id:this.props.id, use:true, internal:this.state.form[this.props.id].internal };
        postBackend('catalog/_own', {id:this.props.id}, form)
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
                  <Form>
                    <Form.Group as={Row}>
                      <Form.Label column xs={2}>Internal ID:</Form.Label>
                      <Col xs={10}>
                        <Form.Control type="text" id={this.props.id}
                          value={this.state.form[this.props.id].internal}
                          onChange={e => this.handleInput(e, this.props.id)}/>
                      </Col>
                    </Form.Group>
                    { this.state.count > 0 &&
                      <Form.Group>
                        <h4>Also add the next items from the kit</h4>
                      </Form.Group>
                    }
                    <KitItemsSelect catalog_id={this.props.id} 
                      ref={(ref) => {this.itemsRef = ref;}}
                      handleLoaded={(items) => {
                        this.setState({loading:false, count:items})}}
                      />
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

FormOwn.defaultProps = {
  open: false,
}

FormOwn.propTypes = {
  open: PropTypes.bool,
  id: PropTypes.number.isRequired,
  handleUpdateItems: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}

export default FormOwn
