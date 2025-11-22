import { sendWelcomeEmail } from "@/lib/nodemailer";
import { inngest } from "@/lib/inngest/client";
import { PERSONALIZED_WELCOME_EMAIL_PROMPT } from "@/lib/inngest/prompts";
import { getAllUsersForNewsEmail } from "../actions/user.actions";

export const sendSignUpEmail = inngest.createFunction(
    { id: 'sign-up-email' },
    { event: 'app/user.created' },
    async ({ event, step }) => {
        const userProfile = `
            - Country: ${event.data.country}
            - Investment goals: ${event.data.investmentGoals}
            - Risk tolerance: ${event.data.riskTolerance}
            - Preferred industry: ${event.data.preferredIndustry}
        `

        const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace(
            '{{userProfile}}', userProfile
        );

        const response = await step.ai.infer( //uses inngest custom ai inference offload server
            'generate-welcome-email',
            {
                model: step.ai.models.gemini({
                    model: 'gemini-2.5-flash-lite'
                }),
                body: {
                    contents: [
                        {
                            role: 'user',
                            parts: [
                                { text: prompt }
                            ]
                        }
                    ]
                }
            }
        );

        await step.run('send-welcome-email', async () => {
            const part = response.candidates?.[0]?.content?.parts?.[0];
            const introText = (part && 'text' in part ? part.text : null) || "Thanks for joining our stock dashboard platform that enables you to make smarter moves."

            const { data: { email, name } } = event;

            return await sendWelcomeEmail({ 
                email, name, intro: introText
            });

        })

        return {
            success: true,
            message: 'Welcome email sent.'
        }
    }
);

export const sendDailyNewsSummary = inngest.createFunction(
    { id: 'daily-news-summary'},
    [ { event: 'app/send.daily.news' }, { cron: '0 12 * * *' } ], 
    async ({ step }) => {
        // 1. Get all users
        const users = await step.run('get-all-users', getAllUsersForNewsEmail);

        if(!users || users.length === 0) return { success: false, message: 'No users found for email.' };
        
        // 2/ fetch personalized news

        
        // 3. summarize the news using ai for each user
        //  4. send the emails. 
    }
)