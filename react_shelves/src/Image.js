import React, { Component } from 'react';
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import fetchBackend, { BackendURL, uploadBackend } from './Backend'

class Upload extends Component {
    constructor(props) {
        super(props);

        this.inputRef = React.createRef();
    }

    handleUpload = event => {
        uploadBackend(this.props.entity + '/_upload_image', {id:this.props.id},
            this.inputRef.current.files[0])
            .then(response => response.json())
            .then(response => this.props.updateList())
            .catch(e => {});
    }

    render() {
        return (
            <div className="input-group">
              <label className="input-group-btn">
                  <span className="btn btn-primary" onChange={this.handleUpload}>
                      Upload image
                      <input type="file" style={{display: "none"}}
                             ref={this.inputRef} />
                      {/* TODO: multiple property of input*/}
                  </span>
              </label>
            </div>
        );
    }
}

class Image extends Component {
    handleShow = () => {
        this.showForm(this.props.id);
    }

    render() {
        return <div className="col-3">
                <button type="button" className="btn btn-link"
                        onClick={() => this.props.showForm(this.props.id)}>
                  <div className="thumbnail">
                    <img alt="" width="230" height="230"
                         className="figure-img img-fluid rounded"
                         src={BackendURL('uploads/view', {id:this.props.id})}
                         />
                  </div>
                </button>
               </div>;
    }
}

function ImageListRow(props) {
    return <div className="row pt-2">
             { props.row.map((img) =>
                <Image key={img.id} id={img.id}
                    showForm={props.showForm}/>)}
           </div>;
}

class ImageListSection extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            showForm: false,
            showImg: -1,
            rows: []
        };
    }

    handleUpdate = () => {
        fetchBackend(this.props.entity + '/_images', {id:this.props.id})
            .then(response => response.json())
            .then(data => {
                var rows = [];
                while (data.length) {
                    rows.push(data.splice(0, 4));
                }
                this.setState({loading:false, rows:rows});
            })
            .catch(e => this.setState({loading:false}));
    }

    handleCloseForm = () => {
        this.setState({ showForm: false });
    }

    handleShowForm = (showImg) => {
        this.setState({ showForm: true, showImg: showImg });
    }

    handleDeleteImage = () => {
        if (window.confirm('Do you really want to delete this image?')) {
            fetchBackend(this.props.entity + '/_delete_image',
                {id:this.props.id, img:this.state.showImg})
                .then(response => response.json())
                .then(data => {
                    this.handleUpdate();
                })
                .catch(e => {})
                .finally(() => this.handleCloseForm());
        }
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
                    {this.props.auth.isAdmin &&
                      <Upload entity={this.props.entity} id={this.props.id}
                           updateList={this.handleUpdate} />
                    }
                    {this.state.rows.map((row) =>
                       <ImageListRow key={row[0].id} row={row}
                                     showForm={this.handleShowForm} />)}

                    <Modal show={this.state.showForm} size="lg"
                           onHide={this.handleCloseForm}>
                      <Modal.Header closeButton>
                        {this.props.auth.isAdmin &&
                            <Button className="btn btn-outline-danger"
                                onClick={this.handleDeleteImage}>
                              <span aria-hidden="true">Delete image</span>
                            </Button>
                        }
                      </Modal.Header>

                      <Modal.Body>
                        <img src={BackendURL('uploads/view', {id:this.state.showImg})}
                             alt="Full size"
                             className="figure-img img-fluid rounded" width="auto" />
                      </Modal.Body>
                    </Modal>
               </>;
    }
}

export default ImageListSection
