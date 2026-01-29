import { memo } from "react";
import ReactMarkdown from 'react-markdown';

interface RichTextProps {
  text: string;
}

const Link: React.FC<React.JSX.IntrinsicElements['a']> = memo(({ href, children }) => {
  return <a href={href} target='_blank' rel="noopener noreferrer">{children}</a>;
});

const components: Partial<{ [TagName in keyof React.JSX.IntrinsicElements]: React.FunctionComponent<React.JSX.IntrinsicElements[TagName]> }> = {
  a: Link,
};

const RichText: React.FC<RichTextProps> = ({ text }) => {
  return (
    <ReactMarkdown components={components as any}>{text}</ReactMarkdown>
  );
};

export default RichText;
