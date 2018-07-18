"use strict";

const path = require("path");
const textToSpeech = require("@google-cloud/text-to-speech");
var Publisher = require("./publisher");
const dojot = require("@dojot/flow-node");


class DataHandler extends dojot.DataHandlerBase {
    constructor() {
        super();
        this.publisher = new Publisher("dojot.device-manager.device");
    }

    /**
     * Returns full path to html file
     * @return {string} String with the path to the node representation file
     */
    getNodeRepresentationPath() {
        return path.resolve(__dirname, "text-to-speech.html");
    }

    /**
     * Returns node metadata information
     * This may be used by orchestrator as a liveliness check
     * @return {object} Metadata object
     */
    getMetadata() {
        return {
            "id": "google/text-to-speech",
            "name": "text-to-speech",
            "module": "text-to-speech",
            "version": "1.0.0",
        }
    }

    /**
     * Returns object with locale data (for the given locale)
     * @param  {[string]} locale Locale string, such as "en-US"
     * @return {[object]}        Locale settings used by the module
     */
    getLocaleData(locale) {
        return {}
    }

    /**
     * Statelessly handle a single given message, using given node configuration parameters
     *
     * This method should perform all computation required by the node, transforming its inputs
     * into outputs. When such processing is done, the node should issue a call to the provided
     * callback, notifying either failure to process the message with given config, or the set
     * of transformed messages to be sent to the flow"s next hop.
     *
     * @param  {[type]}       config   Node configuration to be used for this message
     * @param  {[type]}       message  Message to be processed
     * @param  {Function}     callback Callback to call upon processing completion
     * @return {[undefined]}
     */
    handleMessage(config, message, callback) {
        try {
            // The text to synthesize
            let text = "";
            switch (config.textType) {
                case "str":
                    text = config.text;
                    break;
                case "msg":
                    text = this._get(config.text, message);
                    break;
                default:
                    return callback(new Error("Invalid text type: " + config.textType));
            }

            const client = new textToSpeech.TextToSpeechClient({
                credentials: {
                    client_email: config._credentials_client_email,
                    private_key: config._credentials_private_key
                },
                projectId: config._credentials_project_id
            });

            let languageCode = /[A-Za-z]+-[A-Za-z]+/.exec(config.voiceName)[0];

            // Construct the request
            const request = {
                input: {text: text},
                // Select the language
                voice: {languageCode: languageCode, name: config.voiceName},
                // Select the type of audio encoding
                audioConfig: {audioEncoding: config.audioEncoding},
            };

            // Performs the Text-to-Speech request
            client.synthesizeSpeech(request).then(responses => {
                let result = responses[0].queryResult;
                let output = {
                    meta: {
                        deviceid: config._device_id,
                        service: "admin"
                    },
                    metadata: {
                        tenant: "admin"
                    },
                    event: "configure",
                    data: {
                        attrs: result,
                        id: config._device_id
                    }
                };
                this.publisher.publish(output);
                return callback(undefined, [message]);
            }).catch(err => {
                return callback(err);
            });
        } catch (err) {
            return callback(err);
        }
    }
}
const main = new dojot.DojotHandler(new DataHandler());
main.init();
