<script lang="ts">
  import { onMount } from "svelte";
  import { Configuration, OpenAIApi } from "openai";
  import { Play, Stop } from "svelte-heros-v2";

  let {
    projectSettings,
    generalSettings,
    variables,
    isRunning = $bindable(),
    runAll = () => {},
    sendMessage = () => {},
    sendVariation = () => {},
  } = $props();

  let prompt: string = "";
  let promptData: string = "";
  let openAIApi: OpenAIApi | null = $state(null);
  let messages: Array<any>;
  let variableMessages: Array<any>;
  let windowApi: any;

  $effect(() => {
    isRunning = openAIApi != null;
  });

  onMount(() => {
    windowApi = (window as any)?.api;

    window.addEventListener("message", messageReceived, false);
  });

  async function messageReceived(event: MessageEvent) {
    if (!openAIApi) {
      return;
    }
    if (event.data.msg == "chatgptsim") {
      // Bot text from the simulator
      if (event.data.type == "Auto") {
        prompt += event.data.content + "\n\n";
      } else {
        prompt += event.data.content;
        console.log(prompt);

        messages.push({
          role: "user",
          content: prompt,
        });

        console.log("=====");
        console.log(messages);
        console.log("=====");

        const completion = await openAIApi.createChatCompletion({
          model: generalSettings.chatgpt_sim_version,
          messages,
          temperature: projectSettings.temperature,
        });

        console.log(completion);
        // @TODO: clean up older messages if we're nearing the token limit.
        // completion.data.usage.total_tokens
        // @TODO: stop in case ChatGPT keeps generating the same text

        let resp = completion.data.choices[0].message!.content!;

        if (event.data.type == "MC") {
          const leftBraceIndex = prompt.indexOf("{");
          const rightBraceIndex = prompt.indexOf("}");
          const mcOptions = prompt.substring(
            leftBraceIndex + 1,
            rightBraceIndex
          );

          for (const option of mcOptions.split(";")) {
            if (
              resp
                .toLowerCase()
                .includes(
                  option
                    .toLowerCase()
                    .replace("!", "")
                    .replace(".", "")
                    .replace("?", "")
                )
            ) {
              console.log(option);

              messages.push({
                role: "assistant",
                content: option,
              });

              // Deprecated, new turbo version does not need this delay (and won't get it)
              if (generalSettings.chatgpt_sim_version == "gpt-4") {
                // Since the GPT-4 API call frequency seems to be very limited, add artificial delay.
                setTimeout(() => {
                  sendMessage(option);
                }, 20000);
              } else {
                sendMessage(option);
              }

              break;
            }
          }
        } else {
          const leftBraceIndex = resp.indexOf("{");
          const rightBraceIndex = resp.indexOf("}");
          if (
            leftBraceIndex !== -1 &&
            rightBraceIndex !== -1 &&
            leftBraceIndex < rightBraceIndex
          ) {
            resp =
              resp.substring(0, leftBraceIndex) +
              resp.substring(rightBraceIndex + 1);
          }

          messages.push({
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

        prompt = "";
      }
    } else if (event.data.msg == "variation") {
      if (
        event.data.memory === undefined ||
        !event.data.memory ||
        variableMessages === undefined ||
        variableMessages.length == 0
      ) {
        variableMessages = [
          {
            role: "system",
            content: event.data.prompt,
          },
        ];
      } else {
        variableMessages[0] = {
          role: "system",
          content: event.data.prompt,
        };
      }

      variableMessages.push({
        role: "user",
        content: event.data.content,
      });

      console.log(variableMessages);

      let content: string;

      // Check if ChatGPT or another LLM that is triggered via API
      if (generalSettings.llm_setting == "chatgpt") {
        const completion = await openAIApi.createChatCompletion({
          //model: "gpt-3.5-turbo",
          model: generalSettings.chatgpt_sim_version,
          messages: variableMessages,
          temperature: projectSettings.temperature,
        });

        console.log(completion);

        if (completion.data.usage!.total_tokens >= 3500) {
          variableMessages.splice(1, 2);
        }

        content = completion.data.choices[0].message!.content!;
      } else {
        let url = generalSettings.llm_api_address;
        if (generalSettings.llm_api_address.indexOf("://") == -1) {
          url = "https://" + url;
        }
        const response = await fetch(
          url +
            `/get-response?q=${encodeURIComponent(
              JSON.stringify({ messages: variableMessages })
            )}`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
          }
        );
        if (!response.ok) {
          throw new Error(await response.text());
        }

        content = (await response.json()).response;
      }

      if (event.data.memory !== undefined && event.data.memory) {
        variableMessages.push({ role: "assistant", content });
      }
      sendVariation(content);
    } else if (event.data.msg == "reset_var_mem") {
      variableMessages = [];
    }
  }

  function startChatGPT() {
    openAIApi = null;
  }

  async function runChatGPT() {
    promptData = projectSettings.llm_prompt_data;

    const configuration = new Configuration({
      apiKey: generalSettings.chatgpt_api_key,
    });

    openAIApi = new OpenAIApi(configuration);

    // Fill any data if needed
    // For now we assume at most only one dataset is used
    const regExp = /\[([^\]]+)\]/g;
    const matches = regExp.exec(promptData);

    if (matches !== null) {
      const loadedVar = matches[1];

      for (const value of Object.values(variables as { [key: string]: any })) {
        if (value.name == loadedVar) {
          // Shouldn't this be query-db?!
          const csv = await windowApi.invoke("get-csv", value.csvfile);
          if (csv != null) {
            promptData = promptData.replace("[" + loadedVar + "]", csv);

            messages = [
              {
                role: "system",
                content: `${projectSettings.llm_prompt}\n${promptData}`,
              },
            ];

            // Needs most up-to-date setting for API key (have editor manage it?)
            // Needs settings for prompts from project file -> can be passed from editor
            runAll();
          }

          break;
        }
      }
    } else {
      messages = [
        {
          role: "system",
          content: `${projectSettings.llm_prompt}\n${promptData}`,
        },
      ];

      // Needs most up-to-date setting for API key (have editor manage it?)
      // Needs settings for prompts from project file -> can be passed from editor
      runAll();
    }
  }
</script>

{#if isRunning}
  <button
    class="btn btn-circle bg-[#FFC500] hover:bg-[#ECB600] border-[#FFC500] hover:border-[#ECB600] ml-4"
    onclick={startChatGPT}><Stop class="w-6 h-6" /></button
  >
{:else}
  <button
    class="btn btn-circle bg-[#FFC500] hover:bg-[#ECB600] border-[#FFC500] hover:border-[#ECB600] ml-4"
    onclick={runChatGPT}><Play class="w-6 h-6" /></button
  >
{/if}
