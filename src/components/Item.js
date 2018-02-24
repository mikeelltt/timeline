import React, { Component } from 'react';

class Item extends Component {
  constructor(props) {
    super(props);

    this.handleMouseDown = this.handleMouseDown.bind(this);
  }

  handleMouseDown() {
    this.props.onInteract(this.props.item);
  }

  render() {
    const { item: { title, type }, active, left, width } = this.props;
    const style = { left, width };

    return (
      <div
        className={`item${type ? ` item_${type}` : ''}${active ? ' active' : ''}`}
        style={style}
        onMouseDown={this.handleMouseDown}
      >
        <div className="item__title">{title}</div>
      </div>
    );
  }
}

export default Item;
