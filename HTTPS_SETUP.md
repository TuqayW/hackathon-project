# 🔒 Running Locally with HTTPS

This guide will help you run your FinMate PWA locally with HTTPS, so you can test PWA features like "Add to Home Screen" on iOS.

## 🚀 Quick Start

### Step 1: Generate SSL Certificates

```bash
npm run setup-https
```

This will create self-signed SSL certificates in the `certificates/` directory.

### Step 2: Update Environment Variables

Update your `.env` file to use HTTPS:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/budgetpath?schema=public"
AUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="https://localhost:3000"
```

**Important**: Change `NEXTAUTH_URL` from `http://localhost:3000` to `https://localhost:3000`

### Step 3: Run with HTTPS

```bash
npm run dev:https
```

Your app will be available at: **https://localhost:3000**

### Step 4: Accept Security Warning

Since we're using self-signed certificates, your browser will show a security warning:

1. **Chrome/Edge**: Click "Advanced" → "Proceed to localhost (unsafe)"
2. **Firefox**: Click "Advanced" → "Accept the Risk and Continue"
3. **Safari**: Click "Show Details" → "visit this website"

This is **normal and safe** for local development.

---

## 📱 Testing PWA Features

Once running on HTTPS:

### iOS Safari (iPhone/iPad)

1. Make sure your iPhone/iPad is on the **same Wi-Fi network** as your computer
2. Find your computer's local IP address:
   - **Windows**: Run `ipconfig` and look for IPv4 Address
   - **macOS/Linux**: Run `ifconfig` or `ip addr`
3. On your iPhone/iPad, open Safari and go to: `https://YOUR_IP:3000`
   - Example: `https://192.168.1.100:3000`
4. Accept the security warning
5. Tap **Share** button → **"Add to Home Screen"**
6. Launch from home screen to see full-screen mode!

### Android Chrome

1. Connect to the same Wi-Fi network
2. Open Chrome and go to: `https://YOUR_IP:3000`
3. Accept security warning
4. Tap menu (three dots) → **"Add to Home Screen"**

### Desktop Testing

- Open Chrome DevTools (F12)
- Go to **Application** tab
- Check **Manifest** and **Service Workers**
- Run **Lighthouse** audit (PWA section)

---

## 🔧 Troubleshooting

### "SSL certificates not found" Error

Run the setup script again:
```bash
npm run setup-https
```

### "OpenSSL is not installed" Error

**Windows:**
1. Download OpenSSL from: https://slproweb.com/products/Win32OpenSSL.html
2. Install it and add to PATH
3. Restart your terminal

**macOS:**
```bash
brew install openssl
```

**Linux:**
```bash
sudo apt-get install openssl
```

### Can't Access from Mobile Device

1. **Check Firewall**: Make sure port 3000 is allowed
2. **Check IP Address**: Use your computer's local IP, not `localhost`
3. **Check Network**: Ensure both devices are on the same Wi-Fi
4. **Try HTTP First**: Test with `http://YOUR_IP:3000` to verify connectivity

### Service Worker Not Registering

1. Make sure you're using `npm run dev:https` (not `npm run dev`)
2. Check browser console for errors
3. Clear browser cache and reload
4. Verify you're accessing via HTTPS (check URL bar)

### NextAuth Not Working

Make sure `NEXTAUTH_URL` in `.env` is set to `https://localhost:3000` (not `http://`)

---

## 🎯 Alternative: Using mkcert (Trusted Certificates)

For a better experience without security warnings, you can use `mkcert`:

### Install mkcert

**Windows (with Chocolatey):**
```bash
choco install mkcert
```

**macOS:**
```bash
brew install mkcert
```

**Linux:**
```bash
sudo apt install libnss3-tools
# Then download from: https://github.com/FiloSottile/mkcert/releases
```

### Setup mkcert

```bash
# Install local CA
mkcert -install

# Generate certificates
mkcert localhost 127.0.0.1 ::1
```

This will create `localhost.pem` and `localhost-key.pem` in the current directory. Move them to the `certificates/` folder.

---

## 📝 Notes

- **Self-signed certificates** are fine for local development
- The `certificates/` directory is gitignored (won't be committed)
- PWA features **only work over HTTPS** (or localhost in some browsers)
- For production, use a hosting platform with automatic HTTPS (Vercel, Netlify, etc.)

---

## 🎉 You're All Set!

Your app is now running with HTTPS locally. You can test all PWA features including:
- ✅ Service Worker registration
- ✅ "Add to Home Screen" on iOS
- ✅ Offline functionality
- ✅ Full-screen app experience

