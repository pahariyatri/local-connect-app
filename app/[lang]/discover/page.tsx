"use client";

import { useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Loading from "@/app/loading";

/**
 * /discover has been folded into /explore (one "location + services
 * discovery" concept instead of two). This redirect exists only to keep old
 * links (bookmarks, indexed URLs, the in-app sitemap) working.
 */
export default function DiscoverRedirect() {
    const router = useRouter();
    const { lang } = useParams<{ lang: string }>();
    const searchParams = useSearchParams();

    useEffect(() => {
        const query = searchParams.toString();
        router.replace(`/${lang}/explore${query ? `?${query}` : ""}`);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <Loading />;
}
