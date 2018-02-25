import moment from 'moment';

class DateHelper {
  static add(datetime, amount, unit) {
    return moment(datetime).add(amount, unit);
  }

  static startOf(datetime, unit) {
    return moment(datetime).startOf(unit);
  }

  static diff(datetimeA, datetimeB, unit) {
    return moment(datetimeA).diff(moment(datetimeB), unit);
  }

  static format(datetime, str) {
    return moment(datetime).format(str);
  }

  static *iterator(start, end, unit) {
    let current = this.startOf(start, unit);

    while (current < end) {
      const next = this.add(current, 1, unit);

      yield {
        current: current,
        next: next
      };

      current = next;
    }
  }
}

export default DateHelper;
