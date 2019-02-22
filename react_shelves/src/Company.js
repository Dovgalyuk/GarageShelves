import React, { Component, Fragment } from 'react'
import fetchBackend, { BackendURL } from './Backend'
import { CatalogListSection } from './Catalog'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

function CompanyLogo(props) {
    return (
      <Col xs={1} className="align-self-center">
        { props.img_id
            ? <img src={ BackendURL('uploads/view', { id:props.img_id } ) }
                        alt="" />
            : <span className="text-muted"><i className="fas fa-industry fa-4x"></i></span>
        }
      </Col>
    );
}

function Company(props) {
    return (
        <Fragment>
          <CompanyLogo id={props.company.id} img_id={props.company.logo_id} />
          <Col xs={3}>
            <h3>
              <a className="action" href={"/company/view/" + props.company.id}>
                { props.company.title }
              </a>
            </h3>
            <p>
              <span className="badge badge-secondary">
                { props.company.count } item{ props.company.count > 1 && "s" }
              </span>
            </p>
          </Col>
        </Fragment>
    );
}

function CompaniesRow(props) {
    return <Row className="pt-4">
             { props.row.map((item) => <Company key={item.id} company={item}/>)}
           </Row>;
}

///////////////////////////////////////////////////////////////////////////////
// Routes
///////////////////////////////////////////////////////////////////////////////

export class CompanyView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading:true,
            company:{}
        };
    }

    componentDidMount() {
        fetchBackend('company/_get', {id:this.props.match.params.id})
            .then(response => response.json())
            .then(data => {
                this.setState({loading:false, company:data});
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
            <Container>
              <div className="page-header">
                <Row>
                  <CompanyLogo id={this.state.company.id} img_id={this.state.company.logo_id} />
                  <Col>
                    <h1>
                      { this.state.company.title }
                    </h1>
                  </Col>
                </Row>
              </div>
              <CatalogListSection filter={ {company:this.state.company.id } }
                                  title="Manufactured items" />
            </Container>
        );
    }
}

export class Companies extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading:true,
            rows:[]
        };
    }

    componentDidMount() {
        fetchBackend('company/_filtered_list', this.props.filter)
            .then(response => response.json())
            .then(data => {
                var rows = [];
                while (data.length) {
                    rows.push(data.splice(0, 3));
                }
                this.setState({loading:false, rows:rows});
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
            <Container>
              <Row>
                <div className="page-header">
                  <h1>Companies</h1>
                </div>
              </Row>
             {this.state.rows.map((row) =>
                <CompaniesRow key={row[0].id/*TODO*/} row={row} />)}
            </Container>
        );
    }
}

export default Companies
