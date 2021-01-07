import React, { Component } from 'react';
import PropTypes from 'prop-types'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import { CatalogListSection } from "./ListSection";

export class CatalogSearch extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: "",
            filter: this.props.filter,
        };
    }

    getFilter = () => {
        var filter = {}
        Object.assign(filter, this.props.filter);
        filter.title = this.state.title;
        // if (filter.title.length < 3) {
        //     filter.noload = true;
        // }
        return filter;
    }

    handleUpdate = () => {
        this.setState({filter: this.getFilter()},
            () => this.listRef.handleUpdate())
    }

    handleChange = (event) => {
        this.setState({[event.target.id]: event.target.value},
            () => this.handleUpdate());
    }

    render() {
        return (
          <>
            <Form>
              <Form.Group as={Row} className="pt-4">
                <Form.Label column xs={1}>Title</Form.Label>
                <Col xs={11}>
                <Form.Control type="text" id="title"
                    onChange={this.handleChange}
                    value={this.state.title}/>
                </Col>
              </Form.Group>
            </Form>
            <CatalogListSection filter={this.state.filter}
                  ref={(ref) => {this.listRef = ref;}}
                  {...this.props.listProps}
                  onSelection={this.props.onSelection} />
          </>
        );
    }
}

CatalogSearch.defaultProps = {
    listProps: {},
    filter: {},
}
  
CatalogSearch.propTypes = {
    listProps: PropTypes.object,
    filter: PropTypes.object.isRequired,
    onSelection: PropTypes.func,
}  
