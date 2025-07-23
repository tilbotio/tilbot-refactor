import adapterNode from "@sveltejs/adapter-node";
import adapterStatic from "@sveltejs/adapter-static";
import preprocess from "svelte-preprocess";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: preprocess({
    postcss: true,
  }),

  kit: {
    adapter:
      process.env.TILBOT_ENV !== undefined && process.env.TILBOT_ENV == "app"
        ? adapterStatic({ pages: "../app/build" })
        : adapterNode(),
  },
};

export default config;
