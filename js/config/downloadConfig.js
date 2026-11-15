// ---------------------------------------------------------------------------
// LinkFlow downloads — the ONE place to edit.
// Every download button on the site opens the LinkFlow project on GitHub, where
// the Windows installer and Android APK are published. To use another repo,
// change the two values below and run `node build.mjs`.
// ---------------------------------------------------------------------------
export const GITHUB_OWNER = 'Adhirajkr';
export const GITHUB_REPO = 'Linkflow';

// Shown in the "Built to Connect" section. Leave false until you decide the source is public.
export const SHOW_AS_OPEN_SOURCE = false;

export const repoUrl = () => `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`;
export const releasesUrl = () => `${repoUrl()}/releases`;
