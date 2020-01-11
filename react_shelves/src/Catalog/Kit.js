import React, { Component, Fragment } from 'react';
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
        fetchBackend('catalog/_filtered_list', {parent:this.props.catalog_id})
            .then(response => response.json())
            .then(data => {
                for (var i = 0 ; i < data.length ; ++i) {
                    form[data[i].id] = {use:false, internal: ""};
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
                    <Fragment key={c.id}>
                    { c.is_physical
                        ? <Form.Group as={Row}>
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
                                label={c.root_title + " : "
                                    + (c.title_eng ? c.title_eng : c.title)}
                                onChange={e => this.handleCheckBox(e, c.id)} />
                        </Col>
                        </Form.Group>
                        : <div/>
                    }
                    </Fragment>)
                }
            </>
        );
    }
}

KitItemsSelect.propTypes = {
    catalog_id: PropTypes.number.isRequired,
    handleLoaded: PropTypes.func.isRequired,
}

export default KitItemsSelect
