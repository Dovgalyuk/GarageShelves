import React, { Component } from 'react';
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import PropTypes from 'prop-types'
import fetchBackend, { BackendURL } from './Backend'
import { FormUpload } from './Forms/Upload';

export class Image extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            description: ""
        };
    }

    componentDidMount() {
        fetchBackend('image/get', {id:this.props.id})
            .then(response => response.json())
            .then(data => {
                this.setState({loading:false, description:data.description});
            })
            .catch(e => this.setState({loading:false}));
    }

    handleClick = () => {
        this.props.showForm(this.props.id);
    }

    render() {
        return <div className="col-3">
                <button type="button" className="btn btn-link"
                        onClick={this.handleClick}>
                  <div className="thumbnail">
                    <img alt={this.state.description} width="256" height="256"
                         className="figure-img img-fluid rounded"
                         src={BackendURL('image/view', {id:this.props.id, width: 256, height: 256})}
                         />
                  </div>
                </button>
                <center>{this.state.description}</center>
               </div>;
    }
}

Image.defaultProps = {
    showForm: (id) => {},
    description: "",
}

Image.propTypes = {
    id: PropTypes.number.isRequired,
    showForm: PropTypes.func.isRequired,
    description: PropTypes.string.isRequired,
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
            uploadOpen: false,
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
                    {(this.props.auth.isAuthenticated
                          || (this.props.owner && this.props.auth.user_id === this.props.owner))
                      ? <>
                            <Button onClick={() => this.setState({uploadOpen:true})}>
                                Upload image
                            </Button>
                            <FormUpload open={this.state.uploadOpen}
                                type="image"
                                entity={this.props.entity} id={this.props.id}
                                onClose={() => this.setState({uploadOpen:false})}
                                onUpload={this.handleUpdate}
                            />
                        </>
                      : <div/>
                    }
                    {this.state.rows.map((row) =>
                       <ImageListRow key={row[0].id} row={row}
                                     showForm={this.handleShowForm} />)}

                    <Modal show={this.state.showForm} size="lg"
                           onHide={this.handleCloseForm}>
                      <Modal.Header closeButton>
                        {(this.props.auth.isAdmin
                          || (this.props.owner && this.props.auth.user_id === this.props.owner))
                          ? <Button className="btn btn-outline-danger"
                                 onClick={this.handleDeleteImage}>
                               <span aria-hidden="true">Delete image</span>
                             </Button>
                          : <div/>
                        }
                      </Modal.Header>

                      <Modal.Body>
                        <img src={BackendURL('image/view', {id:this.state.showImg})}
                             alt="Full size"
                             className="figure-img img-fluid rounded" width="auto" />
                      </Modal.Body>
                    </Modal>
               </>;
    }
}

export default ImageListSection
