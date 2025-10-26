#!/bin/bash

# Deploy Privacy Policy and Terms of Service to GitHub Pages
# This creates a simple website to host the legal documents

echo "🚀 Setting up legal documents hosting..."

# Create docs directory for GitHub Pages
mkdir -p docs

# Convert markdown to HTML for web hosting
cat > docs/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Three Steps - Legal Documents</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1 { color: #10b981; }
        h2 { color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
        .nav { background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .nav a { margin-right: 20px; color: #10b981; text-decoration: none; font-weight: 500; }
        .nav a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="nav">
        <h1>Three Steps - Legal Documents</h1>
        <a href="privacy.html">Privacy Policy</a>
        <a href="terms.html">Terms of Service</a>
        <a href="support.html">Support</a>
    </div>
    
    <h2>About Three Steps</h2>
    <p>Three Steps is a smart grocery shopping tracker that helps you manage your budget, compare prices, and make informed shopping decisions.</p>
    
    <h2>Legal Documents</h2>
    <ul>
        <li><a href="privacy.html">Privacy Policy</a> - How we handle your data</li>
        <li><a href="terms.html">Terms of Service</a> - Terms of use for the app</li>
        <li><a href="support.html">Support</a> - Get help with the app</li>
    </ul>
    
    <p><em>Last updated: January 25, 2025</em></p>
</body>
</html>
EOF

# Create Privacy Policy HTML
echo "📄 Creating Privacy Policy page..."
cat > docs/privacy.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Three Steps - Privacy Policy</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1 { color: #10b981; }
        h2 { color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
        .nav { background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .nav a { margin-right: 20px; color: #10b981; text-decoration: none; font-weight: 500; }
        .nav a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="nav">
        <a href="index.html">← Back to Home</a>
        <a href="terms.html">Terms of Service</a>
        <a href="support.html">Support</a>
    </div>
EOF

# Add Privacy Policy content from markdown
echo "Converting Privacy Policy..."
sed 's/^# /## /g; s/^## /### /g; s/^### /#### /g' PRIVACY_POLICY.md | \
sed 's/^- \*\*/• **/g; s/^- /• /g' | \
sed 's/\*\*\([^*]*\)\*\*/<strong>\1<\/strong>/g' | \
sed 's/`\([^`]*\)`/<code>\1<\/code>/g' | \
sed 's/^$/\<br\>/g' >> docs/privacy.html

cat >> docs/privacy.html << 'EOF'
</body>
</html>
EOF

# Create Terms of Service HTML
echo "📄 Creating Terms of Service page..."
cat > docs/terms.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Three Steps - Terms of Service</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1 { color: #10b981; }
        h2 { color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
        .nav { background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .nav a { margin-right: 20px; color: #10b981; text-decoration: none; font-weight: 500; }
        .nav a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="nav">
        <a href="index.html">← Back to Home</a>
        <a href="privacy.html">Privacy Policy</a>
        <a href="support.html">Support</a>
    </div>
EOF

# Add Terms of Service content
echo "Converting Terms of Service..."
sed 's/^# /## /g; s/^## /### /g; s/^### /#### /g' TERMS_OF_SERVICE.md | \
sed 's/^- \*\*/• **/g; s/^- /• /g' | \
sed 's/\*\*\([^*]*\)\*\*/<strong>\1<\/strong>/g' | \
sed 's/`\([^`]*\)`/<code>\1<\/code>/g' | \
sed 's/^$/\<br\>/g' >> docs/terms.html

cat >> docs/terms.html << 'EOF'
</body>
</html>
EOF

# Create Support page
echo "📄 Creating Support page..."
cat > docs/support.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Three Steps - Support</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1 { color: #10b981; }
        h2 { color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
        .nav { background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .nav a { margin-right: 20px; color: #10b981; text-decoration: none; font-weight: 500; }
        .nav a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="nav">
        <a href="index.html">← Back to Home</a>
        <a href="privacy.html">Privacy Policy</a>
        <a href="terms.html">Terms of Service</a>
    </div>
    
    <h1>Three Steps Support</h1>
    
    <h2>Get Help</h2>
    <p>Need help with Three Steps? We're here to help!</p>
    
    <h3>Contact Us</h3>
    <ul>
        <li><strong>Email</strong>: support@threesteps.app</li>
        <li><strong>Response Time</strong>: Within 24 hours</li>
    </ul>
    
    <h3>Frequently Asked Questions</h3>
    
    <h4>How do I scan products?</h4>
    <p>Tap the "Start Grocery" button, then use the camera to scan barcodes or QR codes. You can also enter product information manually.</p>
    
    <h4>How do I set a spending limit?</h4>
    <p>When creating a new grocery session, you can set a spending limit. The app will track your total and alert you when approaching the limit.</p>
    
    <h4>Can I use the app offline?</h4>
    <p>Three Steps requires an internet connection to sync your data and access product information.</p>
    
    <h4>How do I delete my account?</h4>
    <p>Contact us at support@threesteps.app to request account deletion. All your data will be permanently removed within 30 days.</p>
    
    <h3>Privacy & Data</h3>
    <p>Your privacy is important to us. Read our <a href="privacy.html">Privacy Policy</a> to learn how we protect your data.</p>
    
    <p><em>Last updated: January 25, 2025</em></p>
</body>
</html>
EOF

echo "✅ Legal documents website created in ./docs/"
echo ""
echo "🚀 Next steps:"
echo "1. Push this to GitHub"
echo "2. Enable GitHub Pages in repository settings"
echo "3. Your legal documents will be available at:"
echo "   https://yourusername.github.io/your-repo-name/privacy.html"
echo "   https://yourusername.github.io/your-repo-name/terms.html"
echo ""
echo "📝 Update your App Store Connect with these URLs!"