import React, { Component } from 'react';
import PropTypes from 'prop-types'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLaptop, faSave, faFile, faObjectGroup, faArchive } from '@fortawesome/free-solid-svg-icons'
import fetchBackend, { BackendURL, uploadBackend } from '../Backend'
import { CatalogListSection } from './ListSection';

export class Logo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            img_id:this.props.img_id,
            is_physical:this.props.is_physical,
            is_group:this.props.is_group,
            is_kit:this.props.is_kit,
            is_bits:this.props.is_bits,
        }
    }

    handleDoubleClick = () => {
        if (this.props.main && this.props.auth.isAdmin) {
            this.inputRef.click();
        }
    }

    handleUpload = () => {
        if (window.confirm('Do you want to upload new logo?')) {
            uploadBackend('catalog/_set_logo', {id:this.props.id},
                this.inputRef.files[0])
                .then(response => response.json())
                .then(response => {
                    this.setState({img_id:null}, this.handleUpdate);
                })
                .catch(e => {});
        }
    }

    handleUpdate = () => {
        if (!this.state.img_id && this.props.id) {
            fetchBackend('catalog/_get', {id:this.props.id})
                .then(response => response.json())
                .then(data => {
                    this.setState({img_id:data.logo_id,
                        is_physical:data.is_physical, is_kit:data.is_kit,
                        is_group:data.is_group, is_bits:data.is_bits});
                })
                .catch(e => {});
        }
    }

    componentDidMount() {
        this.handleUpdate();
    }

    render() {
        return (
          <div onDoubleClick={this.handleDoubleClick} >
            { this.state.img_id && this.state.img_id !== -1
                ? <img src={ BackendURL('uploads/view', { id:this.state.img_id } ) }
                        alt="logo"
                   />
                : <FontAwesomeIcon icon={
                    this.state.is_physical ? faLaptop
                        : this.state.is_group ? faObjectGroup
                        : this.state.is_kit ? faArchive
                        : this.state.is_bits ? faSave
                        : faFile }
                    size="4x" className="text-muted" />
            }
            {(this.props.main && this.props.auth.isAdmin)
                ? <input type="file" style={{display: "none"}}
                          ref={(ref) => {this.inputRef = ref;}}
                          onChange={this.handleUpload} />
                : ""
            }
          </div>
        );
    }
}

class CatalogNormalItem extends Component {
    render() {
        // TODO: main item
        return <Col xs={12} lg={4} className="pt-4">
                  <Row className="pt-4">
                    <Col xs={3} lg={3} className="align-self-center">
                      <Logo id={this.props.item.id}
                        img_id={this.props.item.logo_id ? this.props.item.logo_id : -1}
                        is_physical={this.props.item.is_physical}
                        is_group={this.props.item.is_group}
                        is_kit={this.props.item.is_kit}
                        is_bits={this.props.item.is_bits} />
                    </Col>
                    <Col xs={9} lg={9}>
                        <a className="action" href={"/catalog/view/" + this.props.item.id}>
                        <h5>{this.props.item.root_title && !this.props.notype
                                    ? this.props.item.root_title + " : " : ""}
                            {this.props.item.title_eng ? this.props.item.title_eng : this.props.item.title}</h5>
                        </a>
                    <h6 className="text-secondary">{this.props.item.title_eng ? this.props.item.title : ""}</h6>
                    <p>
                        <span className="badge badge-secondary">{this.props.item.year}</span>
                        &nbsp;
                        {this.props.item.company
                            ? <a className="text-secondary"
                                href={"/company/view/" + this.props.item.company_id}>
                                {this.props.item.company}
                            </a>
                            : ""}
                        &nbsp;
                        {this.props.item.count > 0
                            ? <span className="badge badge-secondary">{
                                this.props.item.count + ' item' + (this.props.item.count > 1 ? 's' : '')
                                }
                            </span>
                            : ""
                        }
                    </p>
                    </Col>
                  </Row>
               </Col>;
    }
}

class CatalogTinyItem extends Component {
    onClick = (event) => {
        if (this.props.onClick) {
            event.preventDefault();
            this.props.onClick(this.props.item.id);
        }
    }

    render() {
        return (
            <Col xs={12} lg={this.props.lgSize}>
              <Button variant={this.props.onClick ? "light" : "link"}
                className="action"
                href={"/catalog/view/" + this.props.item.id}
                onClick={this.onClick}
                active={this.props.selected} >
                <h5>{this.props.item.root_title && !this.props.notype
                     ? this.props.item.root_title + " : " : ""}
                       {this.props.item.title_eng ? this.props.item.title_eng : this.props.item.title}
                </h5>
              </Button>
            </Col>
        );
    }
}

CatalogTinyItem.defaultProps = {
    selected: false,
}

CatalogTinyItem.propTypes = {
    item: PropTypes.object.isRequired,
    lgSize: PropTypes.number.isRequired,
    selected: PropTypes.bool.isRequired,
    onClick: PropTypes.func,
}

export function CatalogItem(props) {
    if (props.variant === "tiny") {
        return <CatalogTinyItem lgSize={12} {...props} />;
    }
    return <CatalogNormalItem lgSize={4} {...props} />;
}

CatalogItem.defaultProps = {
    notype: false,
    variant: 'normal',
}

CatalogItem.propTypes = {
    variant: PropTypes.oneOf(
        ['normal', 'tiny']
    ).isRequired,
    item: PropTypes.object.isRequired,
    notype: PropTypes.bool,
    onClick: PropTypes.func,
}

export function CatalogLatest(props) {
    return (
        <CatalogListSection
            title="Latest added catalog items"
            filter={{latest:12}}
        />
    );
}

export class CatalogMain extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading:true,
            catalog:{},
        };
    }

    componentDidMount() {
        fetchBackend('catalog/_get_main',
            {id:this.props.id} )
            .then(response => response.json())
            .then(data => {
                this.setState({loading:false, catalog:data});
            })
            .catch(e => this.setState({loading:false}));
    }

    render() {
        if (this.state.loading || !this.state.catalog['id']) {
            return <div/>;
        }
        return (
            <h4 className="text-secondary">
                {"Modification of "}
                <a href={"/catalog/view/" + this.state.catalog.id}>
                  {this.state.catalog.root_title}{" : "}
                  {this.state.catalog.title_eng
                    ? this.state.catalog.title_eng
                    : this.state.catalog.title }
                </a>
            </h4>
        );
    }
}
