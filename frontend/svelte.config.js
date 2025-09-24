import adapterNode from "@sveltejs/adapter-node";
import adapterStatic from "@sveltejs/adapter-static";
import sveltePreprocess from "svelte-preprocess";

// For after upgrading to Svelte v6
//import { sveltePreprocess } from "svelte-preprocess";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: sveltePreprocess({
    postcss: true,
  }),

  kit: {
    adapter:
      process.env.TILBOT_ENV === "app"
        ? adapterStatic({ pages: "../app/build" })
        : adapterNode(),
  },
};

export default config;
