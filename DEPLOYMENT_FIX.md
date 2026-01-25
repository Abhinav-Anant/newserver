# Deployment Fix - PORT Variable Issue

## Problem
The repository was failing to deploy because the `package.json` start script contained:
```json
"start": "next start -p $PORT"
```

This caused issues because:
1. **Shell variable expansion**: The `$PORT` syntax doesn't reliably expand in npm scripts across different platforms
2. **Windows compatibility**: Windows uses `%PORT%` instead of `$PORT`
3. **Silent failures**: If the variable wasn't expanded, Next.js would try to start on a port literally named "$PORT"

## Solution
Changed the start script to:
```json
"start": "next start"
```

## How It Works Now
1. **PM2 Configuration** (`ecosystem.config.js`) sets the PORT environment variable:
   ```javascript
   env: {
     NODE_ENV: 'production',
     PORT: 3000
   }
   ```

2. **Next.js Automatically Reads PORT**: When `next start` runs, Next.js automatically reads the `PORT` environment variable if it exists, or defaults to 3000.

3. **Cross-platform Compatible**: This approach works on all platforms (Linux, macOS, Windows).

## Testing
To verify the fix works:

```bash
# Set PORT environment variable
export PORT=3000

# Run start command
npm run start
# Next.js will start on port 3000

# Without PORT set
npm run start
# Next.js will start on default port 3000
```

## Deployment
The deployment process remains the same:
```bash
sudo ./deploy.sh
```

The `deploy.sh` script:
1. Installs dependencies
2. Builds the application (`npm run build`)
3. Starts with PM2 using `ecosystem.config.js`
4. PM2 sets `PORT=3000` in the environment
5. `npm start` runs `next start` which reads `PORT` from the environment

## Related Files Changed
- `nextjs_space/package.json` - Fixed start script and updated Next.js version
- `nextjs_space/ecosystem.config.js` - Updated comment to reflect change
- `nextjs_space/package-lock.json` - Updated from dependency updates

## Verification
After deployment, verify the application is running:
```bash
pm2 status
pm2 logs leo-prime-firewall
curl http://localhost:3000
```
