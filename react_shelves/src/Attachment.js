import React, { Component } from 'react';
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Button from 'react-bootstrap/Button'
import fetchBackend, { BackendURL } from './Backend'
import { FormUpload } from './Forms/Upload';

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
                                type="file"
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
