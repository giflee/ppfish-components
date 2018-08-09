import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Input from '../../Input';
import Icon from '../../Icon/index.tsx';
import Button from '../../Button/index.tsx';
import { PopperBase } from './PopperBase';
import YearAndMonthPopover from './YearAndMonthPopover';
import TimePicker from '../TimePicker';
import { DateTable, MonthTable, YearTable } from '../basic';
import {
  SELECTION_MODES,
  deconstructDate,
  formatDate,
  parseDate,
  toDate,
  prevYear,
  nextYear,
  prevMonth,
  nextMonth,
  timeFormat,
  dateFormat,
  MONTH_ARRRY,
  YEARS_ARRAY,
  isValidValue,
  setDate,
  setTime
} from '../../../utils/date';
import Locale from '../../../utils/date/locale';

const PICKER_VIEWS = {
  YEAR: 'year',
  MONTH: 'month',
  DATE: 'date',
};

const isInputValid = (text, date, disabledDate) => {
  if(text.trim() === '' || !isValidValue(date) || typeof disabledDate === 'function' && disabledDate(date)) return false;
  return true;
};

export default class DatePanel extends PopperBase {

  static get propTypes() {
    return Object.assign({
      yearCount: PropTypes.number,
      value: PropTypes.instanceOf(Date),
      isShowTime: PropTypes.bool,
      showWeekNumber: PropTypes.bool,
      format: PropTypes.string,
      shortcuts: PropTypes.arrayOf(
        PropTypes.shape({
          text: PropTypes.string.isRequired,
          onClick: PropTypes.func.isRequired
        })
      ),
      shortcutsPlacement: PropTypes.string,
      selectionMode: PropTypes.oneOf(Object.keys(SELECTION_MODES).map(e => SELECTION_MODES[e])),
      disabledDate: PropTypes.func,
      firstDayOfWeek: PropTypes.number,
      onPick: PropTypes.func.isRequired,
      onCancelPicked: PropTypes.func.isRequired,
    }, PopperBase.propTypes)
  }

  static get defaultProps() {
    return {
      yearCount: 50,
      value: null,
      isShowTime: false,
      showWeekNumber: false,
      shortcutsPlacement: 'left',
      selectionMode: SELECTION_MODES.DAY,
      firstDayOfWeek: 0
    }
  }

  constructor(props) {
    super(props);

    let currentView = PICKER_VIEWS.DATE;
    switch (props.selectionMode) {
      case SELECTION_MODES.MONTH:
        currentView = PICKER_VIEWS.MONTH; break;
      case SELECTION_MODES.YEAR:
        currentView = PICKER_VIEWS.YEAR; break;
    }

    this.state = {
      currentView,
      currentDate: isValidValue(props.value) ? toDate(props.value) : new Date(), // 当前日历视图
      date: toDate(props.value),
      dateInputText: formatDate(props.value, dateFormat(props.format)), // 日期输入框的值(string)，当props.value为null时，值为''
      timeInputText: toDate(props.value),                      // 时间输入组件的值(Date)，当props.value为null时，值为null
      confirmBtnDisabled: !props.value                         // 确定按钮是否禁用
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value){
      const date = toDate(nextProps.value);
      this.setState({ date });
    }
  }

  resetView() {
    const {selectionMode} = this.props;
    const {currentView} = this.state;

    let view = currentView;
    if (selectionMode === SELECTION_MODES.MONTH) {
      view = PICKER_VIEWS.MONTH
    } else if (selectionMode === SELECTION_MODES.YEAR) {
      view = PICKER_VIEWS.YEAR
    } else {
      view = PICKER_VIEWS.DATE
    }
    this.setState({
      currentView: view
    })
  }

