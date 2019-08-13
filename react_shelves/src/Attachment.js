import React, { Component } from 'react';
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import fetchBackend, { BackendURL, uploadBackend } from './Backend'

class FormUpload extends Component {
    constructor(props) {
        super(props);
        this.state = {
            description: "",
            selectedFile: "",
        };
        this.fileRef = React.createRef();
    }

    handleUpload = event => {
        uploadBackend(this.props.entity + '/_upload_file',
                {id: this.props.id, desc: this.state.description},
            this.fileRef.current.files[0])
            .then(response => response.json())
            .then(() => this.props.onUpload())
            .catch(() => {})
            .finally(() => this.handleHide());
    }

    handleHide = event => {
        this.props.onClose();
    }

    handleInput = (event, id) => {
        this.setState({[event.target.id]: event.target.value});
    }

    handleSelectFile = () => {
        this.setState({selectedFile: this.fileRef.current.files[0].name});
    }

    render() {
        return (
            <Modal show={this.props.open}
                   onShow={this.handleShow}
                   onHide={this.handleHide}>
              <Modal.Header closeButton>
                <h4>Upload a file</h4>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <Form.Group as={Row}>
                    <Form.Label column xs={2}>File:</Form.Label>
                    <Col xs={3}>
                      <div className="input-group">
                        <label className="input-group-btn">
                          <span className="btn btn-primary" onChange={this.handleSelectFile}>
                            Choose file
                            <input type="file" style={{display: "none"}}
                                ref={this.fileRef} />
                          </span>
                        </label>
                      </div>
                    </Col>
                    <Col><h5>{this.state.selectedFile}</h5></Col>
                  </Form.Group>
                  <Form.Group as={Row}>
                    <Form.Label column xs={2}>Description:</Form.Label>
                    <Col xs={10}>
                        <Form.Control type="text" id="description"
                            onChange={this.handleInput}
                            value={this.state.description} />
                    </Col>
                  </Form.Group>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={this.handleHide}>
                  Close
                </Button>
                <Button variant="primary" onClick={this.handleUpload}
                  disabled={this.state.selectedFile === ""}>
                  Upload
                </Button>
              </Modal.Footer>
            </Modal>
        );
    }
}

function Attachment(props) {
    return (
        <Row><Col>
            <Button variant="link"
                    href={BackendURL('uploads/download', {id:props.id})}>
                {props.filename}
            </Button>
        </Col><Col>
            {props.description}
        </Col></Row>
    );
}

class AttachmentListSection extends Component {
    constructor(props) {
        super(props);
        this.state = {
            uploadOpen: false,
            loading: true,
            items: []
        };
    }

    handleUpdate = () => {
        fetchBackend(this.props.entity + '/_attachments', {id:this.props.id})
            .then(response => response.json())
            .then(data => {
                this.setState({loading:false, items:data});
            })
            .catch(e => this.setState({loading:false}));
    }

    componentDidMount() {
        this.handleUpdate();
    }

    render() {
        if (this.state.loading) {
            return (
                <div className="row"><div className="col-12">
                  <h3 className="pt-4">
                    {this.props.title} <span className="text-info"> loading</span>
                  </h3>
                </div></div>
            );
        }

        return <>
                    {this.props.title &&
                      <div className="row"><div className="col-12">
                        <h3 className="pt-4">{this.props.title}</h3>
                      </div></div>
                    }
                    {(this.props.auth.isAdmin
                          || (this.props.owner && this.props.auth.user_id === this.props.owner))
                      && <>
                            <Button onClick={() => this.setState({uploadOpen:true})}>
                                Upload file
                            </Button>
                            <FormUpload open={this.state.uploadOpen}
                                 entity={this.props.entity} id={this.props.id}
                                 onClose={() => this.setState({uploadOpen:false})}
                                 onUpload={this.handleUpdate}
                            />
                        </>
                    }
                    {this.state.items.map((item) =>
                       <Attachment key={item.id} {...item} />)}
               </>;
    }
}

export default AttachmentListSection
