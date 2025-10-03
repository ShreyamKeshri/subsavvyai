# Security Policy

## 🔒 Security Measures

Unsubscribr implements production-grade security measures to protect user data and financial information.

### Authentication & Authorization
- ✅ Multi-method authentication (Email/Password, Google OAuth, Phone OTP)
- ✅ Supabase Auth with Row-Level Security (RLS)
- ✅ Session management with httpOnly cookies
- ✅ Secure session timeouts (24 hours absolute, 30 minutes idle)
- ✅ Rate limiting on authentication endpoints
- ✅ Account lockout after 5 failed login attempts

### Data Security
- ✅ Encryption at rest (AES-256) via Supabase
- ✅ TLS 1.3 for data in transit
- ✅ Row-Level Security (RLS) on all database tables
- ✅ Input validation and sanitization with Zod
- ✅ XSS protection with DOMPurify
- ✅ SQL injection prevention via parameterized queries

### API Security
- ✅ Rate limiting on all endpoints
- ✅ CSRF protection via origin verification
- ✅ Security headers (HSTS, CSP, X-Frame-Options, etc.)
- ✅ Input validation for all API requests
- ✅ Security event logging

### Payment Security
- ✅ PCI DSS compliance via Razorpay/Stripe
- ✅ Never store full card numbers
- ✅ Payment signature verification
- ✅ Idempotent payment processing
- ✅ Encrypted payment metadata

### Code Security
- ✅ ESLint security plugin
- ✅ Pre-commit hooks with Husky
- ✅ Secret scanning with Secretlint
- ✅ Dependency scanning (npm audit)
- ✅ TypeScript strict mode

## 🐛 Reporting Security Vulnerabilities

We take security seriously. If you discover a security vulnerability, please:

**DO NOT** open a public GitHub issue.

Instead, please email us at: **security@unsubscribr.com** (to be set up)

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will respond within 48 hours and provide updates every 72 hours.

## 🔍 Security Testing

### Rate Limiting

All endpoints have rate limits:

| Endpoint | Limit | Window |
|----------|-------|--------|
| Login | 5 attempts | 15 minutes |
| Signup | 3 attempts | 1 hour |
| OTP Request | 3 requests | 1 hour |
| OTP Verify | 5 attempts | 15 minutes |
| Password Reset | 3 requests | 1 hour |
| API Read | 100 requests | 1 minute |
| API Write | 30 requests | 1 minute |
| Payment | 5 attempts | 1 minute |

### Security Headers

All responses include:
- `Strict-Transport-Security` - Force HTTPS
- `X-Frame-Options: DENY` - Prevent clickjacking
- `X-Content-Type-Options: nosniff` - Prevent MIME sniffing
- `X-XSS-Protection` - XSS filter
- `Content-Security-Policy` - Strict CSP
- `Referrer-Policy` - Privacy protection

### Input Validation

All user inputs are:
1. Validated with Zod schemas
2. Sanitized to remove HTML/scripts
3. Escaped before database insertion
4. Limited in length and format

## 📊 Security Monitoring

We monitor for:
- Failed login attempts (>3 in 15 minutes)
- OTP brute force attempts
- Payment signature mismatches
- Rate limit violations
- Unauthorized API access
- Suspicious activity patterns

Critical security events trigger immediate alerts.

## 🔐 Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

## 🌐 Supported Security Standards

- **OWASP Top 10 (2021)** compliance
- **PCI DSS** requirements (via payment providers)
- **GDPR** ready (data export, deletion, consent)
- **DPDP Act 2023** (India) compliance planned

## 📝 Security Audit Log

All security-relevant events are logged:
- Authentication attempts (success/failure)
- OTP requests and verifications
- Password changes
- Payment transactions
- Data exports
- Account deletions

Logs are retained for 90 days and are encrypted at rest.

## 🚀 Deployment Security

### Environment Variables
- All secrets stored in Vercel Environment Variables
- Separate keys for development/production
- Secrets rotated quarterly
- No secrets in source code (enforced by pre-commit hooks)

### Infrastructure
- Hosted on Vercel (SOC 2 Type II certified)
- Database on Supabase (ISO 27001 certified)
- Automatic HTTPS via Let's Encrypt
- DDoS protection via Vercel Edge Network

## 📚 Security Resources

### For Developers
- [OWASP Top 10](https://owasp.org/Top10/)
- [Supabase Security Guide](https://supabase.com/docs/guides/platform/going-into-prod)
- [Next.js Security Best Practices](https://nextjs.org/docs/security)

### For Users
- Enable MFA (when available)
- Use strong, unique passwords
- Verify email address
- Review connected payment methods
- Check security event log regularly

## 🔄 Security Updates

We regularly update:
- Dependencies (weekly via Dependabot)
- Security policies (quarterly review)
- Encryption keys (annual rotation)
- Security documentation (as needed)

## 📞 Contact

For security concerns:
- Email: security@unsubscribr.com (to be set up)
- Response time: 48 hours
- Updates: Every 72 hours

---

**Last Updated:** October 3, 2025
**Version:** 1.0
