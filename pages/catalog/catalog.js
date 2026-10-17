var util = require('../../utils/util.js');
var api = require('../../config/api.js');

Page({
  data: {
    categoryList: [],
    currentCategory: {},
    currentId: 0,
    goodsList: [],
    page: 1,
    size: 10,
    totalPages: 1,
    loading: false,
    noMore: false,
    // 规格弹窗
    openAttr: false,
    soldout: false,
    currentGoods: {},
    specificationList: [],
    productList: [],
    checkedSpecPrice: 0,
    checkedSpecText: '规格数量选择',
    tmpSpecText: '请选择规格数量',
    number: 1,
    cartGoodsCount: 0
  },
  _goodsCategoryId: 0,

  onLoad: function(options) {
    this.getCatalog();
  },

  onShow: function () {
    var that = this;
    util.request(api.CartGoodsCount).then(function (res) {
      if (res.errno === 0) {
        that.setData({ cartGoodsCount: res.data });
      }
    });
  },
  onPullDownRefresh() {
    wx.showNavigationBarLoading();
    this.getCatalog();
    wx.hideNavigationBarLoading();
    wx.stopPullDownRefresh();
  },
  getCatalog: function() {
    let that = this;
    wx.showLoading({ title: '加载中...' });
    util.request(api.CatalogList).then(function(res) {
      if (res.errno === 0) {
        that.setData({
          categoryList: res.data.categoryList,
          currentCategory: res.data.currentCategory,
          currentId: res.data.currentCategory.id
        });
        that.resolveAndLoadGoods(res.data.currentCategory.id);
      }
      wx.hideLoading();
    });
  },

  resolveAndLoadGoods: function(l1Id) {
    var that = this;
    util.request(api.GoodsCategory, { id: l1Id }).then(function(res) {
      if (res.errno === 0) {
        var l2Id = res.data.currentCategory.id;
        that._goodsCategoryId = l2Id;
        that.setData({
          currentCategory: res.data.parentCategory,
          goodsList: [],
          page: 1,
          totalPages: 1,
          noMore: false
        });
        that.getGoodsList(l2Id);
      } else {
        that._goodsCategoryId = l1Id;
        that.getGoodsList(l1Id);
      }
    }).catch(function() {
      that._goodsCategoryId = l1Id;
      that.getGoodsList(l1Id);
    });
  },

  getGoodsList: function(categoryId) {
    var that = this;
    this.setData({ loading: true });
    util.request(api.GoodsList, {
      categoryId: categoryId,
      page: that.data.page,
      size: that.data.size
    }).then(function(res) {
      if (res.errno === 0) {
        var newList = that.data.goodsList.concat(res.data.goodsList);
        that.setData({
          goodsList: newList,
          totalPages: res.data.totalPages,
          loading: false,
          noMore: res.data.totalPages <= that.data.page
        });
      } else {
        that.setData({ loading: false });
      }
    }).catch(function() {
      that.setData({ loading: false });
    });
  },

  switchCate: function(event) {
    var id = event.currentTarget.dataset.id;
    if (this.data.currentId == id) {
      return false;
    }
    var currentCategory = {};
    for (var i = 0; i < this.data.categoryList.length; i++) {
      if (this.data.categoryList[i].id == id) {
        currentCategory = this.data.categoryList[i];
        break;
      }
    }
    this.setData({
      currentId: id,
      currentCategory: currentCategory,
      goodsList: [],
      page: 1,
      totalPages: 1,
      noMore: false
    });
    this.resolveAndLoadGoods(id);
  },

  onReachBottom: function() {
    if (this.data.totalPages > this.data.page && !this.data.loading) {
      this.setData({
        page: this.data.page + 1
      });
      this.getGoodsList(this._goodsCategoryId);
    }
  },

  // 点击 + 打开规格弹窗
  openSpecPopup: function (e) {
    var that = this;
    var goodsId = e.currentTarget.dataset.id;
    wx.showLoading({ title: '加载中...' });
    util.request(api.GoodsDetail, { id: goodsId }).then(function (res) {
      wx.hideLoading();
      if (res.errno === 0) {
        var specList = res.data.specificationList;
        // 如果只有一种规格且只有一个选项，默认选中
        if (specList.length === 1 && specList[0].valueList.length === 1) {
          specList[0].valueList[0].checked = true;
        }
        that.setData({
          currentGoods: res.data.info,
          specificationList: specList,
          productList: res.data.productList,
          checkedSpecPrice: res.data.info.retailPrice,
          checkedSpecText: specList.length === 1 && specList[0].valueList.length === 1 ? specList[0].valueList[0].value : '规格数量选择',
          tmpSpecText: specList.length === 1 && specList[0].valueList.length === 1 ? '已选择：' + specList[0].valueList[0].value : '请选择规格数量',
          soldout: false,
          number: 1,
          openAttr: true
        });
      }
    }).catch(function () {
      wx.hideLoading();
    });
  },

  closeAttr: function () {
    this.setData({ openAttr: false });
  },

  noop: function () {},

  // 规格选择
  clickSkuValue: function (event) {
    var specName = event.currentTarget.dataset.name;
    var specValueId = event.currentTarget.dataset.valueId;
    var _specificationList = this.data.specificationList;
    for (var i = 0; i < _specificationList.length; i++) {
      if (_specificationList[i].name === specName) {
        for (var j = 0; j < _specificationList[i].valueList.length; j++) {
          if (_specificationList[i].valueList[j].id == specValueId) {
            _specificationList[i].valueList[j].checked = !_specificationList[i].valueList[j].checked;
          } else {
            _specificationList[i].valueList[j].checked = false;
          }
        }
      }
    }
    this.setData({ specificationList: _specificationList });
    this.changeSpecInfo();
  },

  // 获取选中的规格信息
  getCheckedSpecValue: function () {
    var checkedValues = [];
    var _specificationList = this.data.specificationList;
    for (var i = 0; i < _specificationList.length; i++) {
      var _checkedObj = { name: _specificationList[i].name, valueId: 0, valueText: '' };
      for (var j = 0; j < _specificationList[i].valueList.length; j++) {
        if (_specificationList[i].valueList[j].checked) {
          _checkedObj.valueId = _specificationList[i].valueList[j].id;
          _checkedObj.valueText = _specificationList[i].valueList[j].value;
        }
      }
      checkedValues.push(_checkedObj);
    }
    return checkedValues;
  },

  getCheckedSpecKey: function () {
    return this.getCheckedSpecValue().map(function (v) { return v.valueText; });
  },

  isCheckedAllSpec: function () {
    return !this.getCheckedSpecValue().some(function (v) { return v.valueId === 0; });
  },

  getCheckedProductItem: function (key) {
    return this.data.productList.filter(function (v) {
      return v.specifications.toString() === key.toString();
    });
  },

  changeSpecInfo: function () {
    var checkedNameValue = this.getCheckedSpecValue();
    var checkedValue = checkedNameValue.filter(function (v) { return v.valueId !== 0; }).map(function (v) { return v.valueText; });
    if (checkedValue.length > 0) {
      this.setData({ tmpSpecText: checkedValue.join('　') });
    } else {
      this.setData({ tmpSpecText: '请选择规格数量' });
    }
    if (this.isCheckedAllSpec()) {
      this.setData({ checkedSpecText: this.data.tmpSpecText });
      var checkedProductArray = this.getCheckedProductItem(this.getCheckedSpecKey());
      if (!checkedProductArray || checkedProductArray.length <= 0) {
        this.setData({ soldout: true });
        return;
      }
      var checkedProduct = checkedProductArray[0];
      if (checkedProduct.number > 0) {
        this.setData({ checkedSpecPrice: checkedProduct.price, soldout: false });
      } else {
        this.setData({ checkedSpecPrice: this.data.currentGoods.retailPrice, soldout: true });
      }
    } else {
      this.setData({
        checkedSpecText: '规格数量选择',
        checkedSpecPrice: this.data.currentGoods.retailPrice,
        soldout: false
      });
    }
  },

  cutNumber: function () {
    this.setData({ number: (this.data.number - 1 > 1) ? this.data.number - 1 : 1 });
  },

  addNumber: function () {
    this.setData({ number: this.data.number + 1 });
  },

  // 加入购物车
  addToCart: function () {
    var that = this;
    if (this.data.soldout) {
      return;
    }
    if (!this.isCheckedAllSpec()) {
      wx.showToast({ title: '请选择完整规格', icon: 'none' });
      return;
    }
    var checkedProductArray = this.getCheckedProductItem(this.getCheckedSpecKey());
    if (!checkedProductArray || checkedProductArray.length <= 0) {
      return;
    }
    var checkedProduct = checkedProductArray[0];
    if (checkedProduct.number <= 0) {
      return;
    }
    util.request(api.CartAdd, {
      goodsId: this.data.currentGoods.id,
      number: this.data.number,
      productId: checkedProduct.id
    }, 'POST').then(function (res) {
      if (res.errno === 0) {
        wx.showToast({ title: '添加成功', icon: 'success' });
        that.setData({ openAttr: false, cartGoodsCount: res.data });
      } else {
        wx.showToast({ title: res.errmsg || '添加失败', icon: 'none' });
      }
    });
  },

  // 跳转购物车
  openCartPage: function () {
    wx.switchTab({ url: '/pages/cart/cart' });
  }
})
