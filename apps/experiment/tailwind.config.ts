import type { Config } from 'tailwindcss';
import colors from "tailwindcss/colors";

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    extend: {
      colors: {
        base: colors.zinc,
        primary: colors.emerald,
        secondary: colors.amber
      }
    }
  },

	plugins: []
} satisfies Config;
