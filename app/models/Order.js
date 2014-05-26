/**
 * Created with JetBrains WebStorm.
 * User: steven
 * Date: 14-4-10
 * Time: 下午8:35
 * To change this template use File | Settings | File Templates.
 */
var Shipment = require("./Shipment"),
    Customer = require("./Customer"),
    Admin = require("./Admin");

var cutil = require("../../utils/CommonUtils");

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    Mixed = Schema.Types.Mixed;

var OrderSchema = new Schema({
    cusId: {type: ObjectId, ref: Customer.schema, required: true},
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
                    id: String,
                    name: String,
                    alias: String
                }
            ],
            quantity: Number
        }
    ],
    paid: {type: Number, default: 0},
    commission: {type: Number},
    status: {type: Number, required: true, default: 0},
    shipment: {type: ObjectId, ref: Shipment.schema},
    handler: {type: ObjectId, ref: Admin.schema}
});


OrderSchema.methods.addOrderItem = function (item) {
    console.log(item);
    console.log(item instanceof OrderItem);
    if (!item || !item instanceof OrderItem) {
        return new Error("invalid order item");
    }
    var me = this, item = cutil.searchArray(me.items, function (v) {
        return v.productId === item.productId;
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


OrderSchema.methods.getTotalPrice = function () {
    var me = this;
    if (!me.items || !me.items.length) {
        return 0;
    }

    var i = me.items.length, price = 0, item;
    while (i--) {
        item = me.items[i];
        price = price + item.quantity * item.price;
    }

    return price;
}

var Order = mongoose.model("Order", OrderSchema);

//var OrderItem = mongoose.model("OrderItem", OrderItemSchema);

module.exports.schema = exports.schema = OrderSchema;

module.exports.model = exports.model = Order;

//module.exports.itemSchema = exports.itemSchema = OrderItemSchema;

//module.exports.itemModel = exports.itemModel = OrderItem;