  // 年份、月份面板先注释掉，需要时再打开
  _pickerContent() {
    const { selectionMode, disabledDate, showWeekNumber } = this.props;
    const { date, currentDate } = this.state;
    const { currentView } = this.state;
    let result = null;

    switch (currentView) {
      case PICKER_VIEWS.DATE:
        result = (
          <DateTable
            onPick={this.handleDatePick.bind(this)}
            date={currentDate}
            value={date}
            selectionMode={selectionMode}
            disabledDate={disabledDate}
            showWeekNumber={showWeekNumber}
          />);

        break;
      // case PICKER_VIEWS.YEAR:
      //   result = (<YearTable
      //     ref="yearTable"
      //     value={value}
      //     date={date}
      //     onPick={this.handleYearPick.bind(this)}
      //     disabledDate={disabledDate}
      //   />);
      //   break;
      // case PICKER_VIEWS.MONTH:
      //   result = (<MonthTable
      //     value={value}
      //     date={date}
      //     onPick={this.handleMonthPick.bind(this)}
      //     disabledDate={disabledDate}
      //   />);
      //   break;
      default:
        throw new Error('invalid currentView value')
    }

    return result;
  }

  // 日期时间都选择，确定按钮才可点击
  confirmBtnDisabled = () => {
    const {date, dateInputText, timeInputText} = this.state;
    return !(date && dateInputText && timeInputText);
  }

  // 未选择日期时，时间不可选
  timePickerDisable = () => {
    const {date, dateInputText} = this.state;
    return !(date && dateInputText);
  }

  // 日期输入框变化
  handleDateInputChange = (e) => {
    const {disabledDate, format} = this.props;
    const {date} = this.state;

    const inputText = e.target.value;
    let ndate = parseDate(inputText, dateFormat(format));
    if (!isInputValid(inputText, ndate, disabledDate)) {
      this.setState({
        dateInputText: inputText,
      })
    }else{//only set value on a valid date input
      this.setState({
        dateInputText: inputText,
        date: setDate(new Date(date), ndate), // 日期变化的时候，时间保持不变
        currentDate: ndate
      });
    }
    this.resetView();
  }

  // 时间输入框变化
  handleTimeInputChange = (val) => {
    const {date} = this.state;
    if (val) {
      this.setState({
        date: setTime(new Date(date), val), // 时间变化的时候，日期保持不变
        timePickerVisible: false,
        timeInputText: val,
      })
    }
  }

  // 点击快捷按钮
  handleShortcutClick(shortcut) {
    shortcut.onClick();
  }

  // 上一年
  prevYear = () => {
    this.setState({
      currentDate: prevYear(this.state.currentDate)
    });
  }

  // 下一年
  nextYear = () => {
    this.setState({
      currentDate: nextYear(this.state.currentDate)
    });
  }

  // 上一月
  prevMonth = () => {
    this.setState({
      currentDate: prevMonth(this.state.currentDate)
    });
  }

  // 下一月
  nextMonth = () => {
    this.setState({
      currentDate: nextMonth(this.state.currentDate)
    });
  }

  // 切换年份
  handleChangeYear = (year) => {
    const { currentDate } = this.state;
    this.setState({
      currentDate: new Date(currentDate.setFullYear(year)),
    })
  }

  // 切换月份
  handleChangeMonth = (month) => {
    const { currentDate } = this.state;
    this.setState({
      currentDate: new Date((currentDate.setMonth(parseInt(month.slice(0,-1)) - 1)))
    })
  }

  // 点击日期
  handleDatePick(value) {
    const { selectionMode, isShowTime, onPick, format } = this.props;
    const pdate = value.date;

    if (selectionMode === SELECTION_MODES.DAY) {
      if (!isShowTime) {
        onPick(pdate)
      }
      // 日期变化，时间不变
      this.setState({
        date: setDate(new Date(this.state.date), pdate),
        dateInputText: formatDate(pdate, dateFormat(format)), // 点击日期，左侧日期输入框的值同步变化
        currentDate: pdate
      })
    } else if (selectionMode === SELECTION_MODES.WEEK) {
      onPick(pdate)
    }
  }

  // 点击确定按钮
  handleConfirm = () => {
    const { date } = this.state;
    this.props.onPick(date, false, true);
  }

  // 点击取消按钮
  handleCancel = () => {
    this.props.onCancelPicked();
  }

