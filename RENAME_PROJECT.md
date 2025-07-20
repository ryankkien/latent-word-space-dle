# Renaming the Project Folder

The project has been renamed from "Latent Word Space" to "LatentLetters" in all the code and configuration files. 

To complete the rename, you should also rename the project folder:

## Steps to Rename the Folder

```bash
# Navigate to the parent directory
cd ..

# Rename the folder
mv latent-word-space-dle latent-letters

# Navigate back into the project
cd latent-letters
```

## What Has Been Updated

✅ **Site Title**: Now shows "LatentLetters" everywhere
✅ **Package Name**: Updated in package.json
✅ **Share Text**: Updated to use #LatentLetters hashtag
✅ **Documentation**: README and other docs updated
✅ **Manifest**: Added PWA manifest with new name
✅ **Logo Component**: Created a stylized logo component

## Files Changed

- `index.html` - Page title and meta description
- `package.json` - Package name
- `src/components/DailyGame.tsx` - Share text and logo
- `src/components/Logo.tsx` - New logo component
- `public/manifest.json` - PWA manifest
- `README.md` - All references updated

## No Further Changes Needed

All internal references in the code have been updated. The game will work exactly the same with the new branding!