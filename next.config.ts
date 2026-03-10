import "@/modules/shared/infrastructure/env";
import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  reactCompiler: true,
};

const withNextIntl = createNextIntlPlugin("./src/modules/shared/infrastructure/translation/request.ts");
export default withNextIntl(nextConfig);

