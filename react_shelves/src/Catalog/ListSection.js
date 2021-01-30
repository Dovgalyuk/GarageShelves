import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Pagination from 'react-bootstrap/Pagination'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFilter } from '@fortawesome/free-solid-svg-icons'
import fetchBackend, { postBackend } from '../Backend';
import FormCatalogCreate from '../Forms/CatalogCreate';
import FormCatalogFilter from '../Forms/Filter';
import FormCatalogSelect from '../Forms/CatalogSelect'
import { CatalogItem } from "./CatalogItem";

export class CatalogListSection extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            rows: [],
            showFormCreate: false,
            showFormFilter: false,
            showFormAdd: false,
            filter: {},
            page: 0,
            count: -1,
            selectedItems: [],
        };
    }

    isTiny = () => {
        return this.props.variant === "tiny";
    }

    handleUpdate = (page) => {
        if (this.props.filter.noload) {
            this.setState({loading: false});
            return;
        }
        if (typeof(page) === 'undefined')
            page = this.state.page;
        fetchBackend('catalog/_filtered_count',
            {...this.props.filter, ...this.state.filter} )
            .then(response => response.json())
            .then(data => this.setState({count: data.count}))
            .catch(e => {});
        fetchBackend('catalog/_filtered_list',
            {...this.props.filter, ...this.state.filter,
                limitFirst: page * this.props.pageCount,
                limitPage: this.props.pageCount})
            .then(response => response.json())
            .then(data => {
                var rows = [];
                while (data.length) {
                    rows.push(data.splice(0, this.props.rowCount));
                }
                this.setState({ loading: false, page: page, rows: rows,
                              selectedItems: [] });
            })
            .catch(e => this.setState({ loading: false }));
    }
    componentDidMount() {
        this.handleUpdate(0);
    }
    handleCreateButton = event => {
        this.setState({ showFormCreate: true });
    }
    handleFormCreateClose = event => {
        this.setState({ showFormCreate: false });
    }

    /* Add existing subitem */

    handleAddButton = () => {
        this.setState({showFormAdd:true});
    }

    handleFormAddClose = () => {
        this.setState({showFormAdd:false});
    }

    handleFormAddSelect = (subitem) => {
        postBackend('catalog/_relation_add', {},
            {id1:this.props.mainId, id2:subitem, rel:this.props.addRelation})
            .then(response => response.json())
            .then(data => {
                if (data.result === "error") {
                    alert("Error: " + data.error);
                }}
            )
            .catch(e => {})
            .finally((e) => {
                this.handleUpdate(this.state.page);
            });
    }


    handlePage = page => {
        this.handleUpdate(page);
    }

    handleFilterUpdate = filter => {
        this.setState({filter:filter},
            () => this.handleUpdate(0));
    }

    handleSelect = id => {
        this.setState({selectedItems: [id,]},
            () => this.props.onSelection(this.state.selectedItems));
    }

    render() {
        if (this.state.loading) {
            return (<div className="row"><div className="col-12">
                <h3 className="pt-4">
                    {this.props.title} <span className="text-info"> loading</span>
                </h3>
            </div></div>);
        }
        const pages = Math.ceil(this.state.count / this.props.pageCount);
        const page = this.state.page;
        var ellipsis1 = false;
        var ellipsis2 = false;
        return <Fragment>
            {this.props.title
                && (this.state.count > 0
                    || this.props.addButton
                    || this.props.addFilter
                    || this.props.buttons
                    || Object.keys(this.state.filter).length > 0)
                && <Row>
                    <Col>
                        <h3 className="pt-4">
                            {this.props.title} &nbsp;
                            {this.state.count > 0
                              ? <Badge variant="secondary">
                                  {this.state.count}
                                  {" item"}{this.state.count > 1 ? "s" : ""}</Badge>
                              : ""} &nbsp;
                            {(this.props.addButton
                                && this.props.auth
                                && this.props.auth.isAuthenticated)
                                ? <Button variant="primary" onClick={this.handleCreateButton}>
                                    Add new
                                  </Button>
                                : ""} &nbsp;
                            { this.props.auth && this.props.auth.isAuthenticated
                                && this.props.addFilter && this.props.mainId
                                ? <Button variant="primary"
                                            onClick={this.handleAddButton}>
                                    Add existing
                                </Button>
                                : ""
                            }
                            &nbsp;
                            {this.props.buttons}
                            &nbsp;
                            <Button variant={Object.keys(this.state.filter).length > 0 ? "primary" : "light"}
                                onClick={() => this.setState({showFormFilter:true})}
                            >
                                <FontAwesomeIcon icon={faFilter} />
                            </Button>
                        </h3>
                    </Col>
                </Row>}
            {this.state.rows.map((row) =>
                <Row key={row[0].id}>
                    {row.map((item) =>
                        <CatalogItem key={item.list_id} variant={this.props.variant}
                            item={item} notype={this.props.filter.notype}
                            selected={this.state.selectedItems.includes(item.id)}
                            onClick={this.props.onSelection ? this.handleSelect : null} />
                    )}
                </Row>
            )}
            {pages > 1 && !this.props.filter.latest
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
                ? <FormCatalogCreate open={this.state.showFormCreate}
                                     onClose={this.handleFormCreateClose}
                                     handleUpdateItems={() => this.handleUpdate(this.state.page)}
                                     {...this.props.filter} />
                : <div />}
            <FormCatalogFilter open={this.state.showFormFilter}
                onClose={() => this.setState({showFormFilter:false})}
                onConfirm={this.handleFilterUpdate} />
            { this.props.addFilter && this.props.mainId
              && this.props.auth && this.props.auth.isAuthenticated
                ? <FormCatalogSelect open={this.state.showFormAdd}
                        title="Add existing subitem"
                        onClose={this.handleFormAddClose}
                        onSelect={this.handleFormAddSelect}
                        filter={this.props.addFilter} />
                : <div />}
        </Fragment>;
    }
}

CatalogListSection.defaultProps = {
    variant: 'normal',
    pageCount: 99,
    rowCount: 3,
}

CatalogListSection.propTypes = {
    variant: PropTypes.oneOf(
        ['normal', 'tiny']
    ).isRequired,
    mainId: PropTypes.number,
    filter: PropTypes.object.isRequired,
    addFilter: PropTypes.object,
    addRelation: PropTypes.string,
    pageCount: PropTypes.number.isRequired,
    rowCount: PropTypes.number.isRequired,
    onClick: PropTypes.func,
    onSelection: PropTypes.func,
}
