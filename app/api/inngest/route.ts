import { inngest } from "@/lib/inngest/client";
import { sendSignUpEmail } from "@/lib/inngest/functions";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({ //background jobs
    client: inngest,
    functions: [sendSignUpEmail],
})