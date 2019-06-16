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
      <Row>
        <Col xs={1} sm={2}>
          <h5>{props.comment.username}</h5>
          <br/>
          <span className="font-italic">{props.comment.created}</span>
        </Col>
        <Col>
          <ReactMarkdown source={props.comment.message} />
        </Col>
      </Row>
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
                                                comment={c}/>) }
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
      postBackend('comment/catalog/add', {},
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

export class CatalogComments extends Component {
    // constructor(props) {
    //     super(props);
    // }

    onUpdate = () => {
        this.list.handleUpdate();
    }

    render() {
        return (
          <>
            <CommentsHeader/>
            <CommentList ref={(ref) => {this.list = ref;}}
                         section="catalog" id={this.props.id} />
            <CommentEditor section="catalog" auth={this.props.auth}
                           id={this.props.id}
                           onUpdate={this.onUpdate}/>
          </>
        );
    }
}
