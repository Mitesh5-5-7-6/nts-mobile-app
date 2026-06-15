# NTS (National Testing Service) Mobile App - Agent Instructions

This document provides detailed instructions for Claude agents working on the **NTS Mobile App** project. All agents must strictly adhere to these guidelines to ensure consistent, high-quality development.

## 🎯 Project Overview

The NTS Mobile App is a comprehensive platform for managing educational testing and admission processes. Key features include user authentication, course management, exam registration, result checking, and payment integration.

## 🛠️ Technical Guidelines

### 1. Development Approach
- **Quality Assurance**: Write clean, maintainable, and bug-free code
- **Security**: Implement secure coding practices to protect user data
- **Performance**: Optimize for fast loading and smooth user experience
- **User Experience**: Design intuitive and accessible interfaces

### 2. Common Coding Rules
- **No Placeholder/Dummy Code**: Do not use "Lorem ipsum" or dummy data
- **Complete Code**: Provide fully functional code without placeholders
- **Language**: Use **TypeScript** for type safety and maintainability
- **Component Structure**: Follow React component patterns with proper separation of concerns
- **Error Handling**: Implement robust error handling with user-friendly messages
- **State Management**: Use appropriate state management solutions (React Context, Redux, Zustand, etc.)
- **Styling**: Follow project styling conventions (CSS modules, styled-components, Tailwind, etc.)
- **Responsive Design**: Ensure all components are fully responsive
- **Accessibility**: Follow ARIA guidelines and keyboard navigation best practices

### 3. Platform Guidelines
- **Mobile-First**: Design and develop with mobile devices as the primary target
- **Cross-Platform**: Ensure compatibility with both Android and iOS
- **Performance**: Optimize for low-end devices and limited bandwidth

## 🔐 Security Requirements

### 1. Data Protection
- Encrypt all sensitive user data at rest and in transit
- Use secure storage solutions (Keystore/Keychain for sensitive tokens)
- Implement proper session management with token expiration

### 2. Authentication
- Use secure authentication flows (OAuth 2.0, JWT)
- Implement multi-factor authentication where appropriate
- Protect against common vulnerabilities (XSS, CSRF, SQL injection)

### 3. API Security
- Use HTTPS for all API communication
- Implement proper API rate limiting
- Validate all user inputs
- Use parameterized queries for database operations

## 📱 Platform-Specific Guidelines

### Android
- Target recent Android versions (API 24+)
- Optimize for both phones and tablets
- Handle different screen sizes and resolutions

### iOS
- Target recent iOS versions (iOS 14+)
- Optimize for iPhone and iPad
- Follow Apple's HIG (Human Interface Guidelines)

## 🔄 Workflow Instructions

### When a user requests changes:
1. **Analyze**: Understand the user's requirement and its impact on the system
2. **Plan**: Create a detailed implementation plan
3. **Code**: Implement the changes following all technical guidelines
4. **Test**: Verify the changes work as expected
5. **Document**: Update relevant documentation
6. **Review**: Ensure code quality and adherence to best practices

## 📌 General Best Practices

- Always ask for clarification if requirements are ambiguous
- Provide multiple solutions when applicable
- Explain your reasoning and technical decisions
- Offer alternative approaches and improvements
- Be proactive in identifying potential issues
- Test your code before submitting

## 📝 Code Quality Checklist

Before completing any task, agents must verify:
- [ ] Code compiles without errors
- [ ] Changes follow project coding standards
- [ ] Security best practices are implemented
- [ ] Performance is optimized
- [ ] Code is well-documented
- [ ] Tests are written and passing
- [ ] Changes are backward compatible
- [ ] All edge cases are handled
- [ ] User experience is intuitive

## 📁 Project Structure (Reference)

```
nts-mobile-app/
├── src/
│   ├── components/        # Reusable components
│   ├── screens/          # Screen components
│   ├── api/              # API integrations
│   ├── store/            # State management
│   ├── utils/            # Utility functions
│   ├── assets/           # Images, fonts, etc.
│   ├── constants/        # Constants and configuration
│   └── styles/           # Global styles
└── ...
```

## 📧 Communication Guidelines

- Communicate clearly and concisely
- Ask for clarification when needed
- Provide explanations for technical decisions
- Be transparent about limitations
- Offer alternative solutions

## 📚 Key References

- [React Documentation](https://reactjs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Platform-specific documentation](https://developer.android.com/, https://developer.apple.com/)
- [Security Best Practices](https://owasp.org/)

## ✅ Success Criteria

Agents are considered successful when they consistently:
- Deliver high-quality, working code
- Adhere to all technical guidelines
- Protect user data through secure practices
- Create positive user experiences
- Collaborate effectively with other agents
- Contribute to the overall project goals

## 💡 Troubleshooting Common Issues

**If facing issues with code compilation:**
1. Check TypeScript types and syntax
2. Verify all dependencies are installed
3. Ensure proper component structure

**If encountering security vulnerabilities:**
1. Review input validation practices
2. Check authentication and authorization flows
3. Verify data encryption implementations

**If performance issues arise:**
1. Optimize API calls and data fetching
2. Implement lazy loading for large components
3. Optimize images and assets
4. Check for memory leaks

**If user experience issues occur:**
1. Test on multiple devices and screen sizes
2. Verify accessibility guidelines are followed
3. Test navigation and user flows

---

**Remember**: The goal is to build a world-class mobile application that provides exceptional value to NTS users while maintaining the highest standards of code quality, security, and performance.
