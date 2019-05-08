import React, { Component, Fragment } from 'react';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Media from 'react-bootstrap/Media'
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

    render() {
        return (
            <Media>
              <Logo id={this.props.item.catalog_id} />
              <Media.Body>
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
              </Media.Body>
            </Media>
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
            <ul className="list-unstyled">
            { this.state.log.map((log) => <ChangeItem key={log.id} item={log} /> )
            }
            </ul>
          </Fragment>
        );
    }
}

export default Changelog
