import React, { Component, Fragment } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import fetchBackend from '../Backend';
import FormCatalogCreate from '../Forms/CatalogCreate';
import { CatalogListRow } from './Helpers';

export class CatalogListSection extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            rows: [],
            showFormCreate: false,
        };
    }
    handleUpdate = () => {
        if (this.props.filter.noload) {
            this.setState({loading: false});
            return;
        }
        fetchBackend('catalog/_filtered_list', this.props.filter)
            .then(response => response.json())
            .then(data => {
                var rows = [];
                while (data.length) {
                    rows.push(data.splice(0, 3));
                }
                this.setState({ loading: false, rows: rows });
            })
            .catch(e => this.setState({ loading: false }));
    }
    componentDidMount() {
        this.handleUpdate();
    }
    handleCreateButton = event => {
        this.setState({ showFormCreate: true });
    };
    handleFormCreateClose = event => {
        this.setState({ showFormCreate: false });
    };
    render() {
        if (this.state.loading) {
            return (<div className="row"><div className="col-12">
                <h3 className="pt-4">
                    {this.props.title} <span className="text-info"> are loading</span>
                </h3>
            </div></div>);
        }
        return <Fragment>
            {(this.state.rows.length > 0 || this.props.addButton)
                && <Row>
                    <Col>
                        <h3 className="pt-4">
                            {this.props.title} &nbsp;
                       {(this.props.addButton
                                && this.props.auth
                                && this.props.auth.isAuthenticated)
                                ? <Button type="button" className="btn btn-primary" onClick={this.handleCreateButton}>
                                    Add new
                                  </Button>
                                : <div />}
                        </h3>
                    </Col>
                </Row>}
            {this.state.rows.map((row) => <CatalogListRow key={row[0].id /*TODO*/} row={row} notype={this.props.filter.notype} />)}
            {(this.props.addButton && this.props.auth
                && this.props.auth.isAuthenticated)
                ? <FormCatalogCreate open={this.state.showFormCreate} onClose={this.handleFormCreateClose} handleUpdateItems={this.handleUpdate} {...this.props.filter} />
                : <div />}
        </Fragment>;
    }
}
