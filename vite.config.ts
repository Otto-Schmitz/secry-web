import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Evita que a IDE/ambiente abra a janela Qt; o app deve ser aberto no Firefox/Opera manualmente
function devHint() {
  return {
    name: "dev-hint",
    configureServer() {
      return () => {
        console.log("\n  \x1b[1;36mAbra no navegador (Firefox/Opera):\x1b[0m \x1b[4mhttp://localhost:5173\x1b[0m\n");
      };
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
    open: false,
    hmr: {
      overlay: false,
    },
  },
  plugins: [devHint(), react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
