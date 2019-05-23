import React from 'react'
import ReactMarkdown from 'react-markdown';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

export function Collection(props) {
    return (
      <Row className="pt-4">
        <Col xs={1}>
          <span className="text-muted"><i className="fas fa-boxes fa-4x"></i></span>
        </Col>
        <Col xs={11}>
          <h2>
            <a className="action" href={"/collection/view/" + props.collection.id}>
              { props.collection.title }
            </a>
            <small> owned by { props.collection.username }</small>
          </h2>
          <p>
            <span className="badge badge-secondary">
              { props.collection.count } item{ props.collection.count > 1 && "s"}
            </span>
          </p>
          <ReactMarkdown source={ props.collection.description } />
        </Col>
      </Row>
    );
}
