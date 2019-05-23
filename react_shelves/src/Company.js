import React, { Fragment } from 'react'
import { BackendURL } from './Backend'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

export function CompanyLogo(props) {
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

export function Company(props) {
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

export function CompaniesRow(props) {
    return <Row className="pt-4">
             { props.row.map((item) => <Company key={item.id} company={item}/>)}
           </Row>;
}
