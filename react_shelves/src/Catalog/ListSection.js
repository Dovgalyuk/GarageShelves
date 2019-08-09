import React, { Component, Fragment } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Pagination from 'react-bootstrap/Pagination'
import fetchBackend from '../Backend';
import FormCatalogCreate from '../Forms/CatalogCreate';
import { CatalogListRow } from './Helpers';

const PageCount = 300;

export class CatalogListSection extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            rows: [],
            showFormCreate: false,
            page: 0,
            count: -1,
        };
    }
    handleUpdate = (p) => {
        if (this.props.filter.noload) {
            this.setState({loading: false});
            return;
        }
        var page = this.state.page;
        if (p) {
            page = p;
        }
        fetchBackend('catalog/_filtered_count', this.props.filter)
            .then(response => response.json())
            .then(data => this.setState({count: data.count}))
            .catch(e => {});
        fetchBackend('catalog/_filtered_list',
            {...this.props.filter,
                limitFirst: page * PageCount,
                limitPage: PageCount})
            .then(response => response.json())
            .then(data => {
                var rows = [];
                while (data.length) {
                    rows.push(data.splice(0, 3));
                }
                this.setState({ loading: false, page: page, rows: rows });
            })
            .catch(e => this.setState({ loading: false }));
    }
    componentDidMount() {
        this.handleUpdate(0);
    }
    handleCreateButton = event => {
        this.setState({ showFormCreate: true });
    };
    handleFormCreateClose = event => {
        this.setState({ showFormCreate: false });
    };
    handlePage = page => {
        this.handleUpdate(page);
    }
    render() {
        if (this.state.loading) {
            return (<div className="row"><div className="col-12">
                <h3 className="pt-4">
                    {this.props.title} <span className="text-info"> are loading</span>
                </h3>
            </div></div>);
        }
        const pages = Math.ceil(this.state.count / PageCount);
        const page = this.state.page;
        var ellipsis1 = false;
        var ellipsis2 = false;
        return <Fragment>
            {(this.state.count > 0 || this.props.addButton)
                && <Row>
                    <Col>
                        <h3 className="pt-4">
                            {this.props.title} &nbsp;
                            {this.state.count > 0
                              ? <Badge variant="secondary">
                                  {this.state.count}
                                  {" item"}{this.state.count > 1 ? "s" : ""}</Badge>
                              : <div/>} &nbsp;
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
            {this.state.count > 0
              ? <Row className="pt-4">
                <Col>
                    <Pagination>
                        <Pagination.Prev disabled={page === 0}
                            onClick={() => this.handlePage(page - 1)} />
                        {[...Array(pages).keys()].map(p => {
                            if ((p >= page - 1 && p <= page + 1) || p === 0 || p === pages - 1)
                                return <Pagination.Item key={p}
                                    onClick={() => this.handlePage(p)}
                                    active={page === p}>{p + 1}
                                </Pagination.Item>;
                            if (p < page - 1 && !ellipsis1)
                            {
                                ellipsis1 = true;
                                return <Pagination.Ellipsis disabled key={p}/>;
                            }
                            if (p > page + 1 && !ellipsis2)
                            {
                                ellipsis2 = true;
                                return <Pagination.Ellipsis disabled key={p}/>;
                            }
                            return "";
                        })}
                        <Pagination.Next disabled={page === pages - 1}
                            onClick={() => this.handlePage(page + 1)} />
                    </Pagination>
                </Col>
                </Row>
              : <div/>
            }
            {(this.props.addButton && this.props.auth
                && this.props.auth.isAuthenticated)
                ? <FormCatalogCreate open={this.state.showFormCreate} onClose={this.handleFormCreateClose} handleUpdateItems={this.handleUpdate} {...this.props.filter} />
                : <div />}
        </Fragment>;
    }
}
