Thoughts.

## Completed Issues ✅

1. ✅ After entring the details in the signup page and clicking on create account, the user is redirected to http://localhost:3000/login?redirectTo=%2Fverify-email
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

✅ Fixed: Server Action async error - calculateNextBillingDate is now async.

// Database Points.

We were able to successfully capture the monthly budget and category preferences in user preferences and user category preferences table. One thing to note is that there is a theme column in user preferences table. We need to support light and dark mode. Not sure where we asked the user to select the theme. Think about this as well and implement this.

## Completed Issues ✅

1. ✅ When clicking on resend email button, we should improve how we show the error message to the user if he clicks on resend too soon.
2. ✅ On resend, the old link present in the mail is expiring correctly but we should create a custom page to show the Proper message to the user saying that the Link has expired. Check your email for the new mail sent by SubSavvyAI.
3. ✅ Clicking on the latest mail sent us to the login page which is correct.
4. ✅ On Sign Up page our primary method of sign up is email, secondary Google adn thirdly mobile but on Login page our primary is mobile and thirdly is email. This is incorrect. Need to fix. → **Fixed: Both now use Email → Google → Phone**
5. ✅ I entered phone number and got the error Unsupported phone provider which is correct for now but this error message doesn't go away even when I have now clicked on sign in with email. → **Fixed: Errors clear on method switch**
6. ⏳ To do - Settings tab on the Dashboard. → **In Progress**
7. ✅ Logo not visible on Landing Page and Logo too small on Dashboard. → **Fixed: Logo now visible, proper sizing**
8. ✅ Button should display Forgot Password on Login Page. → **Fixed: Shows "Forgot Password?" link**
9. ⏳ Need to create email templates. → **Pending**
10. ✅ Need to Create Reset Password Functionality. → **Fixed: Full flow working**

## Pending Issues ⏳

✅ **Completed:** Implemented Figma UI design principles
   - Visual hierarchy
   - Consistency
   - Feedback
   - Clarity
   - User control
   - Cognitive load reduction
   - Accessibility

✅ **Completed:** Reset Password Functionality - Full flow working with proper token validation, password confirmation, and success page.

## Current Tasks

1. **Settings Page** - In progress
   - Profile management
   - Theme preference (save to DB)
   - Notification settings
   - Account security

2. **Email Templates** - Pending
   - Branded verification email
   - Password reset email
   - Welcome email
   - Weekly summary email
