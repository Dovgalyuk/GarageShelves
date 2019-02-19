import React, { Component } from 'react';
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
    render() {
        return <div className="col-3">
                <button type="button" className="btn btn-link" data-toggle="modal"
                        data-target="#photoModal" data-whatever={this.props.id}>
                  <div className="thumbnail">
                    <img alt="" width="230" height="230"
                         className="figure-img img-fluid rounded"
                         src={BackendURL('uploads/view', {id:this.props.id})} />
                  </div>
                </button>
               </div>;
    }
}

function ImageListRow(props) {
    return <div className="row pt-2">
             { props.row.map((img) => <Image key={img.id} id={img.id} />)}
           </div>;
}

class ImageListSection extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
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
                      <ImageListRow key={row[0].id} row={row} />)}
               </>;
    }
}

export default ImageListSection
