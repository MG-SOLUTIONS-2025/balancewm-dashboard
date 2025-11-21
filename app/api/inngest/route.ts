import { inngest } from "@/lib/inngest/client";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({ //background jobs
    client: inngest,
    functions: [],
})