import React, { useState, useEffect } from "react";
import { showHUD, Clipboard, Detail, ActionPanel, Action, popToRoot, closeMainWindow } from "@raycast/api";
import OpenAI from 'openai';


const OPENAI_API_KEY = "";

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export default function Command() {
  const [rewrittenText, setRewrittenText] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchAndRewriteText() {
      try {
        const clipboardContent = await Clipboard.readText();
        if (!clipboardContent) {
          await showHUD("Clipboard is empty");
          setLoading(false);
          return;
        }

        const prompt = `grammar-fix: ${clipboardContent}`;

        const chatCompletion = await openai.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'gpt-3.5-turbo',
        });

        const text = chatCompletion.choices[0]?.message?.content;

        if (text) {
          setRewrittenText(text);
        } else {
          await showHUD("Failed to get a valid response from OpenAI");
        }
      } catch (error) {
        console.error("Error:", error);
        await showHUD("Failed to rewrite text");
      } finally {
        setLoading(false);
      }
    }

    fetchAndRewriteText();
  }, []);

  if (loading) {
    return <Detail markdown="Loading..." />;
  }

  if (!rewrittenText) {
    return <Detail markdown="Failed to get rewritten text." />;
  }

  return (
    <Detail
      markdown={rewrittenText}
      actions={
        <ActionPanel>
          <Action
            title="Copy to Clipboard"
            onAction={async () => {
              await Clipboard.copy(rewrittenText);
              await showHUD("Grammar fixed text copied to clipboard");
              popToRoot();
              closeMainWindow();
            }}
          />
        </ActionPanel>
      }
    />
  );
}
