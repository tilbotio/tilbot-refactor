// Base class for LocalLLM and ChatGPT:
class LLM {
    static fromSettings(settings) {
        if (settings.llm_setting === 'chatgpt') {
            const ChatGPT = require('./chatgpt.cjs');
            return new ChatGPT(settings.chatgpt_api_key);
        } else {
            const LocalLLM = require('./localllm.cjs');
            return new LocalLLM(settings.llm_api_address);
        }
    }
}

module.exports = LLM;
