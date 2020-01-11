import React, { Component } from 'react';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button'
import PropTypes from 'prop-types'
import { ItemLogo } from "./ItemLogo";

export class Item extends Component{
    onClick = (event) => {
        if (this.props.onClick) {
            event.preventDefault();
            this.props.onClick(this.props.item.id);
        }
    }

    render() {
        var size = this.props.is_main ? 12 : 4;
        var size_xs = this.props.is_main ? 12 : 6;
        return <Col xs={size_xs} lg={size} className="align-self-center">
            <ItemLogo id={this.props.item.id}
                img_id={this.props.item.img_id} is_main={this.props.is_main} />
            {this.props.is_main ? <br /> : <span />}
            <Button variant={this.props.onClick ? "light" : "link"}
                href={"/item/view/" + this.props.item.id}
                onClick={this.onClick}
                active={this.props.selected} >
            {/* TODO: don't use fa class        */}
            <strong className={this.props.is_main ? "fa-2x" : ""}>
            {this.props.item.root_title + " : "
                + (this.props.item.title_eng ? this.props.item.title_eng : this.props.item.title)}
            {this.props.item.internal_id
                ? <span className="text-secondary">{" (" + this.props.item.internal_id + ")"}</span>
                : <span />}
            </strong>
            </Button>
            {this.props.item.username
                ? <>
                    <br />{"Owned by "}
                    <a href={"/collection/view/" + this.props.item.collection_id}>
                    {this.props.item.username}
                    </a>
                </>
                : <span />}
        </Col>;
  }
}

Item.defaultProps = {
    is_main: false,
    selected: false,
}

Item.propTypes = {
    item: PropTypes.object.isRequired,
    is_main: PropTypes.bool.isRequired,
    selected: PropTypes.bool.isRequired,
    onClick: PropTypes.func,
}
