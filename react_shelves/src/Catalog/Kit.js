import React, { Component } from 'react';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import PropTypes from 'prop-types'
import fetchBackend from '../Backend'

class KitItemsSelect extends Component {
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
        return form;
    }

    handleShow = event => {
        var form = this.defaultForm();
        fetchBackend('catalog/_filtered_list', {parent:this.props.catalog_id, type:"physical,kit"})
            .then(response => response.json())
            .then(data => {
                for (var i = 0 ; i < data.length ; ++i) {
                    if (data[i].is_physical || data[i].is_kit) {
                        form[data[i].list_id] = {id:data[i].id, use:false, internal: ""};
                    }
                }
                this.setState({loading:false, items:data},
                    () => this.props.handleLoaded(this.state.items.length))
            })
            .catch(e => this.setState({loading:false, items:[]}))
            .finally(this.setState({form:form}));
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

    getSelectedList = () => {
        return this.state.form;
    }

    render() {
        if (this.state.loading) {
            return "Loading...";
        }
        return (
            <>
                { this.state.items.map((c) =>
                    <Form.Group as={Row}  key={c.list_id}>
                        <Col xs={3}>
                            <Form.Control type="text"
                                id={"I" + c.list_id}
                                value={this.state.form[c.list_id].internal}
                                onChange={e => this.handleInput(e, c.list_id)}/>
                        </Col>
                        <Col xs={9}>
                            <Form.Check custom type="checkbox"
                                id={"C" + c.list_id}
                                checked={this.state.form[c.list_id].use}
                                label={c.root_title + " : "
                                    + (c.title_eng ? c.title_eng : c.title)}
                                onChange={e => this.handleCheckBox(e, c.list_id)} />
                        </Col>
                    </Form.Group>
                )}
            </>
        );
    }
}

KitItemsSelect.propTypes = {
    catalog_id: PropTypes.number.isRequired,
    handleLoaded: PropTypes.func.isRequired,
}

export default KitItemsSelect
