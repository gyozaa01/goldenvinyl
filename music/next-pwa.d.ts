declare module "next-pwa" {
  import type { NextConfig } from "next";

  export interface NextPWAOptions {
    dest: string;
  }

  function withPWA(
    options: NextPWAOptions
  ): <T extends NextConfig>(config: T) => T;
  export default withPWA;
}
