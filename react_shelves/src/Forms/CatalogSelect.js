import React, { Component } from 'react';
import PropTypes from 'prop-types'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import { CatalogSearch } from '../Catalog/Search' 

class FormCatalogSelect extends Component {
    constructor(props) {
        super(props);
        this.state = {
            software:-1
        };
    }

    handleShow = () => {
        // if (this.state.loading) {
        //     fetchBackend('catalog/_filtered_list', {type_name:'Software'})
        //         .then(response => response.json())
        //         .then(data => {
        //             this.setState({loading:false, list:data,
        //                            software:data[0].id});
        //         })
        //         .catch(e => this.props.onClose());
        // }
    }

    handleHide = () => {
        this.props.onClose();
    }

    handleSelect = () => {
        this.props.onClose();
        this.props.onSelect(this.state.software);
    }

    handleSelection = (items) => {
        var v = -1;
        if (items.length > 0) {
            v = items[0];
        }
        this.setState({software: v});
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
                <CatalogSearch listProps={{variant:"tiny", pageCount:10, rowCount:1}}
                               onSelection={this.handleSelection} />
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={this.handleHide}>
                  Close
                </Button>
                <Button variant="primary" onClick={this.handleSelect}
                        disabled={this.state.software < 0}>
                  OK
                </Button>
              </Modal.Footer>
            </Modal>
        );
    }
}

FormCatalogSelect.defaultProps = {
  open: false,
}

FormCatalogSelect.propTypes = {
  open: PropTypes.bool,
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
}

export default FormCatalogSelect;
