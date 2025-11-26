import { sendNewsSummaryEmail, sendWelcomeEmail } from "@/lib/nodemailer";
import { inngest } from "@/lib/inngest/client";
import { NEWS_SUMMARY_EMAIL_PROMPT, PERSONALIZED_WELCOME_EMAIL_PROMPT } from "@/lib/inngest/prompts";
import { getAllUsersForNewsEmail } from "@/lib/actions/user.actions";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";
import { getNews } from "@/lib/actions/finnhub.actions";

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

const prodCron: string = '0 12 * * *';
const devCron: string = '* * * * *';

export const sendDailyNewsSummary = inngest.createFunction(
    { id: 'daily-news-summary'},
    [ { event: 'app/send.daily.news' }, { cron: prodCron } ], 
    async ({ step }) => {
        // 1. Get all users
        const users = await step.run('get-all-users', async () => {
            return await getAllUsersForNewsEmail();
        });

        if(!users || users.length === 0) return { success: false, message: 'No users found for email.' };
        
        // 2. For each user, get watchlist and fetch news
        for (const user of users) {
             const result = await step.run(`process-user-${user.id}`, async () => {
                const symbols = await getWatchlistSymbolsByEmail(user.email);
                const news = await getNews(symbols);
                
                return { 
                    user: user.email, 
                    symbolsCount: symbols.length, 
                    news,
                    newsCount: news.length 
                };
            });

            // 3. Summarize news via AI
            if (result.newsCount > 0) {
                const newsData = result.news.map(article => `
                    - Headline: ${article.headline}
                    - Summary: ${article.summary}
                    - Source: ${article.source}
                    - URL: ${article.url}
                `).join('\n\n');

                const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace('{{newsData}}', newsData);

                const aiResponse = await step.ai.infer(
                    `generate-news-summary-${user.id}`,
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

                // 4. Send the emails
                await step.run(`send-email-${user.id}`, async () => {
                    const part = aiResponse.candidates?.[0]?.content?.parts?.[0];
                    const newsContent = (part && 'text' in part ? part.text : null) || "<p>Here is your daily news summary.</p>";

                    await sendNewsSummaryEmail({
                        email: user.email,
                        newsContent
                    });
                });
            }
        }

        return { success: true, message: 'Daily news summary emails sent successfully' };
    }
)