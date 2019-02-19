// pages/destination/destination.js
const promisify = require('../../utils/promisify')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    num : '12345',
    poster_url : '', //海报地址
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this
    _this.getImages()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  //加载网络图片
  getImages (){
    const ctx = wx.createCanvasContext('myCanvas')
    var _this = this
    const getBgImg = promisify(wx.getImageInfo)
    const getTopImg = promisify(wx.getImageInfo)

    getBgImg({src : 'https://s-js.sports.cctv.com/host/resource/map/destination_bg.png'}).then(res=>{
      const bg_url = res.path
      getTopImg({src : 'https://s-js.sports.cctv.com/host/resource/map/destination_top.png'}).then(res=>{
        const top_url = res.path

      //  开始绘制
        ctx.drawImage(bg_url,0,0,bg_url.width,bg_url.height,0,0,_this.changePx(750),_this.changePx(1206))

        ctx.save()
        ctx.drawImage(top_url,0,0,top_url.width,top_url.height,_this.changePx(90),_this.changePx(62),_this.changePx(570),_this.changePx(371))

        ctx.save()
        const num = _this.data.num
        ctx.setFontSize(31)
        ctx.setTextAlign('center')
        ctx.setFillStyle('#FFFFFF')
        ctx.setTextBaseline('top')
        ctx.fillText(num,_this.changePx(243+124),_this.changePx(213))

        ctx.draw(false,_this.create_poster)
      }).catch(err =>{
        console.log('err:', err)
      })
    })
  },

  //换算px
  changePx(value) {
    wx.getSystemInfo({
      success: res => {
        value = value*(res.windowWidth/750)
      }
    })
    return value
  },

  //生成海报
  create_poster() {
    var _this = this
    const canvasToTempFilePath = promisify(wx.canvasToTempFilePath)
    canvasToTempFilePath({
      canvasId: 'myCanvas',
      x : 0, //画布区域左上角的横坐标
      y : 0, // 画布区域左上角的纵坐标
      // width : 750, //画布区域宽度
      // height : 1206, //画布区域高度
      fileType : 'png', //输出图片的格式
      quality : 1.0,//图片的质量，目前仅对 jpg 有效。取值范围为 (0, 1]，不在范围内时当作 1.0 处理
      destWidth : 750 * 2, //输出的图片的宽度,width*屏幕像素密度
      destHeight : 1206 * 2
    }).then(res=>{
      console.log(res)
      _this.setData({
        poster_url : res.tempFilePath  //生成文件的临时路径
      })
    }).catch(err =>{
      console.log('err:', err)
    })
  },

  //保存海报
  saveImg() {
    var _this = this
    const getSetting = promisify(wx.getSetting)  //获取用户的当前设置
    getSetting().then(res=>{
      if(!res.authSetting['scope.writePhotosAlbum']){ //如果未授权照片功能
        wx.authorize({
          scope : 'scope.writePhotosAlbum',
          success : ()=> {
            _this.save_photo_sure()
          },
          fail : ()=> {
            wx.showModal({
              title: '提示',
              content: '燃烧卡路里 申请获得保存图片到相册的权限',
              success(res) {
                if (res.confirm) {
                  wx.openSetting({})
                  console.log('用户点击确定')
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              }
            })
          }
        })
      }else {
        _this.save_photo_sure()  //直接保存
      }
    })
  },

  //确认保存
  save_photo_sure (){
    var _this = this
    wx.showLoading()
    wx.saveImageToPhotosAlbum({
      filePath:_this.data.poster_url,
      success : res =>{
        wx.hideLoading()
        wx.showToast({
          title: '保存成功',
          icon : 'success',
          duration : 2000
        })
      },
      fail : err =>{
        wx.hideLoading()
        wx.showToast({
          title: '保存失败',
          icon: 'error',
          duration: 2000
        })
      }
    })
  },

  //提问
  askBtn() {
    wx.navigateTo({
      url : '/pages/suggest/suggest'
    })
  },

  //领奖
  acceptBtn() {
    console.log('领奖')
  },

})