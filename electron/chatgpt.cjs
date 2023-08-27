const { Configuration, OpenAIApi } = require("openai");

class ChatGPT {
    static openai;

    static init(api_key) {

        let configuration = new Configuration({
            apiKey: api_key
        });        
        
        ChatGPT.openai = new OpenAIApi(configuration);
    }

    static async get_variation(content, prompt) {

        let var_msgs = [{
            role: "system",
            content: prompt
        }];
        
        var_msgs.push({
            role: "user",
            content: content
        });
        
        console.log(var_msgs);
       
        const completion = await ChatGPT.openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: var_msgs,
                temperature: 0.9
        });
        
        console.log(completion);
        // @TODO: clean up older messages if we're nearing the token limit.            
        // completion.data.usage.total_tokens
        // @TODO: stop in case ChatGPT keeps generating the same text
        
        return completion.data.choices[0].message.content;        
    }
}

module.exports = ChatGPT;