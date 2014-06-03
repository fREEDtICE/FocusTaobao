/**
 * Created with JetBrains WebStorm.
 * User: steven
 * Date: 14-4-10
 * Time: 下午8:35
 * To change this template use File | Settings | File Templates.
 */
var Customer = require("./Customer"),
    Admin = require("./Admin");

var _ = require("lodash"),
    autoIncrement = require('mongoose-auto-increment');

var ItemStatus = {
    "initialized": 0,
    "customerRelay": 1,
    "ordered": 2,
    "shipped": 3,
    "arrived": 4,
    "internationalShip": 5,
    "inQuestion": 6,
    "cancel": 7,
    "refund": 8,
    "new": 12
};

var OrderStauts = {
    "Confirmed": 0,
    "ItemPaid": 1,
    "Processing": 2,
    "Ordered": 3,
    "ShippmentPaid": 4,
    "Shipped": 5,
    "Complete": 6,
    "Attention": 11,
    "Question": 12
};

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    Mixed = Schema.Types.Mixed;

var OrderSchema = new Schema({
    owner: {type: ObjectId, ref: Customer.schema, required: true},
    createDate: {type: Number, default: Date.now()},
    items: [
        {
            skuid: Number,
            detail_url: String,
            title: String,
            numiid: Number,
            img: String,
            sku_price: Number,
            prom_price: Number,
            price: Number,
            props: String,
            sel_prop: [
                {
                    cid: String,
                    cname: String,
                    id: String,
                    name: String,
                    alias: String
                }
            ],
            status: {type: Number, required: true, default: ItemStatus.initialized},
            quantity: Number
        }
    ],
    commissionRate: {type: Number, default: 0.1},
    money: {
        paid: {type: Number, default: 0},
        remain: {type: Number, default: 0}
    },
    status: {type: Number, required: true, default: OrderStauts.Confirmed},
    shipAddress: {
        zipCode: String,
        addressee: {type: String, required: true},
        addresseeContact: {type: String, required: true},
        address: {type: String, required: true},
        tag: String
    }
});

OrderSchema.virtual('balance').get(function () {
    return this.money.remain + this.money.paid - this.totalPrice;
});

OrderSchema.virtual('totalPrice').get(function () {
    return this.commission + this.itemTotal;
});

OrderSchema.virtual("commission").get(function () {
    return ((this.itemTotal * 100) * this.commissionRate) / 100;
});

OrderSchema.virtual('itemTotal').get(function () {
    var me = this;
    if (!me.items || !me.items.length) {
        return 0;
    }

    var itemTotal = 0.0;
    var items = _.filter(me.items, function (item) {
        return item.status !== ItemStatus.cancel && item.status !== ItemStatus.refund;
    });

    if (items.length) {
        _.forEach(items, function (item) {
            itemTotal += (item.price * 100) * item.quantity;
        });
        itemTotal = itemTotal / 100;
    }
    return itemTotal;
});


OrderSchema.methods.addOrderItem = function (item) {
    var me = this, item = _.find(me.items, function (v) {
        return v.skuid === item.skuid;
    });

    if (item) {
        item.quantity = item.quantity + 1;
    } else {
        me.items.push(item);
    }

    return me.save(function (err) {
        console.log(err);
    });
};

OrderSchema.plugin(autoIncrement.plugin, {model: 'Order', startAt: 60000});

var Order = mongoose.model("Order", OrderSchema);

module.exports.schema = exports.schema = OrderSchema;

module.exports.model = exports.model = Order;

module.exports.ItemStatus = exports.ItemStatus = ItemStatus;

module.exports.OrderStatus = exports.OrderStatus = OrderStauts;
