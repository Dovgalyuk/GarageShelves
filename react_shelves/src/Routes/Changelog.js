import React, { Component, Fragment } from 'react';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import fetchBackend, { postBackend } from '../Backend'
import { Logo } from '../Catalog'

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
                <p>Field={this.props.item.field}</p>
                <p>Old Value={this.props.item.old_value}</p>
                <p>Value={this.props.item.value}</p>
                { !this.state.loadingUser &&
                  <p>Changed by <span class="font-italic">{this.state.user.username}</span> at <span class="font-italic">{this.props.item.created}</span>
                  </p>
                }
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
