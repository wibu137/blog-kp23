import AssistantChat from '../components/AssistantChat';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "AI Assistant | KP23's Blog",
  description:
    "Tro ly AI noi bo cua KP23's Blog su dung RAG, streaming va conversation memory.",
};

export default function AssistantPage() {
  return <AssistantChat />;
}
