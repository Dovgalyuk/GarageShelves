import React, { Component, Fragment } from 'react';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import ReactDiffViewer from 'react-diff-viewer'
import fetchBackend, { postBackend } from '../Backend'
import { Logo } from '../Catalog'

class ChangeCompany extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading1:true,
            loading2:true,
            company1:{},
            company2:{},
        };
    }

    componentDidMount() {
        fetchBackend('company/_get', {id:this.props.company1})
            .then(response => response.json())
            .then(data => {
                this.setState({loading1:false, company1:data});
            })
            .catch(e => this.setState({loading1:false}));
        fetchBackend('company/_get', {id:this.props.company2})
            .then(response => response.json())
            .then(data => {
                this.setState({loading2:false, company2:data});
            })
            .catch(e => this.setState({loading2:false}));
    }

    render() {
        if (this.state.loading1 || this.state.loading2)
            return <div>Loading...</div>;
        return (
            <Fragment>
                Company from&nbsp;
                {this.state.company1.id
                    ? <a className="text-secondary"
                        href={"/company/view/" + this.state.company1.id}>
                        {this.state.company1.title}
                      </a>
                    : "none"}
                &nbsp;to&nbsp;
                {this.state.company2.id
                    ? <a className="text-secondary"
                        href={"/company/view/" + this.state.company2.id}>
                        {this.state.company2.title}
                      </a>
                    : "none"}
            </Fragment>
        );
    }
}

function ChangeField(props) {
    if (props.field === "year") {
        return (
            <Fragment>
                Year from&nbsp;
                <span className="badge badge-secondary">{props.old_value}</span>
                &nbsp;to <span className="badge badge-secondary">{props.value}</span>
            </Fragment>);
    }
    if (props.field === "description") {
        return (
            <Fragment>
                Description
                <ReactDiffViewer
                    oldValue={props.old_value}
                    newValue={props.value}
                    splitView={false}
                    hideLineNumbers={true}
                />
            </Fragment>);
    }
    if (props.field === "title") {
        return (
            <Fragment>
                Title
                <ReactDiffViewer
                    oldValue={props.old_value}
                    newValue={props.value}
                    splitView={false}
                    hideLineNumbers={true}
                />
            </Fragment>);
    }
    if (props.field === "title_eng") {
        return (
            <Fragment>
                Title in English
                <ReactDiffViewer
                    oldValue={props.old_value}
                    newValue={props.value}
                    splitView={false}
                    hideLineNumbers={true}
                />
            </Fragment>);
    }
    if (props.field === "company_id") {
        return <ChangeCompany company1={props.old_value} company2={props.value} />;
    }
    return (<Fragment>
                <p>Field={props.field}</p>
                <p>Old Value={props.old_value}</p>
                <p>Value={props.value}</p>
            </Fragment>);
}

class ChangeItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loadingCatalog:true,
            catalog:{},
            loadingUser:true,
            user:{},
        };
    }

    componentDidMount() {
        fetchBackend('catalog/_get', {id:this.props.item.catalog_id})
            .then(response => response.json())
            .then(data => {
                this.setState({loadingCatalog:false, catalog:data});
            })
            .catch(e => this.setState({loadingCatalog:false}));
        fetchBackend('auth/get', {id:this.props.item.user_id})
            .then(response => response.json())
            .then(data => {
                this.setState({loadingUser:false, user:data});
            })
            .catch(e => this.setState({loadingUser:false}));
    }

    handleApprove = () => {
        postBackend('changelog/approve', {id:this.props.item.id})
            .catch(e => {})
            .finally(e => this.props.update());
        ;
    }

    handleUndo = () => {
        postBackend('changelog/undo', {id:this.props.item.id})
            .catch(e => {})
            .finally(e => this.props.update());
        ;
    }

    render() {
        return (
            <Row>
              <Col xs={1}>
                <Logo id={this.props.item.catalog_id} />
              </Col>
              <Col>
                { !this.state.loadingCatalog &&
                    <a className="action" href={"/catalog/view/" + this.props.item.id}>
                      <h5>{this.state.catalog.type_title
                               ? this.state.catalog.type_title + " : " : ""}
                          {this.state.catalog.title_eng ? this.state.catalog.title_eng : this.state.catalog.title}</h5>
                    </a>
                }
                <ChangeField field={this.props.item.field}
                             old_value={this.props.item.old_value || ""}
                             value={this.props.item.value || ""} />
                { !this.state.loadingUser &&
                  <p>Changed by <span className="font-italic">{this.state.user.username}</span> at <span className="font-italic">{this.props.item.created}</span>
                  </p>
                }
                <hr/>
              </Col>
              <Col xs={1}>
                <Button variant="success"
                      onClick={this.handleApprove}>
                  Approve
                </Button>
                &nbsp;
                <Button variant="danger"
                      onClick={this.handleUndo}>
                  Undo
                </Button>
                &nbsp;
              </Col>
            </Row>
        );
    }
}

export class Changelog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading:true,
            log:[],
        };
    }

    componentDidMount() {
        this.handleUpdate();
    }

    componentDidUpdate() {
        if (!this.props.auth.isAdmin) {
            this.props.history.push("/");
        }
    }

    handleUpdate = () => {
        fetchBackend('changelog/list')
            .then(response => response.json())
            .then(data => {
                this.setState({loading:false, log:data});
            })
            .catch(e => this.setState({loading:false}));
    }

    render() {
        if (this.state.loading) {
            return (
                <div>Loading...</div>
            );
        }
        return (
          <Fragment>
            <Row>
              <h1>History of catalog edit operations</h1>
            </Row>
            { this.state.log.map((log) =>
                <ChangeItem key={log.id} item={log} update={this.handleUpdate} /> )
            }
          </Fragment>
        );
    }
}

export default Changelog
