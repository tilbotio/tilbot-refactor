<script lang="ts">
  import { onMount } from "svelte";
  import { Configuration, OpenAIApi } from "openai";
  import { Play, Stop } from "svelte-heros-v2";

  let {
    projectSettings,
    generalSettings,
    variables,
    is_running = $bindable(),
    runAll = () => {},
    sendMessage = () => {},
    sendVariation = () => {},
  } = $props();

  let chatgpt_str: string = "";
  let data_str: string = "";
  let loaded_var: string = "";
  let is_loading_csv: boolean = false;
  let openai: any;
  let msgs: Array<any>;
  let var_msgs: Array<any>;
  let window_api: any;

  onMount(() => {
    window_api = (window as any)?.api;

    window.addEventListener("message", message_received, false);

    // Only works in Electron for now. @TODO: implement for online version of Tilbot.
    if (
      typeof navigator === "object" &&
      typeof navigator.userAgent === "string" &&
      navigator.userAgent.indexOf("Electron") >= 0
    ) {
      window_api.receive("csv-load", (param: any) => {
        if (is_loading_csv) {
          is_loading_csv = false;
          data_str = data_str.replace("[" + loaded_var + "]", param.csv);

          msgs = [
            {
              role: "system",
              content: projectSettings.llm_prompt + "\n" + data_str,
            },
          ];

          // Needs most up-to-date setting for API key (have editor manage it?)
          // Needs settings for prompts from project file -> can be passed from editor
          runAll();
        }
      });
    }
  });

  async function message_received(event: MessageEvent) {
    if (event.data.msg == "chatgptsim" && is_running) {
      // Bot text from the simulator
      if (event.data.type == "Auto") {
        chatgpt_str += event.data.content + "\n\n";
      } else {
        chatgpt_str += event.data.content;
        console.log(chatgpt_str);

        msgs.push({
          role: "user",
          content: chatgpt_str,
        });

        console.log("=====");
        console.log(msgs);
        console.log("=====");

        const completion = await openai.createChatCompletion({
          model: generalSettings.chatgpt_sim_version,
          messages: msgs,
          temperature: projectSettings.temperature,
        });

        console.log(completion);
        // @TODO: clean up older messages if we're nearing the token limit.
        // completion.data.usage.total_tokens
        // @TODO: stop in case ChatGPT keeps generating the same text

        let resp = completion.data.choices[0].message.content;

        if (event.data.type == "MC") {
          let mc_options_str = chatgpt_str.substr(
            chatgpt_str.indexOf("{") + 1,
            chatgpt_str.indexOf("}") - chatgpt_str.indexOf("{") - 1
          );
          let mc_options = mc_options_str.split(";");

          for (let i = 0; i < mc_options.length; i++) {
            if (
              resp
                .toLowerCase()
                .includes(
                  mc_options[i]
                    .toLowerCase()
                    .replace("!", "")
                    .replace(".", "")
                    .replace("?", "")
                )
            ) {
              console.log(mc_options[i]);

              msgs.push({
                role: "assistant",
                content: mc_options[i],
              });

              // Deprecated, new turbo version does not need this delay (and won't get it)
              if (generalSettings.chatgpt_sim_version == "gpt-4") {
                // Since the GPT-4 API call frequency seems to be very limited, add artificial delay.
                setTimeout(() => {
                  sendMessage(mc_options[i]);
                }, 20000);
              } else {
                sendMessage(mc_options[i]);
              }

              break;
            }
          }
        } else {
          if (resp.indexOf("{") !== -1 && resp.indexOf("}") !== -1) {
            resp = resp.replace(
              resp.substr(
                resp.indexOf("{"),
                resp.indexOf("}") - resp.indexOf("{") + 2
              ),
              ""
            );
          }

          msgs.push({
            role: "assistant",
            content: resp,
          });

          if (generalSettings.chatgpt_sim_version == "gpt-4") {
            setTimeout(() => {
              sendMessage(resp);
            });
          } else {
            sendMessage(resp);
          }
        }

        chatgpt_str = "";
      }
    } else if (event.data.msg == "variation") {
      if (
        event.data.memory === undefined ||
        !event.data.memory ||
        var_msgs === undefined ||
        var_msgs.length == 0
      ) {
        var_msgs = [
          {
            role: "system",
            content: event.data.prompt,
          },
        ];
      } else {
        var_msgs[0] = {
          role: "system",
          content: event.data.prompt,
        };
      }

      var_msgs.push({
        role: "user",
        content: event.data.content,
      });

      console.log(var_msgs);

      let resp = "";

      // Check if ChatGPT or another LLM that is triggered via API
      if (generalSettings.llm_setting == "chatgpt") {
        const configuration = new Configuration({
          apiKey: generalSettings.chatgpt_api_key,
        });

        let openai = new OpenAIApi(configuration);

        const completion = await openai.createChatCompletion({
          //model: "gpt-3.5-turbo",
          model: generalSettings.chatgpt_sim_version,
          messages: var_msgs,
          temperature: projectSettings.temperature,
        });

        console.log(completion);

        if (completion.data.usage!.total_tokens >= 3500) {
          var_msgs.splice(1, 2);
        }

        resp = completion.data.choices[0].message!.content!;
      } else {
        let url = generalSettings.llm_api_address;
        if (generalSettings.llm_api_address.indexOf("http") == -1) {
          url = "http://" + url;
        }
        let r = await fetch(
          url + "/get-response?q=" + JSON.stringify({ messages: var_msgs }),
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        resp = (await r.json()).response;
      }

      if (event.data.memory !== undefined && event.data.memory) {
        var_msgs.push({
          role: "assistant",
          content: resp,
        });
      }
      sendVariation(resp);
    } else if (event.data.msg == "reset_var_mem") {
      var_msgs = [];
    }
  }

  function stop_chatgpt() {
    is_running = false;
  }

  function run_chatgpt() {
    data_str = projectSettings.llm_prompt_data;

    const configuration = new Configuration({
      apiKey: generalSettings.chatgpt_api_key,
    });

    openai = new OpenAIApi(configuration);

    // Fill any data if needed
    // For now we assume at most only one dataset is used
    let regExp = /\[([^\]]+)\]/g;
    let matches = regExp.exec(data_str);

    if (matches !== null) {
      loaded_var = matches[1];

      for (const [key, value] of Object.entries(
        variables as { [key: string]: any }
      )) {
        if (value.name == loaded_var) {
          is_loading_csv = true;
          window_api.send("get-csv", value.csvfile);
          break;
        }
      }
    } else {
      msgs = [
        {
          role: "system",
          content: projectSettings.llm_prompt + "\n" + data_str,
        },
      ];

      // Needs most up-to-date setting for API key (have editor manage it?)
      // Needs settings for prompts from project file -> can be passed from editor
      runAll();
    }
  }
</script>

{#if is_running}
  <button
    class="btn btn-circle bg-[#FFC500] hover:bg-[#ECB600] border-[#FFC500] hover:border-[#ECB600] ml-4"
    onclick={stop_chatgpt}><Stop class="w-6 h-6" /></button
  >
{:else}
  <button
    class="btn btn-circle bg-[#FFC500] hover:bg-[#ECB600] border-[#FFC500] hover:border-[#ECB600] ml-4"
    onclick={run_chatgpt}><Play class="w-6 h-6" /></button
  >
{/if}
