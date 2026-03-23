import { ASSISTANT_SYSTEM_PROMPT } from './constants';

export function buildPromptMessages({
  question,
  shortTermMemory,
  longTermMemory,
  documents,
  role,
}) {
  const documentBlock =
    documents.length > 0
      ? documents
          .map(
            (doc, index) =>
              `[Tai lieu ${index + 1}]\nTieu de: ${doc.title}\nNguon: ${doc.source}\nNoi dung: ${doc.content}`
          )
          .join('\n\n')
      : 'Khong tim thay tai lieu lien quan trong knowledge base.';

  return [
    {
      role: 'system',
      content: ASSISTANT_SYSTEM_PROMPT,
    },
    {
      role: 'system',
      content: `Vai tro truy cap hien tai: ${role}. Neu la user thuong, chi duoc phep dua tren tai lieu public.`,
    },
    {
      role: 'system',
      content: `Bo nho ngan han cua cuoc tro chuyen (toi da 100 tu): ${shortTermMemory || 'Chua co.'}`,
    },
    {
      role: 'system',
      content: `Bo nho dai han cua user (toi da 200 tu): ${longTermMemory || 'Chua co.'}`,
    },
    {
      role: 'user',
      content: `Cau hoi hien tai: ${question}\n\nTai lieu tham chieu:\n${documentBlock}\n\nHuong dan:\n- Chi tra loi tu noi dung tai lieu tham chieu.\n- Neu tai lieu khong co cau tra loi, hay noi "Minh chua thay thong tin nay trong knowledge base hien co.".\n- Neu can, co the neuon nguon bang tieu de tai lieu.`,
    },
  ];
}
