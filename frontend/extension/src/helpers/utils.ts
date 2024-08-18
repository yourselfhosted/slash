export const getFaviconWithGoogleS2 = (url: string) => {
  try {
    const urlObject = new URL(url);
    return `https://formidable-scarlet-whale.faviconkit.com/${urlObject.hostname}/256`;
  } catch (error) {
    return undefined;
  }
};
