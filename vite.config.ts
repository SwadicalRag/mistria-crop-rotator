import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  base: '/mistria-crop-rotator/',
  plugins: [
    /**
     * We're using `SharedArrayBuffer`s in our code,
     * which requires either HTTPS or localhost, and it requires cross origin isolation.
     * So we're enabling the CORS headers here for development mode.
     *
     * Do note that your production server will need HTTPS and CORS headers set up correctly.
     * If you cannot control the HTTP headers that your production server sends back (like on GitHub pages),
     * then there's a workaround using a service worker. See https://dev.to/stefnotch/enabling-coop-coep-without-touching-the-server-2d3n
     */
    {
      // Plugin code is from https://github.com/chaosprint/vite-plugin-cross-origin-isolation
      name: "configure-response-headers",
      configureServer: (server) => {
        server.middlewares.use((_req, res, next) => {
          res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
          res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
          next();
        });
      },
    },
		viteStaticCopy({
			targets: [
				{
					src: 'node_modules/z3-solver/build/z3-built.*',
					dest: ''
				}
			]
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
