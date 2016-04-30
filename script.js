'use strict';

const _ = require('lodash');
const Script = require('smooch-bot').Script;

const scriptRules = require('./script.json');

module.exports = new Script({
    processing: {
        //prompt: (bot) => bot.say('Beep boop...'),
        receive: () => 'processing'
    },

    start: {
        receive: (bot) => {
            return bot.say('Hi ! Would you like to talk to the Support team or would you like to register for a tournament ?')
                .then(() => bot.say('Type \'REGISTER\' to Register or \'SUPPORT\' for talking to our Support'))
                .then(() => 'speak');
        }
    },

    speak: {
        receive: (bot, message) => {

            let upperText = message.text.trim().toUpperCase();

            function updateSilent() {
                switch (upperText) {
                    case 'CONNECT ME':
                        return bot.setProp('silent', true);
                    case 'DISCONNECT':
                        return bot.setProp('silent', false);
                    default:
                        return Promise.resolve();
                }
            }

            function getSilent() {
                return bot.getProp('silent');
            }

            function processMessage(isSilent) {
                if (isSilent) {
                    return Promise.resolve('speak');
                }

                if (!_.has(scriptRules, upperText)) {
                    return bot.say(`I am still in Beta. So there might be a few issues. I didn't understand that. Type \'REGISTER\' to Register or \'SUPPORT\' for talking to our Support`).then(() => 'speak');
                }

                var response = scriptRules[upperText];
                var lines = response.split('\n');

                var p = Promise.resolve();
                _.each(lines, function(line) {
                    line = line.trim();
                    p = p.then(function() {
                        console.log(line);
                        return bot.say(line);
                    });
                })

                return p.then(() => 'speak');
            }

            return updateSilent()
                .then(getSilent)
                .then(processMessage);
        }
    }
});
