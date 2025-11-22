'use server';

import { auth } from "@/lib/better-auth/auth";
import { inngest } from "@/lib/inngest/client";
import { headers } from "next/headers";

export const signUpWithEmail = async ({ 
    email, 
    password, 
    fullName, 
    country, 
    investmentGoals, 
    riskTolerance, 
    preferredIndustry 
}: SignUpFormData) => {
    try{
        const response = await auth.api.signUpEmail({
            body: { email: email, password: password, name: fullName }
        })

        if(response) {
            await inngest.send({
                name: "app/user.created",
                data: {
                    email: email, 
                    name: fullName, 
                    country: country,
                    investmentGoals: investmentGoals, 
                    riskTolerance: riskTolerance, 
                    preferredIndustry: preferredIndustry
                }
            })
        }

        return { success: true, data: response }
    } catch (e) {
        console.log('Sign up failed', e)
        return { suggess: false, error: 'Sign Up Failed' }
    }
}

export const signOut = async () => {
    try {
        await auth.api.signOut({ headers: await headers() });
    } catch (e) {
        console.log('Sign out failed', e)
        return { suggess: false, error: 'Sign Out Failed' } 
    }
}