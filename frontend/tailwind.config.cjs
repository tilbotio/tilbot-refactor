/** @type {import('tailwindcss').Config} */

const colors = require("tailwindcss/colors");

module.exports = {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      colors: {
        // Temporary workaround until we figure out why bg-neutral-focus fails silently
        "neutral-focus": "#2a2e37",
        "tilbot-primary-500": "#29004A",
        "tilbot-primary-400": "#6C4199",
        "tilbot-primary-300": "#A840E3",
        "tilbot-primary-200": "#C98FE3",
        "tilbot-primary-100": "#F5EDFF",
        "tilbot-secondary-hardpink": "#FF1F96",
        "tilbot-secondary-softpink": "#F266E5",
        "tilbot-secondary-hardblue": "#0ABDFF",
        "tilbot-secondary-softblue": "#A1CCF7",
        "tilbot-secondary-purple": "#29173C",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light"],
  },
};
