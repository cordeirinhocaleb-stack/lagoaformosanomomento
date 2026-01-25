import Link from "next/link";
import ClientAdvertiserPage from "./ClientAdvertiserPage";

export const dynamicParams = false;

export async function generateStaticParams() {
    // Static export workaround: No paths pre-rendered, relying on client-side routing
    return [];
}
export const dynamic = 'force-static';

export default function Page() {
    return <ClientAdvertiserPage />;
}
