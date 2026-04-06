import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CodeSnippet {
  id: string;
  title: string;
  language: string;
  code: string;
  isCustom?: boolean;
}

const BUILTIN_SNIPPETS: CodeSnippet[] = [
  {
    id: "s1",
    title: "React useState",
    language: "tsx",
    code: "const [state, setState] = useState<Type>(initialValue);",
  },
  {
    id: "s2",
    title: "React useEffect",
    language: "tsx",
    code: "useEffect(() => {\n  // effect\n  return () => {\n    // cleanup\n  };\n}, [deps]);",
  },
  {
    id: "s3",
    title: "Arrow Function",
    language: "ts",
    code: "const myFunction = (param: Type): ReturnType => {\n  return result;\n};",
  },
  {
    id: "s4",
    title: "Try / Catch",
    language: "ts",
    code: "try {\n  // risky code\n} catch (error) {\n  console.error(error);\n} finally {\n  // cleanup\n}",
  },
  {
    id: "s5",
    title: "Async / Await",
    language: "ts",
    code: "const fetchData = async (): Promise<Data> => {\n  try {\n    const response = await fetch(url);\n    return await response.json();\n  } catch (error) {\n    throw new Error(`Failed: ${error}`);\n  }\n};",
  },
  {
    id: "s6",
    title: "For Loop",
    language: "ts",
    code: "for (let i = 0; i < array.length; i++) {\n  const item = array[i];\n  // process item\n}",
  },
  {
    id: "s7",
    title: "Console Log",
    language: "ts",
    code: "console.log('value:', value);",
  },
  {
    id: "s8",
    title: "Fetch API",
    language: "ts",
    code: "const response = await fetch('/api/endpoint', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify(data),\n});\nconst result = await response.json();",
  },
  {
    id: "s9",
    title: "React Component",
    language: "tsx",
    code: "import type React from 'react';\n\ninterface Props {\n  title: string;\n}\n\nexport const MyComponent: React.FC<Props> = ({ title }) => {\n  return (\n    <div>\n      <h1>{title}</h1>\n    </div>\n  );\n};",
  },
  {
    id: "s10",
    title: "ICP Actor Call",
    language: "ts",
    code: "const { actor } = useActor();\nconst result = await actor?.myMethod(args);\nif (result !== undefined) {\n  console.log('Success:', result);\n}",
  },
];

interface SnippetsStore {
  snippets: CodeSnippet[];
  addSnippet: (s: Omit<CodeSnippet, "id">) => void;
  removeSnippet: (id: string) => void;
}

export const useSnippetsStore = create<SnippetsStore>()(
  persist(
    (set) => ({
      snippets: BUILTIN_SNIPPETS,
      addSnippet: (s) => {
        const id = `custom_${Date.now().toString(36)}`;
        set((state) => ({ snippets: [...state.snippets, { ...s, id }] }));
      },
      removeSnippet: (id) =>
        set((state) => ({
          snippets: state.snippets.filter((s) => s.id !== id),
        })),
    }),
    { name: "codeveda-snippets" },
  ),
);
