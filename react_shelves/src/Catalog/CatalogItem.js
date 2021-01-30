import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { Logo } from './Logo';
import { PlatformButtons } from './Families'

class CatalogNormalItem extends Component {
    render() {
        // TODO: main item
        return <Col xs={12} lg={4} className="pt-4">
            <Row className="pt-4">
                <Col xs={3} lg={3} className="align-self-center">
                    <Logo id={this.props.item.id}
                        is_physical={this.props.item.is_physical}
                        is_group={this.props.item.is_group}
                        is_kit={this.props.item.is_kit}
                        is_bits={this.props.item.is_bits}
                        is_company={this.props.item.is_company} />
                </Col>
                <Col xs={9} lg={9}>
                    <a className="action" href={"/catalog/view/" + this.props.item.id}>
                        <h5>

                            {this.props.item.root_title && !this.props.notype
                                ? this.props.item.root_title + " : " : ""}
                            {this.props.item.title_eng ? this.props.item.title_eng : this.props.item.title}
                        </h5>
                    </a>
                    <h6 className="text-secondary">{this.props.item.title_eng ? this.props.item.title : ""}</h6>
                    <p>
                        <span className="badge badge-secondary">{this.props.item.year}</span>
                        &nbsp;
                        {this.props.item.company
                            ? <a className="text-secondary"
                                href={"/catalog/view/" + this.props.item.company_id}>
                                {this.props.item.company}
                            </a>
                            : ""}
                        &nbsp;
                        {this.props.item.count > 0
                            ? <span className="badge badge-secondary">{this.props.item.count + ' item' + (this.props.item.count > 1 ? 's' : '')}
                            </span>
                            : ""}
                    </p>
                    <PlatformButtons id={this.props.item.id} tiny />
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
    };

    render() {
        return (
            <Col xs={12} lg={this.props.lgSize}>
                <Button variant={this.props.onClick ? "light" : "link"}
                    className="action"
                    href={"/catalog/view/" + this.props.item.id}
                    onClick={this.onClick}
                    active={this.props.selected}>
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
};

CatalogTinyItem.propTypes = {
    item: PropTypes.object.isRequired,
    lgSize: PropTypes.number.isRequired,
    selected: PropTypes.bool.isRequired,
    onClick: PropTypes.func,
};

export function CatalogItem(props) {
    if (props.variant === "tiny") {
        return <CatalogTinyItem lgSize={12} {...props} />;
    }
    return <CatalogNormalItem lgSize={4} {...props} />;
}

CatalogItem.defaultProps = {
    notype: false,
    variant: 'normal',
};

CatalogItem.propTypes = {
    variant: PropTypes.oneOf(
        ['normal', 'tiny']
    ).isRequired,
    item: PropTypes.object.isRequired,
    notype: PropTypes.bool,
    onClick: PropTypes.func,
};
