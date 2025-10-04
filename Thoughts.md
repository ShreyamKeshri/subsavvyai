Thoughts.

1. After entring the details in the signup page and clicking on create account, the user is redirected to http://localhost:3000/login?redirectTo=%2Fverify-email
   This is incorrect. We should actually show user a page which would show a message that "Check your email to verify your account" and also show the email address of the user.

Example: https://segment.com/docs/segment-app/verify-email-address/

2. Currently after clicking the link in the email, the user is redirected to http://localhost:3000/onboarding. This is interesting as we are captuing some details initially from the user.

There are 3 slides in the onboarding page.

1. Full name
2. Monthly budget and category preferences
3. Notification settings

Does this onboarding flow make sense? 1st point doesn't since the user already provided the full name.
Monlty budget is good to have since we can use it to show the user how much they are spending and help them cancel the subscriptions that are not needed.
3rd point is good to have since we can use it to send the user reminders about the subscriptions that are not needed. They want as Email or sms. We have not captured their phone number yet so we might have to cature it. Think when to include this.
One thing we can do is if the user is enabling sms, we can ask for their phone number.

After the onboarding is complete, the user is redirected to http://localhost:3000/dashboard.

Currently we have an Error.

/lib/subscriptions/subscription-actions.ts:250:17
Ecmascript file had an error
248 | _ Calculate next billing date based on billing cycle
249 | _/

> 250 | export function calculateNextBillingDate(startDate: string, cycle: BillingCycle): string {

      |                 ^^^^^^^^^^^^^^^^^^^^^^^^

251 | const date = new Date(startDate)
252 |
253 | switch (cycle) {

Server Actions must be async functions.

We would need to fix this error.

// Database Points.

We were able to successfully capture the monthly budget and category preferences in user preferences and user category preferences table. One thing to note is that there is a theme column in user preferences table. We need to support light and dark mode. Not sure where we asked the user to select the theme. Think about this as well and implement this.
