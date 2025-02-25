const prefixer = require("postcss-prefix-selector");

module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    cssnano: {},
    "postcss-prefix-selector": {
      prefix: ".@conversiondigital/-chat-plugin",
      transform: function (prefix, selector, prefixedSelector) {
        if (selector === "html.dark") {
          return selector;
        }
        if (selector === "body" || selector === "html") {
          return selector + " " + prefix;
        }  else if (selector.includes(".cl-dark\\:")) {
          return selector;
        } else if (selector.includes(".cl-dark")) {
          // Handle .cl-dark specially
          return selector.replace(".cl-dark", `${prefix} .cl-dark`);
        } else {
          return prefixedSelector;
        }
      },
    },
  },
};
