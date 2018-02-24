import React, { Component } from 'react';

class PeriodItem extends Component {
  render() {
    const { label, left, width } = this.props;
    const style = { left, width };

    return (
      <div style={style} className="period-item">
        <div className="period-item__label">{label}</div>
      </div>
    );
  }
}

export default PeriodItem;
