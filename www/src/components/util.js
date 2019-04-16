export default {
  calFileSize(b, settings = {}) {
    let { fixed = 2, from = 'Bytes', to = 'TB', showUnit = false } = settings
    let a = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    let sIdx = a.indexOf(from)
    let eIdx = a.indexOf(to)
    let size = +b || 0
    // 由小转大
    if (sIdx < eIdx) {
      for (let i = sIdx; i < eIdx; i++) {
        let unit = a[i]
        if (size < 1024) {
          return size.toFixed(fixed) + unit
        }
        size /= 1024
      }
      return size.toFixed(fixed) + a[eIdx]
    } 
    // 由大转小
    else {
      for (let i = sIdx; i < eIdx; i--) {
        let unit = a[i]
        size *= 1024
      }
      return size.toFixed(fixed) + a[eIdx]
    }
  }
}