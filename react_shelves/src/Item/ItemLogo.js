import React from 'react';
import PropTypes from 'prop-types'
import { BackendURL } from '../Backend';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLaptop } from '@fortawesome/free-solid-svg-icons'

export function ItemLogo(props) {
  var size = props.is_main ? 256 : 64;
  var mul = props.is_main ? 10 : 1;
  return <span className="thumbnail itemLogo">
    {props.img_id ?
      <img src={BackendURL('image/view', { id: props.img_id, width: size, height: size })} width={size} height={size} alt="" className="figure-img img-fluid rounded" />
      : <FontAwesomeIcon icon={faLaptop} className="text-muted" size={mul + "x"}/>
    }
  </span>;
}

ItemLogo.defaultProps = {
    is_main: false,
}

ItemLogo.propTypes = {
    is_main: PropTypes.bool.isRequired,
    img_id: PropTypes.number,
}
