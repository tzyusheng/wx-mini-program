var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var app = getApp();

Page({
  data: {
    expressList: [],
    inTransitCount: 0,
    deliveredCount: 0,
    loading: true
  },

  onLoad: function (options) {
    this.loadExpressList();
  },

  onShow: function () {
    // 每次显示时刷新
    if (!this.data.loading) {
      this.loadExpressList();
    }
  },

  // 加载快递列表（接口待定，当前使用占位逻辑）
  loadExpressList: function () {
    var that = this;
    this.setData({ loading: true });

    // TODO: 替换为实际接口
    // util.request(api.ExpressList, {}, 'GET').then(function (res) {
    //   if (res.errno === 0) {
    //     var list = res.data || [];
    //     var inTransit = list.filter(function (item) { return item.state === 2; }).length;
    //     var delivered = list.filter(function (item) { return item.state === 3; }).length;
    //     that.setData({
    //       expressList: list,
    //       inTransitCount: inTransit,
    //       deliveredCount: delivered,
    //       loading: false
    //     });
    //   }
    // }).catch(function () {
    //   that.setData({ loading: false });
    // });

    // 默认演示数据（接口接入后删除）
    var mockList = [
      {
        id: 1,
        orderId: 1001,
        orderSn: '202408061500001',
        shipperName: '顺丰速运',
        shipperCode: 'SF1234567890123',
        address: '广东省深圳市南山区科技园南路88号',
        state: 2,
        stateText: '运输中',
        latestTrace: '快件已到达【深圳南山集散中心】',
        latestTime: '2024-08-06 14:30'
      },
      {
        id: 2,
        orderId: 1002,
        orderSn: '202408051400002',
        shipperName: '圆通快递',
        shipperCode: 'YT9876543210987',
        address: '广东省广州市天河区体育西路168号',
        state: 1,
        stateText: '待揽收',
        latestTrace: '包裹正在等待揽收',
        latestTime: '2024-08-05 16:20'
      },
      {
        id: 3,
        orderId: 1003,
        orderSn: '202408011300003',
        shipperName: '中通快递',
        shipperCode: 'ZT4567890123456',
        address: '上海市浦东新区张江高科技园区',
        state: 3,
        stateText: '已签收',
        latestTrace: '已签收，签收人：本人签收',
        latestTime: '2024-08-03 09:15'
      }
    ];

    var inTransit = mockList.filter(function (item) { return item.state === 2; }).length;
    var delivered = mockList.filter(function (item) { return item.state === 3; }).length;

    this.setData({
      expressList: mockList,
      inTransitCount: inTransit,
      deliveredCount: delivered,
      loading: false
    });
  },

  // 跳转到物流详情
  goDetail: function (e) {
    var orderId = e.currentTarget.dataset.orderId;
    wx.navigateTo({
      url: '/pages/ucenter/expressInfo/expressInfo?orderId=' + orderId
    });
  },

  onPullDownRefresh: function () {
    this.loadExpressList();
    wx.stopPullDownRefresh();
  }
});
