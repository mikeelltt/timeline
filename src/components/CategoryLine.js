import React, { Component } from 'react';

class CategoryLine extends Component {
  render() {
    const { title } = this.props;

    return (
      <div className='category-line'>
        <div className="category-line__title">{title}</div>
      </div>
    );
  }
}

export default CategoryLine;
