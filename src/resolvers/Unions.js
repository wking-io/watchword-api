const Unions = {
  PlayData: {
    __resolveType (obj) {
      if (obj.left) {
        return 'ConnectData'
      } else if (obj.answer) {
        return 'FilterData'
      } else if (obj.memorizeData) {
        return 'MemorizeData'
      } else if (obj.orderData) {
        return 'OrderData'
      } else {
        return 'IdentifyData'
      }
    }
  }
}

module.exports = { Unions }