import React, { Component } from 'react';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import { CatalogListSection } from "./ListSection";

export default class CatalogSearch extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title:""
        };
    }

    handleChange = (event) => {
        this.setState({[event.target.id]: event.target.value},
            () => this.listRef.handleUpdate());
    }

    render() {
        var filter = {title:this.state.title};
        if (this.state.title.length < 3) {
            filter.noload = true;
        }
        return (
            <>
              <Form>
                <Form.Group as={Row} className="pt-4">
                  <Form.Label column xs={2}>Title</Form.Label>
                  <Col xs={10}>
                    <Form.Control type="text" id="title"
                        onChange={this.handleChange}
                        value={this.state.title}/>
                  </Col>
                </Form.Group>
              </Form>
              <CatalogListSection filter={filter}
                    ref={(ref) => {this.listRef = ref;}}/>
            </>
        );
    }
}
