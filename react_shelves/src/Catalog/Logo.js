import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLaptop, faSave, faFile, faObjectGroup, faArchive, faIndustry } from '@fortawesome/free-solid-svg-icons';
import fetchBackend, { BackendURL, uploadBackend } from '../Backend';

export class Logo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            img_id: this.props.img_id,
            is_physical: this.props.is_physical,
            is_group: this.props.is_group,
            is_kit: this.props.is_kit,
            is_bits: this.props.is_bits,
            is_company: this.props.is_company,
        };
    }
    handleDoubleClick = () => {
        if (this.props.main && this.props.auth.isAdmin) {
            this.inputRef.click();
        }
    };
    handleUpload = () => {
        if (window.confirm('Do you want to upload new logo?')) {
            uploadBackend('catalog/_set_logo', { id: this.props.id }, this.inputRef.files[0])
                .then(response => response.json())
                .then(response => {
                    this.setState({ img_id: null }, this.handleUpdate);
                })
                .catch(e => { });
        }
    };
    handleUpdate = () => {
        if (!this.state.img_id && this.props.id) {
            fetchBackend('catalog/_get_logo', { id: this.props.id })
                .then(response => response.json())
                .then(data => {
                    this.setState({
                        img_id: data.logo,
                        is_physical: data.is_physical, is_kit: data.is_kit,
                        is_group: data.is_group, is_bits: data.is_bits,
                        is_company: data.is_company
                    });
                })
                .catch(e => { });
        }
    };
    componentDidMount() {
        this.handleUpdate();
    }
    render() {
        return (<div onDoubleClick={this.handleDoubleClick}>
            {this.state.img_id && this.state.img_id !== -1
                ? <img src={BackendURL('image/view', { id: this.state.img_id, width: 64, height: 64 })} alt="logo" />
                : <FontAwesomeIcon icon={this.state.is_physical ? faLaptop
                    : this.state.is_group ? faObjectGroup
                        : this.state.is_kit ? faArchive
                            : this.state.is_bits ? faSave
                                : this.state.is_company ? faIndustry
                                    : faFile} size="4x" className="text-muted" />}
            {(this.props.main && this.props.auth.isAdmin)
                ? <input type="file" style={{ display: "none" }} ref={(ref) => { this.inputRef = ref; }} onChange={this.handleUpload} />
                : ""}
        </div>);
    }
}