  render() {
    const { isShowTime, shortcuts, shortcutsPlacement, format, yearCount } = this.props;
    const { currentView, dateInputText, timeInputText, currentDate } = this.state;
    const { month } = deconstructDate(currentDate);
    const t = Locale.t;

    return (
      <div
        ref="root"
        className={classNames('fishd-picker-panel fishd-date-picker', {
          'has-sidebar': shortcuts && shortcutsPlacement === 'left',
          'has-time': isShowTime})
        }
      >

        <div className="fishd-picker-panel__body-wrapper">
          {
            shortcutsPlacement === 'left' && Array.isArray(shortcuts) && (
              <div className={classNames('fishd-picker-panel__sidebar', shortcutsPlacement)}>
                {
                  shortcuts.map((e, idx) => {
                    return (
                      <button
                        key={idx}
                        type="button"
                        className="fishd-picker-panel__shortcut"
                        onClick={() => this.handleShortcutClick(e)}>{e.text}</button>
                    )
                  })
                }
              </div>
            )
          }
          <div className="fishd-picker-panel__body">
            {
              isShowTime && (
                <div className="fishd-date-picker__time-header">
                  <span className="fishd-date-picker__editor-wrap">
                    <Input
                      placeholder={t('fishd.datepicker.selectDate')}
                      value={dateInputText}
                      onChange={this.handleDateInputChange}
                    />
                  </span>
                  <span className="fishd-date-picker__editor-wrap">
                    <TimePicker
                      placeholder={t('fishd.datepicker.selectTime')}
                      className="fishd-date-range-picker__editor"
                      isShowTrigger={false}
                      isAllowClear={false}
                      format={timeFormat(format)}
                      isDisabled={this.timePickerDisable()}
                      value={timeInputText}
                      onFocus={()=> this.setState({timePickerVisible: !this.state.timePickerVisible})}
                      onChange={this.handleTimeInputChange}
                    />
                  </span>
                </div>
              )
            }

            {
              currentView !== 'time' && (
                <div className="fishd-date-picker__header">
                  <Icon
                    type="left-double"
                    onClick={this.prevYear}
                    className="fishd-picker-panel__icon-btn fishd-date-picker__prev-btn">
                  </Icon>
                  {
                    currentView === PICKER_VIEWS.DATE && (
                      <Icon
                        type="left"
                        onClick={this.prevMonth}
                        className="fishd-picker-panel__icon-btn fishd-date-picker__prev-btn">
                      </Icon>)
                  }
                  <YearAndMonthPopover
                    value={currentDate.getFullYear()}
                    sourceData={YEARS_ARRAY(yearCount)}
                    onChange={this.handleChangeYear}
                  >
                    <span className="fishd-date-picker__header-label">{`${currentDate.getFullYear()} ${t('fishd.datepicker.year')}`}</span>
                  </YearAndMonthPopover>
                  {
                    currentView === PICKER_VIEWS.DATE && (
                      <YearAndMonthPopover
                        value={currentDate.getMonth() + 1}
                        sourceData={MONTH_ARRRY}
                        onChange={this.handleChangeMonth}
                      >
                        <span
                          className={
                            classNames('fishd-date-picker__header-label', {
                              active: currentView === 'month'
                            })
                          }
                        >{t(`fishd.datepicker.month${month + 1}`)}</span>
                      </YearAndMonthPopover>
                    )
                  }
                  <Icon
                    type="right-double"
                    onClick={this.nextYear}
                    className="fishd-picker-panel__icon-btn fishd-date-picker__next-btn">
                  </Icon>
                  {
                    currentView === PICKER_VIEWS.DATE && (
                      <Icon
                        type="right"
                        onClick={this.nextMonth}
                        className="fishd-picker-panel__icon-btn fishd-date-picker__next-btn">
                      </Icon>
                    )
                  }
                </div>
              )
            }
            <div className="fishd-picker-panel__content">
              {this._pickerContent()}
            </div>
          </div>
        </div>

        {
          isShowTime && currentView === PICKER_VIEWS.DATE && (
            <div
              className="fishd-picker-panel__footer">
              <Button
                className="fishd-picker-panel__btn cancel"
                onClick={this.handleCancel}>{t('fishd.datepicker.cancel')}
              </Button>
              <Button
                type="primary"
                className={classNames("fishd-picker-panel__btn", "confirm", {'disabled': this.confirmBtnDisabled()})}
                onClick={this.handleConfirm}
                disabled={this.confirmBtnDisabled()}>{t('fishd.datepicker.confirm')}
              </Button>
            </div>
          )
        }
      </div>
    )
  }
}

DatePanel.isValid = (value, disabledDate) => {
  return typeof disabledDate === 'function' && (value instanceof Date) ? !disabledDate(value) : true;
}
