import { defineConfig } from "vite"
import { resolve } from "path"
import dts from "vite-plugin-dts"

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "Wy-Editor",
      fileName: "wy-editor",
    },
    rollupOptions: {
      external: ["react"],
      output: {
        globals: {
          react: "React",
        }
      }
    },
  },
  plugins: [
    dts({
      rollupTypes: true,
    }),
  ],
})

