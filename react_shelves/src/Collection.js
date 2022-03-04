import React from 'react'
import ReactMarkdown from 'react-markdown';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBoxes } from '@fortawesome/free-solid-svg-icons'

export function Collection(props) {
    return (
      <Row className="pt-4">
        <Col xs={1}>
          <FontAwesomeIcon icon={faBoxes} className="text-muted" size="4x"/>
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
          <ReactMarkdown>{ props.collection.description }</ReactMarkdown>
        </Col>
      </Row>
    );
}
