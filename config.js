"use strict";

module.exports = {

    'kafka': {
        kafkaHost: process.env.KAFKA_HOST || "kafka-server:9092",
        sessionTimeout: process.env.KAFKA_SESSION_TIMEOUT || "15000",
        groupId: process.env.KAFKA_GROUP_ID || ('iotagent-' + Math.floor(Math.random() * 10000))
    },

    'dataBroker': {
        url: process.env.DATA_BROKER_URL || "http://data-broker:80"
    },

    'ingestion': {
        subject: process.env.INGESTION_SUBJECT || "device-data"
    }

};