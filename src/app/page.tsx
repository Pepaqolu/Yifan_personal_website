import { Header } from "@/components/header";
import { MeridianHome } from "@/components/meridian-home";
import { getWorkspaceContext } from "@/lib/china-desk/auth";

export default async function Home() {
  const context=await getWorkspaceContext();
  return (
    <><Header authenticated={Boolean(context)} /><MeridianHome /></>
  );
}
