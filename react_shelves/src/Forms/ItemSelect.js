import React, { Component } from 'react';
import PropTypes from 'prop-types'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import { ItemSearch } from '../Item/Search' 

class FormItemSelect extends Component {
    constructor(props) {
        super(props);
        this.state = {
            item:-1
        };
    }

    handleHide = () => {
        this.props.onClose();
    }

    handleSelect = () => {
        this.props.onClose();
        this.props.onSelect(this.state.item);
    }

    handleSelection = (items) => {
        var v = -1;
        if (items.length > 0) {
            v = items[0];
        }
        this.setState({item: v});
    }

    render() {
        return (
            <Modal show={this.props.open}
                   onShow={this.handleShow}
                   onHide={this.handleHide}>
              <Modal.Header closeButton>
                <h4>{this.props.title}</h4>
              </Modal.Header>
              <Modal.Body>
                <ItemSearch listProps={{variant:"tiny", pageCount:10, rowCount:1}}
                               onSelection={this.handleSelection}
                               filter={this.props.filter} />
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={this.handleHide}>
                  Close
                </Button>
                <Button variant="primary" onClick={this.handleSelect}
                        disabled={this.state.item < 0}>
                  OK
                </Button>
              </Modal.Footer>
            </Modal>
        );
    }
}

FormItemSelect.defaultProps = {
  open: false,
  filter: {},
}

FormItemSelect.propTypes = {
  open: PropTypes.bool,
  title: PropTypes.string.isRequired,
  filter: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
}

export default FormItemSelect;
