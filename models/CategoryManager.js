var MemManager = require("../datas/MemManager"),
    async = require("async"),
    Category = require("../models/Category"),
    Cat = Category.model,
    taobao = require("taobao");

module.exports = exports = (function () {
    this.mem = MemManager.getMem("catmanager");
    this.cats = {};
    var that = this;


    function init(callback) {
        async.waterfall([
            function (cb) {
                Category.queryAllCats(function (err, data) {
                    console.log("queryAllCats");
                    cb(err, data);
                })
            },

            function (data, cb) {
                if (!data || data.length === 0) {
                    taobao.core.call("taobao.itemcats.get.all", {
                        method: 'taobao.itemcats.get',
                        fields: 'cid,features,parent_cid,name,is_parent,status, sort_order',
                        "parent_cid": "0"
                    }, function (data) {
                        if (data && data.itemcats_get_response && data.itemcats_get_response.item_cats) {
                            async.each(data.itemcats_get_response.item_cats.item_cat, function (item, cb) {
                                var cat = new Cat({
                                    key: "cat_name_" + item.parent_cid + "_" + item.cid,
                                    status: 1,
                                    taobaoInfo: item
                                });

                                cat.save(function (err) {
                                    cb(err);
                                });
                            }, function (err) {
                                return cb(err);
                            });
                        } else {
                            return cb(new Error("fetch cats failed"));
                        }
                    });
                } else {
                    cb(null);
                }
            }
        ], function (err) {
            console.log("init cat data. %s", err);
            if ("function" === typeof callback) {
                callback(err);
            }
        });
    }

    function fetchData(callback) {
        Category.queryConfirmedCats(function (err, data) {
            if (data && data.length) {
                var i = data.length;
                while (i--) {
                    that.cats[data[i].key] = data[i];
                }
            }
            callback(err, data);
        });
    };

    async.waterfall([
        init, fetchData
    ], function (err) {
        console.log("first init cat data. %s", err);
    });

    return {
        getCats: function () {
            return that.cats;
        }
    };
}());