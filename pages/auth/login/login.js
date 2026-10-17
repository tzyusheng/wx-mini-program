var api = require('../../../config/api.js');
var util = require('../../../utils/util.js');
var user = require('../../../utils/user.js');

var app = getApp();
Page({
  data: {
    canIUseGetUserProfile: false, // 用于向前兼容
  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    // 页面渲染完成
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
  },
  onReady: function() {

  },
  onShow: function() {
    // 页面显示
  },
  onHide: function() {
    // 页面隐藏

  },
  onUnload: function() {
    // 页面关闭

  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log('getUserProfile success:', res);
        this.doLogin(res.userInfo);
      },
      fail: (res) => {
        console.log('getUserProfile fail:', res);
        app.globalData.hasLogin = false;
        util.showErrorToast('微信登录失败：' + (res.errMsg || '未知错误'));
      }
    });
  },
  wxLogin: function(e) {
    console.log('wxLogin triggered:', e);
    if (e.detail.userInfo == undefined) {
      app.globalData.hasLogin = false;
      util.showErrorToast('微信登录失败，请重试');
      return;
    }
    this.doLogin(e.detail.userInfo);
  },
  doLogin: function(userInfo) {
    wx.showLoading({ title: '登录中...' });
    user.checkLogin().then(() => {
      // 已经登录，直接返回
      wx.hideLoading();
      app.globalData.hasLogin = true;
      wx.navigateBack({ delta: 1 });
    }).catch(() => {
      // 未登录，调用登录接口
      user.loginByWeixin(userInfo).then(res => {
        wx.hideLoading();
        app.globalData.hasLogin = true;
        wx.navigateBack({ delta: 1 });
      }).catch((err) => {
        wx.hideLoading();
        app.globalData.hasLogin = false;
        console.error('登录失败:', err);
        util.showErrorToast('微信登录失败，请检查网络');
      });
    });
  },
  accountLogin: function() {
    wx.navigateTo({
      url: "/pages/auth/accountLogin/accountLogin"
    });
  }
})