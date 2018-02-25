import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DateHelper from './helpers/DateHelper';
import PeriodItem from './components/PeriodItem';
import CategoryLine from "./components/CategoryLine";
import Item from './components/Item';

import './styles/index.css';

class Timeline extends Component {
  static propTypes = {
    categories: PropTypes.array,
    items: PropTypes.array.isRequired,
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
    minZoom: PropTypes.number,
    maxZoom: PropTypes.number,
    onItemMoved: PropTypes.func
  };

  static defaultProps = {
    minZoom: 60 * 60 * 1000,    // 1 hour
    maxZoom: 365 * 86400 * 1000 // 1 year
  };

  constructor(props) {
    super(props);

    this.handleWheel = this.handleWheel.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleItemInteract = this.handleItemInteract.bind(this);

    this.state = {
      timeStart: this.props.start,
      timeEnd: this.props.end,
      timeDelta: this.props.end - this.props.start,
      canvasWidth: 0,
      dragging: false,
      mouseStartX: 0,
      mouseOffsetX: 0,
      activeItem: null
    };
  }

  // React

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    document.addEventListener('mouseup', this.handleMouseUp);

    this.resize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }

  // Methods

  posToTime(offsetX, start = this.state.timeStart) {
    const { timeDelta, canvasWidth } = this.state;
    return start + offsetX * timeDelta / canvasWidth;
  }

  timeToPos(point) {
    const { timeStart, timeDelta, canvasWidth } = this.state;
    return (point - timeStart) / timeDelta * canvasWidth;
  }

  widthFromTime(end, start = 0) {
    const { timeDelta, canvasWidth } = this.state;
    return (end - start) / timeDelta * canvasWidth;
  }

  getUnit() {
    const { timeStart, timeEnd, canvasWidth } = this.state;
    const numberOfDays = DateHelper.diff(timeEnd, timeStart, 'hour');
    const pixelsPerHour = canvasWidth / numberOfDays;

    if (pixelsPerHour > 30) {
      return 'hour';
    }

    if (pixelsPerHour > 2) {
      return 'day';
    }

    return 'month';
  }

  getPeriodLabel(point) {
    const unit = this.getUnit();
    const format = unit === 'hour' ? 'HH' : (unit === 'day' ? 'D.MM' : 'MMMM');

    return DateHelper.format(point, format);
  }

  drawPeriods() {
    const { timeStart, timeEnd } = this.state;
    const unit = this.getUnit();
    const points = DateHelper.iterator(timeStart, timeEnd, unit);
    const items = [];

    for (const { current, next } of points) {
      items.push(
        <PeriodItem
          key={`line-${current.valueOf()}`}
          left={this.timeToPos(current)}
          width={this.widthFromTime(next, current)}
          label={this.getPeriodLabel(current)}
        />
      );
    }

    return items;
  }

  drawItems() {
    const { items } = this.props;
    const { timeStart, timeEnd, activeItem, mouseOffsetX } = this.state;
    const visibleItems = items.filter(item => item.start < timeEnd && item.end > timeStart);

    return visibleItems.map(item => {
      const isActive = activeItem && item === activeItem;
      const itemStart = isActive
        ? DateHelper.startOf(this.posToTime(mouseOffsetX, item.start), 'minute')
        : item.start;

      return (
        <Item
          key={item.id}
          item={item}
          active={isActive}
          left={this.timeToPos(itemStart)}
          width={this.widthFromTime(item.end, item.start)}
          onInteract={this.handleItemInteract}
        />
      );
    });
  }

  drawCategoryLines() {
    const { categories } = this.props;

    return categories.map((category) => {
      return (
        <CategoryLine
          key={category.id}
          title={category.title}
        />
      );
    });
  }

  updateActiveItemPosition() {
    const { activeItem, mouseOffsetX } = this.state;
    const start = DateHelper.startOf(this.posToTime(mouseOffsetX, activeItem.start), 'minute');
    const end = (activeItem.end - activeItem.start) + start;

    this.props.onItemMoved({
      id: activeItem.id,
      start: start,
      end: end
    });
  }

  // Layout

  zoomAndMove(scale, offset, moveOffset = 0) {
    const { minZoom, maxZoom } = this.props;
    const { timeStart, timeDelta } = this.state;
    const newTimeDelta = Math.min(
      Math.max(Math.round(timeDelta * scale), minZoom),
      maxZoom
    );
    const start = Math.round(timeStart + (timeDelta - newTimeDelta) * offset + newTimeDelta * moveOffset);

    this.setState({
      timeStart: start,
      timeEnd: start + newTimeDelta,
      timeDelta: newTimeDelta
    });
  }

  resize() {
    const { width } = this.canvas.getBoundingClientRect();

    this.setState({
      canvasWidth: width
    });
  }

  // Callbacks

  handleResize() {
    this.resize();
  }

  handleWheel(e) {
    e.preventDefault();

    const { canvasWidth } = this.state;
    const target = e.currentTarget;
    const offsetX = e.pageX - target.offsetLeft;
    const speed = e.ctrlKey ? 4 : 1;

    this.zoomAndMove(
      1 + speed * e.deltaY / 500,
      offsetX / canvasWidth,
      e.deltaX / canvasWidth
    );
  }

  handleMouseDown(e) {
    this.setState({
      dragging: true,
      mouseStartX: e.pageX,
      mouseOffsetX: 0
    });
  }

  handleMouseMove(e) {
    if (!this.state.dragging) {
      return;
    }

    e.preventDefault();

    this.setState({
      mouseOffsetX: e.pageX - this.state.mouseStartX
    });
  }

  handleMouseUp() {
    if (this.state.activeItem) {
      this.updateActiveItemPosition();
    }

    this.setState({
      dragging: false,
      activeItem: null
    });
  }

  handleItemInteract(item) {
    this.setState({
      activeItem: item
    });
  }

  // Render

  render() {
    return (
      <div
        ref={el => (this.canvas = el)}
        className="timeline"
        onWheel={this.handleWheel}
        onMouseDown={this.handleMouseDown}
        onMouseMove={this.handleMouseMove}
      >
        <div className="periods">
          <div className="periods__header" />
          {this.drawPeriods()}
        </div>
        <div className="category-lines">
          {this.drawCategoryLines()}
        </div>
        <div className="items">
          {this.drawItems()}
        </div>
      </div>
    );
  }
}

export default Timeline;
