/**
 * Generates meta tags for a given page title.
 * @param {string} title - The title of the page.
 * @returns {Array} An array containing the title and description meta tags.
 */
export function generateMeta(title: string) {
  return () => [
    { title: `${title} | iChatty` },
    {
      name: "description",
      content:
        "AI-powered therapy chat bot that helps track your mood and wellbeing",
    },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ];
}
