const fetch = require("node-fetch");

class LocalLLM {

    static url;

    static init(url) {

        LocalLLM.url = url;
    }

    static async get_variation(content, prompt, is_mem = false, mem = undefined) {
        let var_msgs = mem;

        if (is_mem) {
            if (var_msgs === undefined || var_msgs.length == 0) {
                var_msgs = [{
                    role: "system",
                    content: prompt
                }];
            }
            else {
                var_msgs[0] = {
                    role: "system",
                    content: prompt
                };
            }
        }
        else {
            var_msgs = [{
                role: "system",
                content: prompt
            }];
        }

        var_msgs.push({
            role: "user",
            content: content
        });

        console.log(var_msgs);

        let url = LocalLLM.url;
        if (LocalLLM.url.indexOf('http') == -1) {
            url = 'http://' + url;
        }

        let r = await fetch(url + '/get-response?q=' + JSON.stringify({"messages": var_msgs}), {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            }
        });

        let resp = await r.json();
        resp = resp.response;

        if (is_mem) {
            var_msgs.push({
                role: "assistant",
                content: resp
            });
        }

        return [var_msgs, resp];
    }
}

module.exports = LocalLLM;
