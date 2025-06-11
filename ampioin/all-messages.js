module.exports = function(RED) {
    function ampioAllMessages(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        const au = require('../generic/ampio-utils');

        node.ampioserv = config.server;
        node.brokerConn = RED.nodes.getNode(node.ampioserv);

        if (node.brokerConn) {
            node.status({ fill: "red", shape: "ring", text: "node-red:common.status.disconnected" });
            node.brokerConn.register(node);

            const topic = 'ampio/#'; // Listen to all ampio/ messages

            node.brokerConn.subscribe(topic, function (topic, payload) {
                const msg = { topic: topic, payload: payload.toString('utf-8') };
                node.send(msg);
            }, node.id);

            if (node.brokerConn.connected) {
                node.status({ fill: "green", shape: "dot", text: "node-red:common.status.connected" });
            }
        } else {
            node.error("No broker connection configured");
        }

        node.on('close', function (removed, done) {
            if (node.brokerConn) {
                node.brokerConn.unsubscribe('ampio/#', node.id, removed);
                node.brokerConn.deregister(node, done);
            }
        });
    }

    RED.nodes.registerType("Ampio All Messages", ampioAllMessages);
};
