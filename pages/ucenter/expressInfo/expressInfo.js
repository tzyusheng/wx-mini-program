var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var user = require('../../../utils/user.js');
var app = getApp();

Page({
  data: {
    orderId: 0,
    userInfo: {
      nickName: '点击登录',
      avatarUrl: 'http://yanxuan.nosdn.127.net/8945ae63d940cc42406c3f67019c5cb6.png'
    },
    traces: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      orderId: options.orderId
    });
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
    //获取用户的登录信息
    if (app.globalData.hasLogin) {
      let userInfo = wx.getStorageSync('userInfo');
      this.setData({
        userInfo: userInfo,
        hasLogin: true
      });

      let that = this;
      util.request(api.ExpressTrace, {
        orderId: that.data.orderId
      }).then(function (res) {
        if (res.errno === 0) {
          that.setData({
            traces: res.data.traces,
            state: res.data.state,
            shipperName: res.data.shipperName,
            shipDate: res.data.shipDate,
            shipTime: res.data.shipTime,
            shipperCode: res.data.shipperCode,
            address: res.data.address
          });
        } else {
          that.loadMockData();
        }
      }).catch(function () {
        that.loadMockData();
      });
    } else {
      this.loadMockData();
    }
  },

  // 默认演示数据（接口接入后删除）
  loadMockData: function () {
    this.setData({
      shipperName: '顺丰速运',
      shipperCode: 'SF1234567890123',
      address: '广东省深圳市南山区科技园南路88号',
      state: 2,
      shipDate: '2024-08-06',
      shipTime: '10:30',
      traces: [
        {
          acceptTime: '2024-08-06T14:30:00',
          acceptStation: '快件已到达【深圳南山集散中心】',
          date: '08-06',
          time: '14:30'
        },
        {
          acceptTime: '2024-08-06T11:20:00',
          acceptStation: '快件已从【深圳宝安中转站】发出，正在发往【深圳南山集散中心】',
          date: '08-06',
          time: '11:20'
        },
        {
          acceptTime: '2024-08-06T09:00:00',
          acceptStation: '快件已到达【深圳宝安中转站】',
          date: '08-06',
          time: '09:00'
        },
        {
          acceptTime: '2024-08-06T07:30:00',
          acceptStation: '顺丰速运已收取快件',
          date: '08-06',
          time: '07:30'
        }
      ]
    });
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

  }
})