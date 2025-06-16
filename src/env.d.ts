import "react";

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "playing-card": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> &
          (
            | {
                suit: string;
                rank: string;
              }
            | { cid: string }
          ),
        HTMLElement
      >;
    }
  }
}
