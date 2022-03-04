import React, { Component } from 'react';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import fetchBackend, { postBackend } from './Backend'
import ReactMarkdown from 'react-markdown';

function CommentsHeader() {
    return (
      <Row>
        <Col>
          <h3 className="pt-4">Comments</h3>
        </Col>
      </Row>
    );
}

function Comment(props) {
    return (
      <>
        <Row>
          <Col>
            <span className="font-weight-bold">{props.comment.username} </span>
            at
            <span className="font-italic"> {props.comment.created}</span>
              { props.showRefs ?
                  <>
                    <span> commented the {
                      props.comment.catalog_id
                        ? "catalog "
                        : "collection "}
                      item </span>
                    <a href={
                        props.comment.catalog_id
                          ? "catalog/view/" + props.comment.catalog_id
                          : "item/view/" + props.comment.item_id
                    }>{
                      props.comment.catalog_title_eng
                        ? props.comment.catalog_title_eng
                        : props.comment.catalog_title
                    }</a>
                  </>
              : <div/>
              }
          </Col>
        </Row>
        <Row>
          <Col>
            <ReactMarkdown className="border">{props.comment.message}</ReactMarkdown>
          </Col>
        </Row>
        <Row>
          <Col>
            &nbsp;
          </Col>
        </Row>
      </>
    );
}

class CommentList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading:true,
            list:[]
        }
    }

    componentDidMount() {
        this.handleUpdate();
    }

    handleUpdate = () => {
        fetchBackend('comment/' + this.props.section,
            {id:this.props.id})
        .then(response => response.json())
        .then(data => {
            this.setState({loading:false, list:data});
        })
        .catch(e => this.setState({loading:false}));
    }

    render() {
        if (this.state.loading) {
            return <Row><Col>Loading...</Col></Row>;
        }
        var counter = 0;
        return (
          <>
            { this.state.list.map(c => <Comment key={c.id}
                                                counter={++counter}
                                                comment={c}
                                                showRefs={this.props.showRefs}/>) }
          </>
        );
    }
}

class CommentEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
          value:""  
        };
    }

    onChange = e => {
      this.setState({value:e.target.value});
    }

    onSend = () => {
      var value = this.state.value;
      this.setState({value:""});
      postBackend('comment/' + this.props.section + '/add', {},
        {id:this.props.id, comment:value})
        .catch(e => {})
        .finally(e => {this.props.onUpdate()});

    }

    render() {
      if (!this.props.auth.isAuthenticated) {
          return <div/>;
      }
      return (
              <>
                <h3>Add new comment</h3>
                <textarea
                  value={this.state.value}
                  onChange={this.onChange}
                  rows={5} cols={80}
                />
                <br/>
                <Button onClick={this.onSend} disabled={this.state.value.length < 3}>Send</Button>
              </>
            );
    }
}

class CommentsSection extends Component {
  onUpdate = () => {
      this.list.handleUpdate();
  }

  render() {
      return (
        <>
          <CommentsHeader/>
          <CommentList ref={(ref) => {this.list = ref;}}
                       section={this.props.section} id={this.props.id} />
          <CommentEditor section={this.props.section} auth={this.props.auth}
                         id={this.props.id}
                         onUpdate={this.onUpdate}/>
        </>
      );
  }
}

export function CatalogComments(props) {
    return (
        <CommentsSection section="catalog" auth={props.auth}
                         id={props.id} />
    );
}

export function ItemComments(props) {
  return (
      <CommentsSection section="item" auth={props.auth}
                       id={props.id} />
  );
}

export function LatestComments(props) {
  return (
    <>
      <Row>
        <Col>
          <h3 className="pt-4">Latest catalog and collection comments</h3>
        </Col>
      </Row>
      <CommentList section="latest" showRefs={true} />
    </>    
  );
}