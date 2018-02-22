import React, { Component } from 'react';

class HeaderItem extends Component {
  render() {
    const { label, left, width } = this.props;

    return (
      <div style={{ left: left, width: width, textAlign: 'center' }} className="line">{label}</div>
    );
  }
}

export default HeaderItem;
