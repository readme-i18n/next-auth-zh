/**
 * 接收一个以秒为单位的数字，返回未来的日期。
 * 可选地接收第二个日期参数。在这种情况下，
 * 未来的日期将从该日期而非当前时间开始计算。
 */
export function fromDate(time: number, date = Date.now()) {
  return new Date(date + time * 1000)
}
