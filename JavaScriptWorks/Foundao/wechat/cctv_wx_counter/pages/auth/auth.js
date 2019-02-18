// pages/auth/auth.js
import api from './../../config/api';

const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {},

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

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
        wx.removeStorageSync('loginSessionKey')
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

    //获取用户信息，将相关用户信息传给后台，获取token，并存在storage中
    getUserInfo: function (e) {
        // console.log('用户点击授权：')
        // console.log(e)
        var _this = this
        e.detail.userInfo.avatarUrl = e.detail.userInfo.avatarUrl ? e.detail.userInfo.avatarUrl : app.globalData.default_avatarUrl
        app.globalData.userInfo = e.detail.userInfo
        wx.removeStorageSync('loginSessionKey')
        wx.login({
            success: res => {
                wx.showLoading({
                    mask: true
                })
                console.log('code:')
                console.log(res.code)
                wx.getUserInfo({
                    success: function (re) {
                        console.log('getUserInfo res:')
                        console.log(re)
                        // re.nickName = e.detail.userInfo.nickName;
                        // re.avatarUrl = e.detail.userInfo.avatarUrl;
                        wx.request({
                            url: api.login_auth,
                            method: 'POST',
                            header: {
                                "content-type": "application/x-www-form-urlencoded"
                            },
                            data: {
                                wx_sign: re.signature,
                                raw_user_data: re.rawData,
                                code: res.code,
                                nickName: app.globalData.userInfo.nickName,
                                avatarUrl: app.globalData.userInfo.avatarUrl,
                            },
                            success: (resp) => {
                                console.log('login_auth:')
                                console.log(resp)
                                const {code, data, msg} = resp.data;
                                if (code === 0) {
                                    console.log(data.token, 'data.token')
                                    console.log('ssssss')
                                    wx.setStorageSync('loginSessionKey', data.token)
                                    //返回上一层页面
                                    // app.globalData.auth_again = true
                                    wx.navigateBack();
                                } else {
                                    // wx.showToast({
                                    //     title: msg,
                                    //     icon: 'none'
                                    // })
                                    // wx.removeStorageSync({
                                    //     key: 'loginSessionKey',
                                    // })
                                    try {
                                        wx.removeStorageSync('key')
                                    } catch (e) {
                                        // Do something when catch error
                                    }
                                }
                            },
                            fail(res) {
                                console.log('login_auth fail')
                                console.log(res)
                            },
                            complete: () => {
                                wx.hideLoading()
                            }
                        })
                    },
                    complete: function (re) {
                        wx.hideLoading()
                    }
                })
            }
        });
    },


})