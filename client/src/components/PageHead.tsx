import { useEffect } from "react";

interface PageHeadProps {
  title: string;
  description: string;
  path: string;
}

export function PageHead({ title, description, path }: PageHeadProps) {
  useEffect(() => {
    document.title = title;

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", description);
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:url", `https://calculate360.com${path}`, true);
    setMeta("og:type", "website", true);

    return () => {
      document.title = "Calculate 360";
    };
  }, [title, description, path]);

  return null;
}
