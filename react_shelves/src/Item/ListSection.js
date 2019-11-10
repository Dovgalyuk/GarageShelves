import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types'
import fetchBackend from '../Backend';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Item } from "./Item";

export class ItemListSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingList: true,
      loadingMain: true,
      main: [],
      rows: [],
      selectedItems: [],
    };
  }

  handleUpdate = () => {
    this.setState({ loadingMain: true, loadingList: true }, () => {
      fetchBackend('item/_filtered_list', { ...this.props.filter, is_main: 0 })
        .then(response => response.json())
        .then(data => {
          var rows = [];
          while (data.length) {
            rows.push(data.splice(0, 3));
          }
          this.setState({ loadingList: false, rows: rows });
        })
        .catch(e => this.setState({ loadingList: false }));
      if (this.props.filter.parent) {
        fetchBackend('item/_filtered_list', { ...this.props.filter, is_main: 1 })
          .then(response => response.json())
          .then(data => {
            this.setState({ loadingMain: false, main: data });
          })
          .catch(e => this.setState({ loadingMain: false }));
      }
      else {
        this.setState({ loadingMain: false });
      }
    });
  };
  componentDidMount() {
    this.handleUpdate();
  }

  handleSelect = id => {
    this.setState({selectedItems: [id,]},
        () => this.props.onSelection(this.state.selectedItems));
  }

  render() {
    if (this.state.loadingList || this.state.LoadingMain) {
      return (<div className="row"><div className="col-12">
        <h3 className="pt-4">
          {this.props.title} <span className="text-info"> are loading</span>
        </h3>
      </div></div>);
    }
    return <Fragment>
      {(this.state.rows.length > 0 || this.state.main.length > 0)
        && this.props.title
        ? <Row><Col>
          <h3 className="pt-4">
            {this.props.title}
          </h3>
        </Col></Row>
        : <div />}
      {this.state.main.length > 0
        ? <Row className="pt-4">
          <Item item={this.state.main[0]} is_main={true} />
        </Row>
        : <div />}
      {this.state.rows.map((row) => <Row key={row[0].id}>
          { row.map((item) => <Item key={item.id} item={item}
                selected={this.state.selectedItems.includes(item.id)}
                onClick={this.props.onSelection ? this.handleSelect : null}
            />)
          }
          </Row>)
      }
    </Fragment>;
  }
}

ItemListSection.defaultProps = {
    filter: {},
}

ItemListSection.propTypes = {
    filter: PropTypes.object.isRequired,
    title: PropTypes.string.isRequired,
    onSelection: PropTypes.func,
}
