# Cross-Browser Testing Guide

## Overview
This guide provides a comprehensive approach to testing the Couple Moments application across different browsers and devices.

## Supported Browsers

### Desktop Browsers
- **Chrome** (latest 2 versions)
- **Firefox** (latest 2 versions)
- **Safari** (latest 2 versions)
- **Edge** (latest 2 versions)

### Mobile Browsers
- **iOS Safari** (latest 2 versions)
- **Chrome Mobile** (latest 2 versions)
- **Samsung Internet** (latest version)

## Testing Checklist

### 1. Authentication Flow
- [ ] Google OAuth login works correctly
- [ ] Session persistence after browser refresh
- [ ] Logout functionality works properly
- [ ] Redirects work as expected after login/logout

### 2. Couple Management
- [ ] Create couple profile page loads correctly
- [ ] Couple pairing/invite system works
- [ ] Relationship start date input functions properly
- [ ] Date picker component displays correctly

### 3. Photo Gallery
- [ ] Photo upload works (test with various image formats: JPG, PNG, WEBP)
- [ ] Photo gallery grid displays correctly
- [ ] Photo lazy loading works
- [ ] Photo deletion functionality works
- [ ] Image hover effects display properly
- [ ] Responsive layout adapts to screen size

### 4. YouTube Integration
- [ ] Video URL input accepts valid YouTube URLs
- [ ] Video embedding displays correctly
- [ ] Iframe lazy loading works
- [ ] Video deletion functionality works
- [ ] Responsive video player sizing

### 5. Relationship Timer
- [ ] Timer displays and updates correctly (every second)
- [ ] Date calculations are accurate
- [ ] Timer persists after page refresh
- [ ] Responsive layout on mobile devices

### 6. Romantic Phrases
- [ ] Phrases load from database
- [ ] Category filtering works
- [ ] Random phrase generation works
- [ ] Copy to clipboard functionality works
- [ ] "Next" button shows different phrases

### 7. Theme Support
- [ ] Light theme displays correctly
- [ ] Dark theme displays correctly (if enabled)
- [ ] Theme persistence across sessions
- [ ] Color contrast meets accessibility standards

### 8. Responsive Design
- [ ] Mobile view (320px - 767px)
- [ ] Tablet view (768px - 1023px)
- [ ] Desktop view (1024px+)
- [ ] Touch interactions work on mobile devices
- [ ] Buttons and inputs are properly sized for touch

## Browser-Specific Issues to Watch For

### Safari/iOS Safari
- **Date Input**: Safari has unique date picker styling
- **Flexbox**: Some flexbox properties behave differently
- **Lazy Loading**: Check image lazy loading support
- **WebP Support**: Verify WebP image format support
- **100vh Issue**: Fixed with `-webkit-fill-available` if needed

### Firefox
- **Scrollbar Styling**: Custom scrollbar styles may not work
- **Input Autofill**: Autofill styling may differ
- **Flexbox Gap**: Older versions may not support `gap` property

### Chrome/Edge
- **Generally best support**: Most features work out of the box
- **Check for Chromium-specific bugs**

### Mobile Browsers
- **Viewport Height**: 100vh may include/exclude address bar
- **Touch Events**: Ensure hover states don't interfere with clicks
- **File Upload**: Photo upload from camera/gallery
- **Performance**: Test with slower mobile devices

## Testing Tools

### Manual Testing
1. **BrowserStack** (recommended for comprehensive testing)
   - Access: https://www.browserstack.com/
   - Test on real devices and browsers

2. **Local Device Testing**
   - Test on your own devices
   - Use browser dev tools device emulation

3. **Can I Use**
   - Check feature compatibility: https://caniuse.com/
   - Verify CSS and JS feature support

### Automated Testing
1. **Playwright** (future implementation)
   ```bash
   npm install -D @playwright/test
   npx playwright test --project=chromium --project=firefox --project=webkit
   ```

2. **Cypress** (alternative)
   ```bash
   npm install -D cypress
   npx cypress open
   ```

## Performance Testing

### Core Web Vitals
Test on different browsers using:
- **Lighthouse** (Chrome DevTools)
- **PageSpeed Insights**: https://pagespeed.web.dev/

Target Metrics:
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Network Conditions
Test with throttled network:
- **Fast 3G**
- **Slow 3G**
- **Offline** (check error handling)

## Accessibility Testing

### Tools
1. **axe DevTools**: Browser extension for accessibility testing
2. **WAVE**: Web accessibility evaluation tool
3. **Screen Readers**:
   - NVDA (Windows)
   - JAWS (Windows)
   - VoiceOver (macOS/iOS)
   - TalkBack (Android)

### Checklist
- [ ] Keyboard navigation works throughout the app
- [ ] Focus indicators are visible
- [ ] Alt text on all images
- [ ] Proper heading hierarchy
- [ ] Color contrast meets WCAG AA standards
- [ ] Form labels are properly associated

## Bug Reporting Template

When you find a browser-specific issue, document it using this template:

```markdown
### Issue Title
Brief description of the issue

**Browser/Device**: Chrome 120 on Windows 11
**URL**: /path/to/page
**Steps to Reproduce**:
1. Step one
2. Step two
3. Step three

**Expected Behavior**: What should happen
**Actual Behavior**: What actually happens
**Screenshots**: [Attach if applicable]
**Workaround**: [If any]
```

## Quick Test Commands

```bash
# Start development server
pnpm dev

# Run type checking
pnpm check

# Run tests
pnpm test

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Priority Testing Order

1. **Critical Path** (P0):
   - Authentication flow
   - Create/view couple profile
   - Photo upload and display
   - Video add and display

2. **Important Features** (P1):
   - Relationship timer
   - Romantic phrases
   - Theme switching
   - Responsive layouts

3. **Nice to Have** (P2):
   - Hover effects
   - Animations
   - Advanced UI interactions

## Notes

- Always test with cache disabled during development
- Test both authenticated and unauthenticated states
- Test with various data states (empty, partial, full)
- Test error scenarios (network failures, invalid inputs)
- Verify console for warnings and errors
- Check network tab for failed requests

## Resources

- [MDN Browser Compatibility](https://developer.mozilla.org/en-US/docs/Web/Guide/Browser_compatibility)
- [Can I Use](https://caniuse.com/)
- [Web.dev Testing Guide](https://web.dev/testing/)
- [Playwright Documentation](https://playwright.dev/)

