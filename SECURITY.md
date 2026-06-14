# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Here are the versions that are currently being supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within CariAir, please report it via GitHub Security Advisories or email it directly to mdmuaz3010@gmail.com.

**Please do not:**
- Open a public issue for security vulnerabilities
- Share sensitive information in public forums

**Please do:**
- Provide a clear description of the vulnerability
- Include steps to reproduce the issue
- Mention the affected version(s)
- If possible, suggest a fix or mitigation

We will acknowledge receipt of your vulnerability report within 48 hours and will send you regular updates about our progress.

After the issue has been resolved, we will publicly disclose the issue with attribution to you (if you wish).

## Security Best Practices

When deploying CariAir:

1. **Environment Variables**: Never commit `.env.local` or any file containing secrets to version control
2. **Database**: Use strong passwords for PostgreSQL and restrict network access
3. **Authentication**: Configure Google OAuth properly and keep credentials secure
4. **Updates**: Keep dependencies updated to patch security vulnerabilities
5. **HTTPS**: Always use HTTPS in production

## Known Security Considerations

1. **Image Uploads**: Currently, image uploads are restricted. Ensure proper validation if extending upload functionality.
2. **API Rate Limiting**: Consider implementing rate limiting for public API endpoints in production.
3. **Database Access**: The application uses a database user with full CRUD permissions. In production, consider using separate read-only and read-write users.

## Security Tools

We use the following tools and practices to maintain security:

- Dependabot for dependency updates
- GitHub Security Advisories for vulnerability reporting
- ESLint security plugins
- Regular dependency audits: `pnpm audit`
